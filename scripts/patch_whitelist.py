#!/usr/bin/env python3
"""
patch_whitelist.py — Workflow 100% de couverture CIQUAL

Identifie les ingrédients non résolus dans les recettes et propose
(ou applique automatiquement) les alias manquants dans la whitelist.

═══════════════════════════════════════════════════════════════════════
USAGE
═══════════════════════════════════════════════════════════════════════

  # Analyser + afficher les suggestions (sans modifier)
  python3 scripts/patch_whitelist.py [--custom FILE.json]

  # Appliquer automatiquement les correspondances à haute confiance
  python3 scripts/patch_whitelist.py [--custom FILE.json] --auto

  # Sauvegarder les suggestions dans un fichier JSON pour révision
  python3 scripts/patch_whitelist.py [--custom FILE.json] --output suggestions.json

  # Appliquer des suggestions préalablement sauvegardées / modifiées
  python3 scripts/patch_whitelist.py --apply suggestions.json

  # Exporter les recettes custom depuis l'app (console F12) :
  #   JSON.stringify(JSON.parse(localStorage.getItem('custom_recipes')||'[]'))
  # Sauvegarder dans un .json, passer avec --custom

═══════════════════════════════════════════════════════════════════════
ALGORITHME DE CORRESPONDANCE
═══════════════════════════════════════════════════════════════════════

  HAUTE confiance  — la clé non résolue COMMENCE par une clé WL_IDX
    ex: "huile dolive de bonne qualite" commence par "huile dolive"
    → ajouter comme alias de "huile dolive" sans intervention humaine

  MOYENNE confiance — la clé non résolue contient en mots > 60 % de
    recouvrement (Jaccard) avec une clé WL_IDX (après dépluralization)
    ex: "poivrons rouges frais" ↔ "poivron rouge"

  AUCUNE correspondance → création d'une nouvelle entrée nécessaire
    (à faire manuellement, cf. scripts/patch_usda.py pour le modèle)

═══════════════════════════════════════════════════════════════════════
WORKFLOW COMPLET APRÈS IMPORT DE NOUVELLES RECETTES
═══════════════════════════════════════════════════

  1. Exporter les recettes custom : F12 → console → copier
  2. python3 scripts/patch_whitelist.py --custom nouvelles.json --auto
  3. Réviser les MOYEN dans le rapport affiché
  4. Pour les "AUCUNE" : créer l'entrée whitelist manuellement ou via
       python3 scripts/patch_usda.py (si données USDA disponibles)
  5. Recommencer au step 2 jusqu'à 0 non-résolus
═══════════════════════════════════════════════════════════════════════
"""

import argparse
import json
import os
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WL_PATH   = os.path.join(REPO_ROOT, 'data', 'whitelist_canonique.js')

# ── normIngredient en Python (miroir de utils.js) ────────────────────

def norm(s):
    if not s:
        return ''
    s = s.replace('œ', 'oe').replace('Œ', 'oe').replace('æ', 'ae').replace('Æ', 'ae')
    s = re.sub(r"[''‚‛′`]", '', s)
    s = s.lower()
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s


def deplur(w):
    return w[:-1] if w.endswith('s') and len(w) > 3 else w


# ── Chargement de la whitelist ────────────────────────────────────────

def load_whitelist():
    with open(WL_PATH) as f:
        src = f.read()
    m = re.search(r'const WHITELIST = (\[.*?\]);', src, re.DOTALL)
    return json.loads(m.group(1))


def load_wl_idx():
    with open(WL_PATH) as f:
        src = f.read()
    m = re.search(r'const WL_IDX = (\{.*?\});', src, re.DOTALL)
    return json.loads(m.group(1))


# ── Audit via Node.js (parser réel) ──────────────────────────────────

