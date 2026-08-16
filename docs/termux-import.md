# Import de recettes depuis Termux (Android)

Contournement pour importer des recettes quand le navigateur mobile est
inutilisable (bookmarklet non supporté, panel d'import bloqué...). Le script
`termux_import.py` récupère une recette (JSON-LD schema.org) depuis n'importe
quelle URL et l'écrit directement dans `recettes_clara_custom.json` sur
Google Drive, comme le ferait `js/importer.js` + `js/drive.js` dans le
navigateur.

## 1. Installer Termux + Python

```bash
# Termux depuis F-Droid (pas le Play Store, build obsolète)
pkg update && pkg upgrade
pkg install python
```

## 2. Récupérer le projet et installer les dépendances

```bash
git clone https://github.com/Nitrocoolmaislas/Cuisinotron3000.git
cd Cuisinotron3000
pip install -r requirements-termux.txt
```

## 3. Créer un client OAuth "Desktop app"

Le client Web (`GOOGLE_CLIENT_ID` dans `js/drive.js`) utilise le scope
`drive.file`, qui ne rend visibles que les fichiers créés par CE client —
un script Python avec un autre client OAuth ne verrait donc pas le
`recettes_clara_custom.json` déjà créé par l'app web. Ce script utilise
donc le scope complet `drive` (accès à tous les fichiers Drive de
l'utilisateur) avec un client OAuth dédié :

1. [Google Cloud Console](https://console.cloud.google.com/) → sélectionner
   le même projet que celui utilisé pour `GOOGLE_CLIENT_ID`.
2. **APIs & Services → Identifiants → Créer des identifiants → ID client
   OAuth**.
3. Type d'application : **Application de bureau** (pas "Web application").
4. Télécharger le JSON généré, le placer sur le téléphone dans :
   `~/.config/cuisinotron/client_secret.json`
5. Si l'app OAuth est en mode "Test" (écran de consentement), ajouter ton
   propre compte Google comme utilisateur test — sinon la connexion échoue.

## 4. Premier lancement (authentification)

```bash
python termux_import.py https://www.marmiton.org/recettes/recette_...
```

Le script ouvre une URL Google (imprimée dans le terminal si aucun
navigateur ne se lance automatiquement). Ouvre-la dans le navigateur du
téléphone, connecte-toi, accepte — le navigateur redirige ensuite vers
`http://127.0.0.1:<port>`, capté localement par le script (même appareil,
donc pas de configuration réseau particulière). Le token est mis en cache
dans `~/.config/cuisinotron/token.json` : les lancements suivants ne
redemandent pas de connexion.

## 5. Usage

```bash
python termux_import.py                                    # demande l'URL
python termux_import.py "https://www.750g.com/...-r12345.htm"  # directe
```

Le script affiche la recette parsée (titre, catégorie, ingrédients,
étapes), permet de les corriger (`r N` pour retirer une ligne, `a` pour en
ajouter), puis synchronise sur Drive. Elle apparaît ensuite dans l'app web
au prochain `loadFromDrive()` (connexion Drive ou rechargement de page).

## Limites

- Fonctionne pour les sites exposant du JSON-LD `schema.org/Recipe`
  (la quasi-totalité des sites de recettes modernes, dont Marmiton et
  750g.com). Sites sans JSON-LD → non supportés par ce script (utiliser
  l'import manuel JSON-LD du panel web à la place).
- Le scope `drive` donne accès à l'ensemble du Drive du compte, pas
  seulement aux fichiers Cuisinotron3000 — c'est un compromis nécessaire
  pour retrouver un fichier créé par un autre client OAuth (voir §3).
