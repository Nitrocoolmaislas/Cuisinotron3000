#!/usr/bin/env python3
"""
termux_import.py — Cuisinotron3000
TUI Termux pour importer une recette (URL → JSON-LD schema.org/Recipe) et
la synchroniser directement sur Google Drive (recettes_clara_custom.json),
sans passer par le bookmarklet navigateur — inutilisable sur Android.

Reprend le pipeline de js/importer.js (parseRecipeJsonLd, _guessCategory)
et le fetch générique JSON-LD déjà utilisé par 750g_scraper.py.

INSTALL : pip install -r requirements-termux.txt
USAGE   : python termux_import.py [URL]
"""

import argparse
import json
import re
import ssl
import sys
import unicodedata
import urllib.error
import urllib.request

from bs4 import BeautifulSoup
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Confirm, IntPrompt, Prompt
from rich.table import Table

import termux_drive_sync as drive

console = Console()

CATEGORY_LABELS = {
    'repas': 'Repas chauds',
    'tartinade': 'Tartinades & Dips',
    'petitdej': 'Petits-déjeuners',
}

IMPORT_CATEGORY_HINTS = {
    'repas': ['plat', 'soupe', 'gratin', 'curry', 'wok', 'poêlée', 'risotto',
              'pasta', 'pâtes', 'viande', 'poisson', 'légumineuse', 'riz',
              'main', 'dinner', 'lunch'],
    'tartinade': ['tartinade', 'dip', 'houmous', 'hummus', 'tapenade', 'spread',
                  'sauce', 'condiment', 'entrée', 'apéro', 'guacamole'],
    'petitdej': ['petit-déjeuner', 'petit déjeuner', 'breakfast', 'porridge',
                 'muesli', 'granola', 'smoothie', 'pancake', 'crêpe', 'muffin'],
}

BROWSER_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.3',
}


# ── Fetch générique (JSON-LD schema.org/Recipe) ──────────────────────────

def _fetch_html(url):
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers=BROWSER_HEADERS)
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
    with opener.open(req, timeout=20) as resp:
        raw = resp.read()
    for enc in ('utf-8', 'latin-1', 'cp1252'):
        try:
            return raw.decode(enc)
        except UnicodeDecodeError:
            continue
    return raw.decode('utf-8', errors='replace')


def _find_recipe_ld(html):
    for tag in BeautifulSoup(html, 'html.parser').find_all('script', {'type': 'application/ld+json'}):
        try:
            data = json.loads(tag.string or '')
        except (json.JSONDecodeError, TypeError):
            continue
        for item in (data if isinstance(data, list) else [data]):
            t = item.get('@type')
            if t == 'Recipe' or (isinstance(t, list) and 'Recipe' in t):
                return item
            for g in item.get('@graph', []):
                gt = g.get('@type')
                if gt == 'Recipe' or (isinstance(gt, list) and 'Recipe' in gt):
                    return g
    return None


def _duration_minutes(iso):
    if not iso:
        return 0
    m = re.search(r'(?:(\d+)H)?(?:(\d+)M)?', str(iso))
    return (int(m.group(1) or 0) * 60 + int(m.group(2) or 0)) if m else 0


def _servings(y):
    if isinstance(y, list):
        y = y[0] if y else ''
    m = re.search(r'(\d+)', str(y))
    return int(m.group(1)) if m else 2


def _steps(instructions):
    out = []
    for s in instructions or []:
        if isinstance(s, str):
            if s.strip():
                out.append(s.strip())
        elif isinstance(s, dict):
            if s.get('@type') == 'HowToSection':
                for sub in s.get('itemListElement', []):
                    t = (sub.get('text') or sub.get('name', '')) if isinstance(sub, dict) else str(sub)
                    if t.strip():
                        out.append(t.strip())
            else:
                t = (s.get('text') or s.get('name', '')).strip()
                if t:
                    out.append(t)
    return out


def guess_category(title, keywords):
    hay = (title + ' ' + ' '.join(keywords)).lower()
    for cat, hints in IMPORT_CATEGORY_HINTS.items():
        if any(h in hay for h in hints):
            return cat
    return 'repas'


def slugify(text):
    text = unicodedata.normalize('NFD', text.lower())
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


