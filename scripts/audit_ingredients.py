#!/usr/bin/env python3
"""
audit_ingredients.py — Diagnostic de résolution des ingrédients de recettes

Simule le pipeline JS de l'app pour identifier quels ingrédients ne trouvent
pas de correspondance dans la whitelist / CIQUAL, et pourquoi.

═══════════════════════════════════════════════════════════════════════
UTILISATION
═══════════════════════════════════════════════════════════════════════

  # Analyse les recettes statiques uniquement :
  python3 scripts/audit_ingredients.py

  # Avec les recettes custom exportées depuis l'app :
  python3 scripts/audit_ingredients.py --custom recettes_clara_custom.json

  # Afficher aussi les ingrédients résolus (verbose) :
  python3 scripts/audit_ingredients.py --custom recettes_clara_custom.json --verbose

  # Sauvegarder le rapport dans un fichier :
  python3 scripts/audit_ingredients.py --custom recettes_clara_custom.json > rapport.txt

COMMENT EXPORTER LES RECETTES CUSTOM :
  Dans l'app → onglet "Liste de courses" → bouton "Exporter Excel" ne donne
  pas les recettes. Utiliser à la place : ouvrir la console (F12) et taper :
    JSON.stringify(JSON.parse(localStorage.getItem('custom_recipes')||'[]'))
  Copier le résultat et sauvegarder dans un .json, ou utiliser la sync
  Google Drive (recettes_clara_custom.json).

═══════════════════════════════════════════════════════════════════════
CE QUE LE SCRIPT FAIT
═══════════════════════════════════════════════════════════════════════

Le pipeline réel de l'app pour chaque ingrédient brut (ex: "2 gousses d'ail") :
  1. parseIngredientString()  → extrait {qty, unit, rawName: "ail"}
  2. normIngredient(rawName)  → "ail"  (minuscules, sans accents, sans apostrophes)
  3. CANONICAL_MAP lookup     → résout les alias vagues ("filet d huile" → "huile d olive")
  4. WL_IDX lookup            → trouve l'entrée whitelist → .ciqual → clé CIQUAL
  5. getNutriData()           → cherche dans CIQUAL_FR

Ce script simule les étapes 1–4 en Python. Les ingrédients non résolus à
l'étape 4 sont ceux qui échouent dans l'app (coverage < 100%).

IMPORTANT — Limitations de la simulation :
  - La simulation ne joue pas le CANONICAL_MAP complet (il contient ~200 entrées
    en JS, certaines complexes). Des faux-négatifs peuvent apparaître.
  - Les ingrédients avec qty=0 ou unit inconnu comptent comme "résolus" ici mais
    donneront grams=0 dans l'app → non comptés dans le coverage UI.
  - Les ligatures (œ→oe, æ→ae) sont gérées comme dans le JS.

═══════════════════════════════════════════════════════════════════════
INTERPRÉTER LES RÉSULTATS
═══════════════════════════════════════════════════════════════════════

  [12x] curry     ← "Curry"          → absent de la whitelist → ajouter l'entrée
  [ 3x] bouillon  ← "2 L de bouillon"→ alias manquant → ajouter à bouillon cube fond
  [ 1x] b uf      ← "bœuf haché"    → artefact de la simulation (ligature œ gérée
                                        dans le vrai JS, pas ici) → ignorer

Catégories d'erreurs courantes :
  A. Aliment absent de la whitelist → ajouter une nouvelle entrée
  B. Alias manquant sur une entrée existante → ajouter à e['aliases']
  C. Forme adjectivale bloquante ("oignon frais") → ajouter l'alias
  D. Artefact de simulation → chaînes tronquées avec \\", ligatures mal gérées
  E. Non-aliment volontaire (sel, poivre, eau) → ignorer

═══════════════════════════════════════════════════════════════════════
"""

import argparse
import json
import re
import sys
import unicodedata
from collections import defaultdict

REPO_ROOT = __import__('os').path.dirname(__import__('os').path.dirname(__import__('os').path.abspath(__file__)))

# ── Reproduce normIngredient() from utils.js ─────────────────────────────────