_AUDIT_JS = r"""
const fs = require('fs');
let src;

src = fs.readFileSync('%WL%', 'utf8').replace(/^(const|let)\s+/gm, 'var ');
eval(src);
src = fs.readFileSync('%UTILS%', 'utf8').replace(/^(const|let)\s+/gm, 'var ');
eval(src);
var DISCRIMINANTS_GLOBAUX = undefined;
src = fs.readFileSync('%PARSER%', 'utf8').replace(/^(const|let)\s+/gm, 'var ');
eval(src);
src = fs.readFileSync('%RECIPES%', 'utf8').replace(/^(const|let)\s+/gm, 'var ');
eval(src);

var allIng = [];
for (var r of RECIPES) for (var i of (r.ingredients||[])) allIng.push(i);
%CUSTOM_BLOCK%

var NON_FOOD = new Set(['sel','poivre','eau','fleur de sel','sel fin','sel et poivre',
  'poivre noir','poivre du moulin','eau de cuisson','eau tiede','eau chaude','eau froide',
  'sel poivre','poivre blanc','sel et poivre du moulin']);

var unresolved = {}, resolved = 0, nonfood = 0;
for (var raw of allIng) {
  var p = parseIngredientString(raw);
  var rn = p.rawName || '';
  if (!rn || rn.length < 2) continue;
  var key = normIngredient(rn);
  if (!key || key.length < 2) continue;
  if (NON_FOOD.has(key)) { nonfood++; continue; }
  var hit = WL_IDX[key] || WL_IDX[key.replace(/s$/,'')];
  if (hit) { resolved++; continue; }
  if (!unresolved[key]) unresolved[key] = [];
  if (unresolved[key].length < 3) unresolved[key].push(raw);
}

var total = resolved + nonfood + Object.values(unresolved).reduce((s,v)=>s+v.length,0);
process.stdout.write(JSON.stringify({
  total: total, resolved: resolved, nonfood: nonfood,
  unresolved: unresolved
}));
"""


def run_node_audit(custom_path=None):
    custom_block = ''
    if custom_path:
        custom_block = (
            "var customRaw = fs.readFileSync(%s,'utf8');\n"
            "var customData = JSON.parse(customRaw);\n"
            "var crs = Array.isArray(customData)?customData:(customData.customRecipes||[]);\n"
            "for (var cr of crs) for (var ci of (cr.ingredients||[])) allIng.push(ci);"
        ) % json.dumps(custom_path)

    script = (_AUDIT_JS
              .replace('%WL%', WL_PATH)
              .replace('%UTILS%', os.path.join(REPO_ROOT, 'js', 'utils.js'))
              .replace('%PARSER%', os.path.join(REPO_ROOT, 'js', 'ingredientParser.js'))
              .replace('%RECIPES%', os.path.join(REPO_ROOT, 'js', 'recipes.js'))
              .replace('%CUSTOM_BLOCK%', custom_block))

    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.js', mode='w', delete=False) as f:
        f.write(script)
        tmp = f.name
    try:
        result = subprocess.run(['node', tmp], capture_output=True, text=True, timeout=30)
        if result.returncode != 0:
            print('Node.js error:', result.stderr[:200], file=sys.stderr)
            return None
        return json.loads(result.stdout)
    except (subprocess.TimeoutExpired, json.JSONDecodeError) as e:
        print(f'Node.js audit failed: {e}', file=sys.stderr)
        return None
    finally:
        os.unlink(tmp)


# ── Algorithme de correspondance ──────────────────────────────────────

def find_match(key, wl_idx):
    """
    Returns (target_canonical_key, confidence, match_type) or (None, None, None).

    confidence: 'HIGH' | 'MEDIUM' | 'LOW'
    match_type: description of how the match was found
    """
    words      = key.split()
    dep_words  = [deplur(w) for w in words]

    # 1. Prefix match (try shorter and shorter prefixes of unresolved key)
    for n in range(len(words), 0, -1):
        for wset in [words, dep_words]:
            prefix = ' '.join(wset[:n])
            if prefix in wl_idx:
                if n == len(words):
                    # Exact match (shouldn't happen here, means it IS resolved)
                    return wl_idx[prefix], 'HIGH', 'exact'
                tail  = ' '.join(words[n:])
                conf  = 'HIGH' if n >= max(1, len(words) - 2) else 'MEDIUM'
                return wl_idx[prefix], conf, f'prefix({n}/{len(words)}) tail="{tail}"'

    # 2. Jaccard over depluralized words vs WL_IDX keys
    dep_set = set(dep_words)
    best_score, best_key = 0.0, None
    for wk in wl_idx:
        wk_words = set(deplur(w) for w in wk.split())
        inter    = dep_set & wk_words
        union    = dep_set | wk_words
        if not union:
            continue
        score = len(inter) / len(union)
        if score > best_score:
            best_score, best_key = score, wk
    if best_score >= 0.60:
        conf = 'HIGH' if best_score >= 0.85 else 'MEDIUM'
        return wl_idx[best_key], conf, f'jaccard={best_score:.2f} via "{best_key}"'
    if best_score >= 0.35:
        return wl_idx[best_key], 'LOW', f'jaccard={best_score:.2f} via "{best_key}"'

    return None, None, None