def fetch_recipe(url):
    """Retourne un dict prêt pour la revue TUI, ou lève ValueError."""
    html = _fetch_html(url)
    ld = _find_recipe_ld(html)
    if not ld:
        raise ValueError("Aucune recette JSON-LD trouvée sur cette page (structure non supportée).")

    title = (ld.get('name') or '').strip()
    ingredients = [str(i).strip() for i in ld.get('recipeIngredient', []) if str(i).strip()]
    steps = _steps(ld.get('recipeInstructions', []))
    if not title:
        raise ValueError('Titre manquant dans le JSON-LD')
    if not ingredients:
        raise ValueError('Aucun ingrédient trouvé')
    if not steps:
        raise ValueError('Aucune étape trouvée')

    keywords = ld.get('keywords', [])
    if isinstance(keywords, str):
        keywords = [k.strip() for k in keywords.split(',')]

    return {
        'title': title,
        'description': (ld.get('description') or '').strip(),
        'ingredients': ingredients,
        'steps': steps,
        'servings': _servings(ld.get('recipeYield')),
        'prepTime': _duration_minutes(ld.get('prepTime')),
        'cookTime': _duration_minutes(ld.get('cookTime') or ld.get('totalTime')),
        'category': guess_category(title, keywords),
        'sourceUrl': ld.get('url') or url,
    }


# ── Revue / édition interactive ──────────────────────────────────────────

def _edit_list(items, label):
    while True:
        table = Table(title=label, show_header=True, header_style='bold cyan')
        table.add_column('#', width=3)
        table.add_column('Texte')
        for i, item in enumerate(items, 1):
            table.add_row(str(i), item)
        console.print(table)
        action = Prompt.ask(
            "[dim]entrée = garder tel quel · 'r N' = retirer la ligne N · 'a' = ajouter une ligne[/dim]",
            default='',
        )
        if not action:
            return items
        if action == 'a':
            new_line = Prompt.ask('Nouvelle ligne')
            if new_line.strip():
                items.append(new_line.strip())
            continue
        m = re.match(r'r\s*(\d+)', action)
        if m:
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(items):
                items.pop(idx)
            continue


def review_recipe(data):
    console.print(Panel.fit(f"[bold]{data['title']}[/bold]\n[dim]{data['sourceUrl']}[/dim]", title='📥 Recette importée'))

    data['title'] = Prompt.ask('Titre', default=data['title'])

    console.print('Catégorie : ' + ' / '.join(f"[{i+1}] {v}" for i, v in enumerate(CATEGORY_LABELS.values())))
    cat_keys = list(CATEGORY_LABELS.keys())
    default_idx = cat_keys.index(data['category']) + 1
    choice = IntPrompt.ask('Choix', default=default_idx, choices=[str(i + 1) for i in range(len(cat_keys))])
    data['category'] = cat_keys[choice - 1]

    data['prepTime'] = IntPrompt.ask('Prép. (min)', default=data['prepTime'])
    data['cookTime'] = IntPrompt.ask('Cuisson (min)', default=data['cookTime'])
    data['servings'] = IntPrompt.ask('Portions', default=data['servings'])

    data['ingredients'] = _edit_list(data['ingredients'], 'Ingrédients')
    data['steps'] = _edit_list(data['steps'], 'Étapes')

    return data


def to_cuisinotron_recipe(data):
    return {
        'id': slugify(data['title']),
        'custom': True,
        'imported': True,
        'sourceUrl': data['sourceUrl'],
        'category': data['category'],
        'categoryLabel': CATEGORY_LABELS[data['category']],
        'name': data['title'],
        'description': data['description'],
        'prepTime': data['prepTime'],
        'cookTime': data['cookTime'],
        'servings': data['servings'],
        'ingredients': data['ingredients'],
        'steps': data['steps'],
        'notes': f"Recette importée depuis {data['sourceUrl']}" if data['sourceUrl'] else None,
    }


# ── Main ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description='Import de recette Cuisinotron3000 → Google Drive (Termux)')
    parser.add_argument('url', nargs='?', help='URL de la recette (sinon demandée interactivement)')
    args = parser.parse_args()

    url = args.url or Prompt.ask('URL de la recette')

    try:
        with console.status('Récupération de la recette…'):
            data = fetch_recipe(url)
    except (ValueError, urllib.error.URLError) as e:
        console.print(f"[red]✖ {e}[/red]")
        sys.exit(1)

    data = review_recipe(data)

    if not Confirm.ask('Importer cette recette ?', default=True):
        console.print('[yellow]Annulé.[/yellow]')
        return

    recipe = to_cuisinotron_recipe(data)

    with console.status('Connexion à Google Drive…'):
        creds = drive.get_credentials()
        file_id, recipes = drive.load_custom_recipes(creds)

    existing = next((r for r in recipes if r.get('id') == recipe['id']), None)
    if existing:
        if not Confirm.ask(f"[yellow]Une recette '{recipe['id']}' existe déjà sur Drive — remplacer ?[/yellow]", default=False):
            console.print('[yellow]Annulé (doublon).[/yellow]')
            return
        recipes = [r for r in recipes if r.get('id') != recipe['id']]

    recipes.append(recipe)

    with console.status('Sauvegarde sur Google Drive…'):
        drive.save_custom_recipes(creds, file_id, recipes)

    console.print(f"[green]✅ '{recipe['name']}' synchronisée sur Drive ({len(recipes)} recettes custom au total).[/green]")


if __name__ == '__main__':
    main()