def norm(s):
    """Mirrors normIngredient() in js/utils.js exactly."""
    if not s:
        return ''
    # Ligatures (NFD doesn't decompose these)
    s = s.replace('œ', 'oe').replace('æ', 'ae')
    # Apostrophes → removed (same as JS)
    s = re.sub(r"[‘’‚‛′`''`]", '', s)
    s = s.lower()
    # Accents via NFD
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    # Non-alphanumeric → space
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def depluralize(s):
    """Strip trailing 's' from each word (>3 chars)."""
    return ' '.join(w[:-1] if w.endswith('s') and len(w) > 3 else w for w in s.split())


# ── Minimal parseIngredientString — extract rawName only ─────────────────────
# Units listed longest-first to avoid partial matches (gousses before g)
_UNITS = '|'.join(sorted([
    r'c\.\s*[àa]\s*soupe', r'c\.\s*[àa]\s*caf[ée]',
    r'cuill[èe]res?\s*[àa]\s*soupe', r'cuill[èe]res?\s*[àa]\s*caf[ée]',
    r'cuill[èe]re', r'gousses', r'gousse',
    r'boîtes', r'boîte', r'boites', r'boite',
    r'sachets', r'sachet', r'tranches', r'tranche',
    r'feuilles', r'feuille', r'brins', r'brin',
    r'pincées', r'pincée', r'pincee',
    r'poignées', r'poignée', r'poignee',
    r'louches', r'louche', r'paquets', r'paquet',
    r'boules', r'boule', r'cubes', r'cube',
    r'conserves', r'conserve', r'pots', r'pot',
    r'verres?', r'tasses?', r'bols?',
    r'càs', r'càc', r'noix\s+de',
    r'kg', r'ml', r'cl', r'dl', r'[lL]', r'g',
], key=lambda x: -len(x)))

_QTY_UNIT_RE = re.compile(
    r'^\s*(?:\d+\s*/\s*\d+|\d+[.,]\d+|\d+\s*[–\-]\s*\d+|\d+)?\s*'
    r'(?:(?:' + _UNITS + r')\s*)?'
    r'(?:d[e\']\s*(?:la\s+|l[\'e]\s+|du\s+|des\s+)?|de\s+(?:la\s+|l[\'e]\s+|du\s+|des\s+)?|d\'\s*)?',
    re.IGNORECASE
)

def extract_name(raw):
    """Extract ingredient name from a raw recipe string, mirroring parseIngredientString."""
    s = _QTY_UNIT_RE.sub('', raw).strip()
    s = re.sub(r'^\d+\s+', '', s).strip()           # leading bare number
    s = re.split(r'\s*,\s*', s)[0]                   # strip ", haché" etc.
    s = re.sub(r'\s*\([^)]*\)', '', s).strip()        # strip parentheticals
    # Strip trailing prep adjectives
    s = re.sub(
        r'\s+(hach[ée][e]?s?|[ée]minc[ée][e]?s?|coup[ée][e]?s?|r[âa]p[ée][e]?s?|'
        r'pel[ée][e]?s?|[ée]goutt[ée][e]?s?|lav[ée][e]?s?|[ée]cras[ée][e]?s?'
        r'|cuit[e]?s?|cru[e]?s?|surgel[ée][e]?s?)$',
        '', s, flags=re.IGNORECASE
    ).strip()
    return s


# ── Load data files ──────────────────────────────────────────────────────────

def load_wl_idx():
    with open(f'{REPO_ROOT}/data/whitelist_canonique.js') as f:
        src = f.read()
    m = re.search(r'const WL_IDX = (\{.*?\});', src, re.DOTALL)
    return json.loads(m.group(1))


def load_canon_keys():
    with open(f'{REPO_ROOT}/js/utils.js') as f:
        src = f.read()
    return set(re.findall(r"'([a-z0-9 ]{3,})':\s*\{", src))


def load_static_ingredients():
    with open(f'{REPO_ROOT}/js/recipes.js') as f:
        src = f.read()
    result, in_ing = [], False
    for line in src.split('\n'):
        if re.search(r'ingredients\s*:', line):
            in_ing = True
        elif in_ing and re.search(r'(steps|notes)\s*:', line):
            in_ing = False
        elif in_ing:
            m = re.search(r"'([^']{4,120})'", line)
            if m:
                result.append(m.group(1))
    return result