# ── Reconstruction WL_IDX ─────────────────────────────────────────────

def rebuild_wl_idx(whitelist):
    idx = {}
    for entry in whitelist:
        k = entry['k']
        idx[norm(k)] = k
        for alias in entry.get('aliases', []):
            n = norm(alias)
            if n and n not in idx:
                idx[n] = k
    return idx


# ── Application des alias ─────────────────────────────────────────────

def apply_aliases(suggestions):
    """
    suggestions : list of {unresolved_key, target_canonical, raw_example}
    Adds unresolved_key as alias in the matching whitelist entry, rebuilds WL_IDX.
    """
    wl = load_whitelist()
    entry_map = {e['k']: e for e in wl}
    applied, skipped = [], []

    for s in suggestions:
        unresolved = s['unresolved_key']
        target     = s['target_canonical']
        if target not in entry_map:
            print(f'  SKIP (entry not found): {target}', file=sys.stderr)
            skipped.append(s)
            continue
        entry    = entry_map[target]
        existing = set(norm(a) for a in entry.get('aliases', []))
        if norm(unresolved) not in existing and norm(entry['k']) != norm(unresolved):
            entry.setdefault('aliases', []).append(unresolved)
            applied.append(s)
        else:
            skipped.append(s)

    if not applied:
        print('Aucun alias à ajouter.')
        return 0

    # Rebuild WL_IDX
    new_idx = rebuild_wl_idx(wl)

    # Write back
    with open(WL_PATH) as f:
        src = f.read()

    wl_json  = json.dumps(wl, ensure_ascii=False, indent=2, separators=(',', ': '))
    idx_json = json.dumps(new_idx, ensure_ascii=False)
    src      = re.sub(r'const WHITELIST = \[.*?\];', f'const WHITELIST = {wl_json};',
                      src, flags=re.DOTALL)
    src      = re.sub(r'const WL_IDX = \{.*?\};', f'const WL_IDX = {idx_json};',
                      src, flags=re.DOTALL)
    with open(WL_PATH, 'w') as f:
        f.write(src)

    print(f'\n  ✓ {len(applied)} alias ajouté(s) — WL_IDX : {len(new_idx)} clés')
    for s in applied:
        print(f'    "{s["unresolved_key"]}" → {s["target_canonical"]}')
    return len(applied)


