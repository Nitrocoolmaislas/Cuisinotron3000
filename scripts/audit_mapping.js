#!/usr/bin/env node
// ══════════════════════════════════════════════
//  AUDIT MAPPING — test de non-régression CIQUAL / Colruyt
//
//  Rejoue le pipeline réel de l'app (parseIngredientString →
//  canonicalIngredientKey → getNutriData / matchColruyt) dans Node, sur le
//  corpus statique (js/recipes.js) ET, si fourni, sur le corpus perso
//  exporté de Drive — le seul moyen de voir l'impact réel d'un changement :
//  les recettes perso et le bridge custom n'existent pas dans ce dépôt.
//
//  Usage :
//    node scripts/audit_mapping.js [--rev <git-rev>] [--compare <git-rev>]
//         [--custom recettes_clara_custom.json]
//         [--bridge recettes_clara_bridge_custom.json] [--json out.json]
//
//  --rev      version du code à auditer (défaut : working tree)
//  --compare  seconde version : liste les lignes dont le mapping change
//             (perdu, gagné, autre produit) — à lancer avant chaque push
//             touchant whitelist/bridge/parser/colruyt.
//  Le catalogue Colruyt utilisé est toujours data/colruyt-latest.json du
//  working tree, pour isoler l'effet du code de celui du catalogue.
//
//  Dépendances : Node ≥ 18, git (pour --rev/--compare)
// ══════════════════════════════════════════════
const vm = require('vm');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '..');
const PIPELINE_FILES = [
  'js/recipes.js', 'js/bridge.js', 'js/utils.js', 'data/ciqual_discriminants.js',
  'data/whitelist_canonique.js', 'js/ingredientParser.js', 'js/colruyt.js',
  'data/ciqual_fr.js', 'js/bridgeWizard.js',
];

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) out[argv[i].slice(2)] = argv[i + 1], i++;
  }
  return out;
}

function readSource(rev, file) {
  if (!rev) return fs.existsSync(path.join(REPO, file)) ? fs.readFileSync(path.join(REPO, file), 'utf8') : null;
  try { return execFileSync('git', ['-C', REPO, 'show', `${rev}:${file}`], { maxBuffer: 1 << 30 }).toString(); }
  catch { return null; }
}

// Charge le pipeline d'une version du code dans un contexte isolé
function loadPipeline(rev, { customRecipes, bridgeCustom, catalog }) {
  const store = { recettes_bridge_custom: JSON.stringify(bridgeCustom) };
  const localStorage = {
    getItem: k => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: k => { delete store[k]; },
  };
  const el = new Proxy(function () {}, {
    get: (_, k) => (k === 'style' ? {} : k === 'classList' ? { add() {}, remove() {}, toggle() {} } : el),
    apply: () => null,
  });
  const document = {
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener() {}, createElement: () => el, body: el,
  };
  const quiet = { log() {}, info() {}, warn() {}, error() {} };
  const ctx = vm.createContext({ localStorage, document, console: quiet, setTimeout: () => 0, clearTimeout() {}, navigator: {} });
  ctx.window = ctx;
  for (const f of PIPELINE_FILES) {
    const src = readSource(rev, f);
    if (src) vm.runInContext(src, ctx, { filename: f });
  }
  ctx.__catalog = catalog;
  vm.runInContext('colruytData = __catalog', ctx);
  const fn = name => vm.runInContext(`typeof ${name} === 'function' ? ${name} : null`, ctx);
  const recipes = [...vm.runInContext('RECIPES', ctx), ...customRecipes];
  return {
    recipes,
    parse: fn('parseIngredientString'), norm: fn('normIngredient'), canon: fn('canonicalIngredientKey'),
    always: fn('_isAlwaysAvailable'), nutri: fn('getNutriData'), match: fn('matchColruyt'),
  };
}

function audit(rev, data) {
  const P = loadPipeline(rev, data);
  const rows = [];
  for (const r of P.recipes) {
    for (const raw of r.ingredients || []) {
      if (typeof raw !== 'string') continue;
      const name = P.parse ? P.parse(raw).rawName : raw;
      const key = P.canon ? P.canon(name) : P.norm(name);
      const always = !!(P.always && key && P.always(key));
      let ciqual = null, colruyt = null;
      if (key && !always) {
        const n = P.nutri ? P.nutri(key) : null;
        ciqual = n ? (n.alim_nom_fr || n.name || n.n || '?') : null;
        try { const p = P.match ? P.match(key) : null; colruyt = p ? (p.LongName || p.name) : null; } catch { colruyt = null; }
      }
      rows.push({ recipe: r.name, custom: !!r.custom, raw, key, always, ciqual, colruyt });
    }
  }
  return rows;
}

function summary(label, rows) {
  const live = rows.filter(x => !x.always);
  const keys = new Set(live.filter(x => !x.colruyt).map(x => x.key));
  console.log(`${label}: ${rows.length} lignes (${rows.filter(r => r.custom).length} perso) | ` +
    `CIQUAL KO ${live.filter(x => !x.ciqual).length} | Colruyt KO ${live.filter(x => !x.colruyt).length} ` +
    `(${keys.size} ingrédients distincts)`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const readJson = f => (f ? JSON.parse(fs.readFileSync(f, 'utf8')) : null);
  const customRecipes = readJson(args.custom)?.customRecipes || [];
  const bridgeCustom = readJson(args.bridge)?.bridgeCustom || {};
  const catalog = JSON.parse(fs.readFileSync(path.join(REPO, 'data/colruyt-latest.json'), 'utf8'));
  const data = { customRecipes, bridgeCustom, catalog };

  const rows = audit(args.rev, data);
  summary(args.rev || 'working tree', rows);
  const ko = [...new Set(rows.filter(x => !x.always && !x.colruyt).map(x => x.key))].sort();
  if (ko.length) console.log('  Colruyt sans produit :', ko.join(', '));
  if (args.json) fs.writeFileSync(args.json, JSON.stringify(rows, null, 1));

  if (args.compare) {
    const base = audit(args.compare, data);
    summary(args.compare, base);
    const seen = new Set();
    const changes = { lost: [], gained: [], changed: [] };
    rows.forEach((x, i) => {
      const b = base[i];
      if (!b || b.raw !== x.raw) return;
      for (const field of ['ciqual', 'colruyt']) {
        const id = `${field}|${x.key}|${b.key}`;
        if (seen.has(id) || b[field] === x[field]) continue;
        seen.add(id);
        const kind = !x[field] ? 'lost' : !b[field] ? 'gained' : 'changed';
        changes[kind].push(`  [${field}] ${b.key}${b.key !== x.key ? ` → ${x.key}` : ''} : ${b[field]} → ${x[field]}`);
      }
    });
    console.log(`\nPerdus (${changes.lost.length}) — à examiner avant de pousser :`);
    changes.lost.forEach(l => console.log(l));
    console.log(`\nGagnés (${changes.gained.length}) :`);
    changes.gained.forEach(l => console.log(l));
    console.log(`\nAutre produit (${changes.changed.length}) :`);
    changes.changed.forEach(l => console.log(l));
    if (changes.lost.length) process.exitCode = 1;
  }
}

main();