def load_custom_ingredients(path):
    with open(path) as f:
        data = json.load(f)
    recipes = data.get('customRecipes', data) if isinstance(data, dict) else data
    return [i for r in recipes for i in r.get('ingredients', [])]


# ── Non-food filter ───────────────────────────────────────────────────────────

NON_FOOD = {
    'sel', 'poivre', 'eau', 'fleur de sel', 'sel fin', 'sel et poivre',
    'poivre noir', 'poivre du moulin', 'eau de cuisson', 'eau tiede',
    'eau chaude', 'eau froide', 'sel poivre', 'poivre blanc',
    'sel et poivre du moulin',
}


# ── Resolution ───────────────────────────────────────────────────────────────

def resolve(raw, wl_idx, canon_keys):
    name = extract_name(raw)
    if not name or len(name) < 2:
        return None, 'too_short'
    n = norm(name)
    if not n or len(n) < 2:
        return None, 'too_short'
    if n in NON_FOOD:
        return n, 'non_food'
    dep = depluralize(n)
    hit = wl_idx.get(n) or (n in canon_keys) or wl_idx.get(dep) or (dep in canon_keys)
    if hit:
        return n, 'resolved'
    return n, 'unresolved'


# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Audit ingredient resolution against whitelist/CIQUAL',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('--custom', metavar='FILE',
                        help='Path to exported custom recipes JSON')
    parser.add_argument('--verbose', action='store_true',
                        help='Also list resolved ingredients')
    parser.add_argument('--min-freq', type=int, default=1, metavar='N',
                        help='Only show unresolved items appearing ≥N times (default: 1)')
    args = parser.parse_args()

    wl_idx    = load_wl_idx()
    canon_keys = load_canon_keys()

    all_ings = load_static_ingredients()
    sources  = [('static', i) for i in all_ings]

    if args.custom:
        custom = load_custom_ingredients(args.custom)
        sources += [('custom', i) for i in custom]

    unresolved: dict[str, list[str]] = defaultdict(list)
    resolved_count = non_food_count = skip_count = 0

    for source, raw in sources:
        n, status = resolve(raw, wl_idx, canon_keys)
        if status == 'resolved':
            resolved_count += 1
            if args.verbose:
                print(f'  OK  [{source}] {n:40s}  ← "{raw[:60]}"')
        elif status == 'non_food':
            non_food_count += 1
        elif status == 'too_short':
            skip_count += 1
        else:  # unresolved
            if raw not in unresolved[n]:
                unresolved[n].append(raw)

    total = resolved_count + non_food_count + len(sum(unresolved.values(), []))
    print(f'\n{"="*60}')
    print(f'RÉSUMÉ  ({len(sources)} ingrédients bruts)')
    print(f'{"="*60}')
    print(f'  Résolus         : {resolved_count}')
    print(f'  Non-aliments    : {non_food_count}  (sel, poivre, eau…)')
    print(f'  Non résolus     : {sum(len(v) for v in unresolved.values())} '
          f'occurrences / {len(unresolved)} uniques')
    print()

    filtered = {k: v for k, v in unresolved.items() if len(v) >= args.min_freq}
    print(f'NON RÉSOLUS (freq ≥ {args.min_freq}) — {len(filtered)} entrées uniques\n')

    for norm_key, examples in sorted(filtered.items(), key=lambda x: -len(x[1])):
        freq = len(examples)
        ex   = examples[0][:70]
        print(f'  [{freq:3d}x]  {norm_key:45s}  ← "{ex}"')

    print(f'\n→ Pour chaque ligne : vérifier si la clé normalisée est dans WL_IDX')
    print(f'  (data/whitelist_canonique.js) ou dans CANONICAL_MAP (js/utils.js).')
    print(f'  Si non : ajouter un alias à une entrée existante, ou créer une')
    print(f'  nouvelle entrée avec scripts/patch_usda.py comme modèle.')


if __name__ == '__main__':
    main()