# ── Main ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description='Workflow 100% couverture CIQUAL — patch whitelist',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument('--custom', metavar='FILE',
                        help='Recettes custom exportées (JSON)')
    parser.add_argument('--auto', action='store_true',
                        help='Appliquer automatiquement les correspondances HIGH')
    parser.add_argument('--output', metavar='FILE',
                        help='Sauvegarder les suggestions dans un JSON')
    parser.add_argument('--apply', metavar='FILE',
                        help='Appliquer des suggestions depuis un JSON (--output précédent)')
    args = parser.parse_args()

    # ── Mode --apply ──────────────────────────────────────────────────
    if args.apply:
        with open(args.apply) as f:
            suggestions = json.load(f)
        print(f'Application de {len(suggestions)} suggestions depuis {args.apply}…')
        apply_aliases(suggestions)
        return

    # ── Audit ─────────────────────────────────────────────────────────
    print('Audit en cours (Node.js)…', end=' ', flush=True)
    data = run_node_audit(args.custom)
    if data is None:
        print('ERREUR — Node.js indisponible', file=sys.stderr)
        sys.exit(1)

    total      = data['total']
    resolved   = data['resolved']
    nonfood    = data['nonfood']
    unresolved = data['unresolved']  # {norm_key: [raw_example, ...]}

    coverage = round(resolved / total * 100) if total else 0
    print(f'OK')
    print(f'\n{"="*60}')
    print(f'Couverture actuelle : {resolved}/{total} = {coverage}%')
    print(f'Non-aliments (sel/poivre/eau) : {nonfood}')
    print(f'Non résolus : {sum(len(v) for v in unresolved.values())} '
          f'occurrences / {len(unresolved)} clés uniques')
    print(f'{"="*60}\n')

    if not unresolved:
        print('✓ Couverture 100% — rien à faire !')
        return

    # ── Matching ──────────────────────────────────────────────────────
    wl_idx = load_wl_idx()

    suggestions_high, suggestions_med, suggestions_low, need_new = [], [], [], []

    for ukey, examples in sorted(unresolved.items(), key=lambda x: -len(x[1])):
        freq      = len(examples)
        raw_ex    = examples[0]
        target, conf, match_type = find_match(ukey, wl_idx)

        record = {
            'unresolved_key':   ukey,
            'target_canonical': target,
            'confidence':       conf,
            'match_type':       match_type,
            'freq':             freq,
            'raw_example':      raw_ex,
        }

        if conf == 'HIGH':
            suggestions_high.append(record)
        elif conf == 'MEDIUM':
            suggestions_med.append(record)
        elif conf == 'LOW':
            suggestions_low.append(record)
        else:
            need_new.append(record)

    # ── Affichage ─────────────────────────────────────────────────────
    def print_section(title, items, color=''):
        if not items:
            return
        print(f'{title} ({len(items)})')
        for s in items:
            freq_tag = f'[{s["freq"]}x]' if s['freq'] > 1 else '[ 1x]'
            target   = s['target_canonical'] or '—'
            mt       = f'  ({s["match_type"]})' if s.get('match_type') else ''
            print(f'  {freq_tag}  {s["unresolved_key"]:<45}→ {target}{mt}')
            print(f'         ex: "{s["raw_example"][:70]}"')
        print()

    print_section('HAUTE confiance  (--auto les applique)', suggestions_high)
    print_section('MOYENNE confiance (révision recommandée)',  suggestions_med)
    print_section('FAIBLE confiance  (vérifier avant)',       suggestions_low)

    if need_new:
        print(f'AUCUNE correspondance — nouvelle entrée requise ({len(need_new)})')
        for s in need_new:
            freq_tag = f'[{s["freq"]}x]' if s['freq'] > 1 else '[ 1x]'
            print(f'  {freq_tag}  {s["unresolved_key"]:<45}← "{s["raw_example"][:60]}"')
        print()

    # Résumé
    gain = len(suggestions_high) + len(suggestions_med) + len(suggestions_low)
    print(f'Potentiel restant : +{gain} ingrédients résolvables par alias')
    print(f'Nouveaux aliments (entrée manuelle) : {len(need_new)}')
    print()

    # ── --output ──────────────────────────────────────────────────────
    all_suggestions = suggestions_high + suggestions_med + suggestions_low
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(all_suggestions, f, ensure_ascii=False, indent=2)
        print(f'Suggestions sauvegardées dans {args.output}')
        print(f'Éditer le fichier si besoin, puis :')
        print(f'  python3 scripts/patch_whitelist.py --apply {args.output}')
        print()

    # ── --auto ────────────────────────────────────────────────────────
    if args.auto:
        if suggestions_high:
            print(f'Application automatique de {len(suggestions_high)} alias HIGH…')
            apply_aliases(suggestions_high)
            if suggestions_med or suggestions_low:
                print(f'\nRelancer pour les {len(suggestions_med)+len(suggestions_low)} '
                      f'suggestions MOYEN/FAIBLE :')
                print(f'  python3 scripts/patch_whitelist.py '
                      f'{"--custom " + args.custom if args.custom else ""} --auto')
        else:
            print('Aucune suggestion HIGH — rien à appliquer automatiquement.')
            if suggestions_med:
                print('Sauvegarder et réviser les MOYEN :')
                print(f'  python3 scripts/patch_whitelist.py '
                      f'{"--custom " + args.custom if args.custom else ""} '
                      f'--output suggestions.json')
    elif not args.output:
        if suggestions_high:
            print('Pour appliquer les HIGH automatiquement :')
            print(f'  python3 scripts/patch_whitelist.py '
                  f'{"--custom " + args.custom if args.custom else ""} --auto')


if __name__ == '__main__':
    main()
