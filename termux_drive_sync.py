#!/usr/bin/env python3
"""
termux_drive_sync.py — Cuisinotron3000
Accès direct à recettes_clara_custom.json sur Google Drive depuis Termux
(sans navigateur mobile). Utilisé par termux_import.py.

Contrairement à js/drive.js (scope drive.file, client OAuth Web utilisé
depuis la page), ce script tourne en headless CLI et a besoin de voir un
fichier déjà créé par un AUTRE client OAuth (le client Web de l'app) :
le scope drive.file ne suffit pas (il ne donne accès qu'aux fichiers créés
par le client qui les a créés). On utilise donc le scope complet `drive`,
avec un client OAuth "Desktop app" dédié — voir docs/termux-import.md.

INSTALL : pip install google-auth google-auth-oauthlib requests
"""

import json
import os
from pathlib import Path

import requests
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/drive']
DRIVE_CUSTOMS_FILE = 'recettes_clara_custom.json'

CONFIG_DIR = Path(os.environ.get('CUISINOTRON_CONFIG_DIR', Path.home() / '.config' / 'cuisinotron'))
CLIENT_SECRET_PATH = CONFIG_DIR / 'client_secret.json'
TOKEN_PATH = CONFIG_DIR / 'token.json'

DRIVE_API = 'https://www.googleapis.com/drive/v3/files'
DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3/files'


def get_credentials():
    """Auth OAuth2 (Desktop flow). Réutilise/rafraîchit le token en cache."""
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    creds = None
    if TOKEN_PATH.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not CLIENT_SECRET_PATH.exists():
                raise FileNotFoundError(
                    f"Client OAuth introuvable : {CLIENT_SECRET_PATH}\n"
                    "Voir docs/termux-import.md pour créer un client OAuth 'Desktop app' "
                    "et y placer le client_secret.json."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET_PATH), SCOPES)
            creds = flow.run_local_server(port=0, open_browser=True)
        TOKEN_PATH.write_text(creds.to_json())

    return creds


def _headers(creds):
    return {'Authorization': f'Bearer {creds.token}'}


def find_file_by_name(creds, name):
    r = requests.get(
        DRIVE_API,
        params={'q': f"name='{name}' and trashed=false", 'fields': 'files(id)'},
        headers=_headers(creds),
        timeout=20,
    )
    r.raise_for_status()
    files = r.json().get('files', [])
    return files[0]['id'] if files else None


def fetch_file(creds, file_id):
    r = requests.get(f'{DRIVE_API}/{file_id}', params={'alt': 'media'}, headers=_headers(creds), timeout=20)
    r.raise_for_status()
    return r.json()


def save_file(creds, file_id, file_name, data):
    body = json.dumps(data, ensure_ascii=False)
    if not file_id:
        meta = requests.post(
            DRIVE_API, headers={**_headers(creds), 'Content-Type': 'application/json'},
            json={'name': file_name}, timeout=20,
        )
        meta.raise_for_status()
        file_id = meta.json()['id']
    r = requests.patch(
        f'{DRIVE_UPLOAD_API}/{file_id}',
        params={'uploadType': 'media'},
        headers={**_headers(creds), 'Content-Type': 'application/json'},
        data=body.encode('utf-8'),
        timeout=30,
    )
    r.raise_for_status()
    return file_id


def load_custom_recipes(creds):
    """Renvoie (file_id, liste_recettes). file_id est None si le fichier n'existe pas encore."""
    file_id = find_file_by_name(creds, DRIVE_CUSTOMS_FILE)
    if not file_id:
        return None, []
    data = fetch_file(creds, file_id)
    return file_id, data.get('customRecipes', []) if isinstance(data, dict) else []


def save_custom_recipes(creds, file_id, recipes):
    import time
    data = {'customRecipes': recipes, 'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%S')}
    return save_file(creds, file_id, DRIVE_CUSTOMS_FILE, data)
