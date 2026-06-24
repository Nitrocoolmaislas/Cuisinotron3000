#!/usr/bin/env python3
"""
sync_ciqual.py — CIQUAL coverage audit and update tool for Cuisinotron3000.

Usage:
  python3 scripts/sync_ciqual.py            # report-only (default)
  python3 scripts/sync_ciqual.py --fetch    # download CIQUAL 2025 XML from Zenodo
  python3 scripts/sync_ciqual.py --apply    # write patches to data/ files
  python3 scripts/sync_ciqual.py --fetch --apply   # full update cycle

What it does:
  1. Audits current coverage (whitelist entries with/without ciqual keys,
     CIQUAL entries with/without kcal, source quality distribution)
  2. [--fetch] Downloads CIQUAL 2025 XML ZIP from Zenodo (concept 17550132),
     extracts and parses alim_*.xml (foods), const_*.xml (nutrients),
     compo_*.xml (composition values)
  3. Matches CIQUAL 2025 food names against whitelist entries that have
     ciqual=null, using the same normalization as the app
  4. [--apply] Appends new CIQUAL entries to data/ciqual_fr.js and
     updates matched ciqual keys in data/whitelist_canonique.js

Zenodo concept record: https://zenodo.org/records/17550132
Latest version API:    https://zenodo.org/api/records/17550132/versions/latest
"""

import argparse
import json
import os
import re
import sys
import unicodedata
import urllib.request
import urllib.error
import zipfile
import io
import xml.etree.ElementTree as ET
from collections import defaultdict

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CIQUAL_JS     = os.path.join(REPO, 'data', 'ciqual_fr.js')
WHITELIST_JS  = os.path.join(REPO, 'data', 'whitelist_canonique.js')
ZENODO_CONCEPT = 'https://zenodo.org/api/records/17550132/versions/latest'

# ── Normalization (mirrors normIngredient() in js/utils.js) ──────────────────

def _remove_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s)
                   if unicodedata.category(c) != 'Mn')

def norm(s):
    s = s.lower()
    s = _remove_accents(s)
    s = re.sub(r"[''`]", '', s)
    s = re.sub(r'[^a-z0-9 ]', ' ', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

def depluralize(s):
    return ' '.join(w[:-1] if w.endswith('s') else w for w in s.split())

# ── JS file helpers ──────────────────────────────────────────────────────────

def load_ciqual(path):
    with open(path) as f:
        src = f.read()
    m = re.search(r'(const CIQUAL_FR = \[)(.*?)(\];)', src, re.DOTALL)
    if not m:
        sys.exit('ERROR: CIQUAL_FR not found in ' + path)
    data = json.loads('[' + m.group(2) + ']')
    return src, m, data

def load_whitelist(path):
    with open(path) as f:
        src = f.read()
    m = re.search(r'(const WHITELIST = )(\[.*?\])(;)', src, re.DOTALL)
    if not m:
        sys.exit('ERROR: WHITELIST not found in ' + path)
    data = json.loads(m.group(2))
    return src, m, data

def save_ciqual(path, src, m, combined):
    lines = ['const CIQUAL_FR = [']
    for i, e in enumerate(combined):
        comma = ',' if i < len(combined) - 1 else ''
        lines.append('  ' + json.dumps(e, ensure_ascii=False) + comma)
    lines.append('];')
    new_block = '\n'.join(lines)
    new_src = src[:m.start()] + new_block + src[m.end():]
    with open(path, 'w') as f:
        f.write(new_src)

def save_whitelist(path, src, m, data):
    new_json = json.dumps(data, ensure_ascii=False, indent=2)
    new_src = src[:m.start(2)] + new_json + src[m.end(2):]
    with open(path, 'w') as f:
        f.write(new_src)

# ── 1. Audit ─────────────────────────────────────────────────────────────────

def audit(ciqual_data, wl_data):
    print('=' * 60)
    print('CIQUAL COVERAGE AUDIT')
    print('=' * 60)

    # CIQUAL stats
    total_cq = len(ciqual_data)
    has_kcal = sum(1 for e in ciqual_data if e.get('kcal') is not None)
    q_dist = defaultdict(int)
    for e in ciqual_data:
        q_dist[e.get('_q', '?')] += 1

    print(f'\n[ciqual_fr.js]')
    print(f'  Total entries : {total_cq}')
    print(f'  With kcal     : {has_kcal} ({100*has_kcal/total_cq:.1f}%)')
    print('  Quality dist  :')
    for q in sorted(q_dist):
        label = {3: 'external (USDA)', 4: 'standard', 5: 'good',
                 6: 'good+', 7: 'very good', 8: 'excellent'}.get(q, str(q))
        print(f'    _q={q} ({label}): {q_dist[q]}')

    # Whitelist stats
    total_wl = len(wl_data)
    with_ciqual = sum(1 for e in wl_data if e.get('ciqual'))
    null_entries = [e for e in wl_data if not e.get('ciqual')]

    print(f'\n[whitelist_canonique.js]')
    print(f'  Total entries     : {total_wl}')
    print(f'  With ciqual key   : {with_ciqual} ({100*with_ciqual/total_wl:.1f}%)')
    print(f'  Without ciqual    : {len(null_entries)} ({100*len(null_entries)/total_wl:.1f}%)')

    if null_entries:
        cats = defaultdict(list)
        for e in null_entries:
            cats[e.get('cat', '?')].append(e['k'])
        print('  Missing by category:')
        for cat in sorted(cats):
            keys = cats[cat]
            print(f'    {cat}: {", ".join(keys)}')

    print()
    return null_entries

# ── 2. Fetch CIQUAL 2025 from Zenodo ─────────────────────────────────────────

def fetch_zenodo():
    print('Fetching latest CIQUAL record from Zenodo...')
    try:
        req = urllib.request.Request(ZENODO_CONCEPT,
                                     headers={'Accept': 'application/json'})
        with urllib.request.urlopen(req, timeout=30) as resp:
            meta = json.loads(resp.read())
    except urllib.error.URLError as e:
        sys.exit(f'ERROR: Cannot reach Zenodo — {e}\n'
                 'Check internet connectivity. The proxy may block this URL.')

    version = meta.get('metadata', {}).get('version', 'unknown')
    print(f'  Record version: {version}')

    files = meta.get('files', [])
    zip_files = [f for f in files if f['key'].endswith('.zip')]
    if not zip_files:
        # Some records list files differently
        links = meta.get('links', {})
        dl = links.get('self_html', '')
        sys.exit(f'No ZIP found in Zenodo record. Visit: {dl}')

    zip_entry = zip_files[0]
    zip_url = zip_entry['links']['self']
    zip_size = zip_entry.get('size', 0)
    print(f'  Downloading {zip_entry["key"]} ({zip_size//1024} KB)...')

    try:
        with urllib.request.urlopen(zip_url, timeout=120) as resp:
            zip_bytes = resp.read()
    except urllib.error.URLError as e:
        sys.exit(f'ERROR: Download failed — {e}')

    print(f'  Downloaded {len(zip_bytes)//1024} KB.')
    return zip_bytes

# ── 3. Parse CIQUAL 2025 XML ──────────────────────────────────────────────────

# ANSES CIQUAL XML nutrient codes we care about
NUTRIENT_CODES = {
    'ENERC_KCAL': 'kcal',  # energy kcal
    'PROT':       'prot',  # protein
    'CHOAVL':     'gluc',  # available carbohydrates (glucides disponibles)
    'FAT':        'lip',   # total fat
    'FIBTG':      'fib',   # dietary fibre
    'SUGAR':      'suc',   # total sugars
    'NA':         'sel',   # sodium → convert to salt (*2.54)
}

def _find_xml(zf, pattern):
    for name in zf.namelist():
        if re.search(pattern, name, re.IGNORECASE):
            return name
    return None

def parse_ciqual_zip(zip_bytes):
    """Return list of dicts {k, n, kcal, prot, gluc, lip, fib, suc, sel, _q}."""
    zf = zipfile.ZipFile(io.BytesIO(zip_bytes))

    alim_file  = _find_xml(zf, r'alim.*\.xml$')
    const_file = _find_xml(zf, r'const.*\.xml$')
    compo_file = _find_xml(zf, r'compo.*\.xml$')

    if not alim_file or not const_file or not compo_file:
        print('  Files in ZIP:', zf.namelist())
        sys.exit('ERROR: Expected alim_*.xml, const_*.xml, compo_*.xml in ZIP.')

    # Parse food names
    foods = {}  # alim_code → norm_name
    food_names = {}  # alim_code → original French name
    alim_root = ET.parse(zf.open(alim_file)).getroot()
    ns = {'': alim_root.tag.split('}')[0].lstrip('{') or None}

    def txt(el, tag):
        child = el.find(tag)
        return child.text.strip() if child is not None and child.text else ''

    for food in alim_root.iter():
        if not food.tag.endswith('ALIM'):
            continue
        code = txt(food, 'ALIM_CODE') or food.get('ALIM_CODE', '')
        name_fr = (txt(food, 'ALIM_NOM_FR') or
                   txt(food, 'alim_nom_fr') or
                   food.get('alim_nom_fr', ''))
        if code and name_fr:
            foods[code] = norm(name_fr)
            food_names[code] = name_fr

    print(f'  Parsed {len(foods)} food entries from {alim_file}')

    # Parse nutrient codes
    nutr_map = {}  # nutr_code → our field name
    const_root = ET.parse(zf.open(const_file)).getroot()
    for const in const_root.iter():
        if not const.tag.endswith('CONST'):
            continue
        code = txt(const, 'CONST_CODE') or const.get('CONST_CODE', '')
        for nc, field in NUTRIENT_CODES.items():
            if code == nc:
                nutr_map[code] = field

    # Parse composition values
    compo_root = ET.parse(zf.open(compo_file)).getroot()
    values = defaultdict(dict)  # alim_code → {field: value}
    for compo in compo_root.iter():
        if not compo.tag.endswith('COMPO'):
            continue
        alim = txt(compo, 'ALIM_CODE') or compo.get('ALIM_CODE', '')
        const = txt(compo, 'CONST_CODE') or compo.get('CONST_CODE', '')
        val_str = txt(compo, 'TENEUR') or compo.get('TENEUR', '')
        if alim and const in nutr_map and val_str:
            try:
                val = float(val_str.replace(',', '.'))
                field = nutr_map[const]
                if field == 'sel':
                    val = round(val * 2.54, 3)  # Na → NaCl
                values[alim][field] = val
            except ValueError:
                pass

    print(f'  Parsed composition for {len(values)} foods')

    # Build entries
    entries = []
    for code, norm_name in foods.items():
        v = values.get(code, {})
        if not v.get('kcal'):
            continue
        entries.append({
            'k':    norm_name,
            'n':    food_names[code],
            'kcal': v.get('kcal', 0.0),
            'prot': v.get('prot', 0.0),
            'gluc': v.get('gluc', 0.0),
            'lip':  v.get('lip',  0.0),
            'fib':  v.get('fib',  0.0),
            'suc':  v.get('suc',  0.0),
            'sel':  v.get('sel',  0.0),
            '_q':   4,  # CIQUAL 2025 source
        })

    print(f'  Built {len(entries)} entries with kcal data')
    return entries

# ── 4. Match new entries against null whitelist entries ───────────────────────

def match_new_entries(new_entries, null_wl, existing_keys):
    """
    For each null whitelist entry, find the best matching new CIQUAL entry.
    Returns list of (wl_key, new_ciqual_entry) pairs.
    """
    new_idx = {e['k']: e for e in new_entries}

    def score_match(wl_key, cq_key):
        wl_dep = depluralize(wl_key)
        cq_dep = depluralize(cq_key)
        words = [w for w in wl_dep.split() if len(w) > 2]
        if not words:
            return 0
        head = words[0]
        modifiers = set(words[1:])
        if not cq_dep.startswith(head):
            return 0
        bonus = sum(1 for w in modifiers if w in cq_dep)
        if len(modifiers) > 0 and bonus == 0:
            return 0
        penalty = max(0, len(cq_dep.split()) - len(wl_dep.split()))
        return 1 + bonus - penalty * 0.3

    matches = []
    for entry in null_wl:
        wk = entry['k']
        best_k, best_s = None, 0
        for cq_key in new_idx:
            if cq_key in existing_keys:
                continue
            s = score_match(wk, cq_key)
            if s > best_s:
                best_s = s
                best_k = cq_key
        if best_k:
            matches.append((wk, new_idx[best_k]))

    return matches

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--fetch', action='store_true',
                        help='Download CIQUAL 2025 XML from Zenodo')
    parser.add_argument('--apply', action='store_true',
                        help='Write patches to data/ files')
    args = parser.parse_args()

    ciqual_src, ciqual_m, ciqual_data = load_ciqual(CIQUAL_JS)
    wl_src, wl_m, wl_data = load_whitelist(WHITELIST_JS)

    null_wl = audit(ciqual_data, wl_data)

    if not args.fetch:
        if null_wl:
            print('Run with --fetch to attempt matching against CIQUAL 2025.')
        return

    if not null_wl:
        print('All whitelist entries already have ciqual keys. Nothing to fetch.')
        return

    zip_bytes = fetch_zenodo()
    new_entries = parse_ciqual_zip(zip_bytes)

    existing_keys = {e['k'] for e in ciqual_data}
    truly_new = [e for e in new_entries if e['k'] not in existing_keys]
    print(f'  New CIQUAL 2025 entries not yet in DB: {len(truly_new)}')

    matches = match_new_entries(truly_new, null_wl, existing_keys)
    if not matches:
        print('No automatic matches found for the remaining null entries.')
        print('Manual overrides may be needed (see scripts/patch_usda.py for the pattern).')
        return

    print(f'\nProposed matches ({len(matches)}):')
    for wk, cq_entry in matches:
        print(f'  {wk:40s} → {cq_entry["k"]}  ({cq_entry["kcal"]} kcal)')

    if not args.apply:
        print('\nRun with --apply to write these changes.')
        return

    # Add new CIQUAL entries
    entries_to_add = [cq for _, cq in matches]
    combined = ciqual_data + entries_to_add
    save_ciqual(CIQUAL_JS, ciqual_src, ciqual_m, combined)
    print(f'\nciqual_fr.js: added {len(entries_to_add)} entries.')

    # Update whitelist ciqual keys
    wl_map = {e['k']: e for e in wl_data}
    updated = 0
    for wk, cq_entry in matches:
        if wk in wl_map:
            wl_map[wk]['ciqual'] = cq_entry['k']
            updated += 1
    save_whitelist(WHITELIST_JS, wl_src, wl_m, wl_data)
    print(f'whitelist_canonique.js: {updated} entries updated.')
    print('\nDone.')

if __name__ == '__main__':
    main()
