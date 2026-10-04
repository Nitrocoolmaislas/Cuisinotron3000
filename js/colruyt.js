// ══════════════════════════════════════════════
//  COLRUYT — intégration bucket public GCS
//  Bucket : gs://colruyt-products (us-east1, public)
//  Source : github.com/BelgianNoise/colruyt-products-scraper
//
//  Structure réelle confirmée (2026-03-28) :
//  [
//    {
//      "productId": "851988",
//      "name": "Ice 4% blik",               ← nom court
//      "LongName": "SMIRNOFF Ice 4% blik 25cl", ← nom complet (brand + name + contenu)
//      "ShortName": "SMIR ICE 4% BLIK 25CL",
//      "brand": "SMIRNOFF",
//      "content": "25cl",
//      "price": {
//        "basicPrice": 1.99,                 ← prix principal (imbriqué !)
//        "measurementUnit": "L",
//        "measurementUnitPrice": 7.96        ← prix au litre/kg
//      },
//      "topCategoryName": "Dranken",         ← catégorie en NL uniquement
//      "isAvailable": true,
//      "IsBio": false,
//      ...
//      // PAS d'EAN/barcode
//      // PAS de données nutritionnelles
//    }
//  ]
// ══════════════════════════════════════════════

let colruytData     = null;
let colruytLoading  = false;
let colruytFileName = null;

function setColruytStatus(msg, type) {
  const dot  = document.getElementById('colruyt-dot');
  const text = document.getElementById('colruyt-status-text');
  if (dot)  dot.className    = 'colruyt-status-dot ' + (type || '');
  if (text) text.textContent = msg;
}

const COLRUYT_CACHE_TTL = 23 * 60 * 60 * 1000; // 23h en ms

// ── IndexedDB helpers ─────────────────────────────────────────────────────────
async function _idbGetColruyt() {
  try {
    const db = await idb.openDB('cuisinotron', 1, {
      upgrade(db) { db.createObjectStore('colruyt'); }
    });
    return await db.get('colruyt', 'cache');
  } catch(e) { return null; }
}

async function _idbSetColruyt(data) {
  try {
    const db = await idb.openDB('cuisinotron', 1, {
      upgrade(db) { db.createObjectStore('colruyt'); }
    });
    await db.put('colruyt', { data, ts: Date.now() }, 'cache');
  } catch(e) { console.warn('[Colruyt] IDB write error:', e.message); }
}

async function fetchColruytLatest(force = false) {
  if (colruytLoading) return;
  if (colruytData && !force) {
    setColruytStatus(`✓ ${colruytFileName || 'Cache local'} — ${colruytData.length} produits`, 'ok');
    return;
  }

  // Vérifier le cache IndexedDB (valide 23h)
  if (!force) {
    const cached = await _idbGetColruyt();
    if (cached && Date.now() - cached.ts < COLRUYT_CACHE_TTL) {
      colruytData = cached.data;
      setColruytStatus(`✓ Cache local — ${colruytData.length} produits`, 'ok');
      console.info('[Colruyt] Chargé depuis IDB:', colruytData.length, 'produits');
      return;
    }
  }

  colruytLoading = true;
  setColruytStatus('Chargement du catalogue Colruyt…', 'loading');

  try {
    const res = await fetch('./data/colruyt-latest.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Catalogue vide — déclenche l\'Action GitHub "Mirror Colruyt catalog" pour le mettre à jour');
    }

    colruytData     = data;
    colruytFileName = 'colruyt-latest.json';

    console.info('[Colruyt] Produits :', colruytData.length);
    setColruytStatus(`✓ ${colruytData.length} produits`, 'ok');

    _idbSetColruyt(colruytData);

    if (_lastShoppingMissing.length > 0) {
      renderShoppingBody(_lastShoppingMissing, _lastShoppingInStock);
      renderNutritionTab();
    }
  } catch(e) {
    setColruytStatus('Indisponible · ' + e.message, 'error');
    console.warn('[Colruyt]', e.message);
  } finally {
    colruytLoading = false;
  }
}

// ── Nom affiché (LongName contient brand + name + contenu) ──
function getColruytName(p) {
  return p.LongName || (p.brand ? p.brand + ' ' + p.name : p.name) || '—';
}

// ── Prix (imbriqué dans price.basicPrice) ──
// Valeur numérique brute — à utiliser pour toute somme/calcul (total liste
// de courses, export Excel en float) plutôt que de re-parser la string
// formatée de formatColruytPrice().
function getColruytPriceValue(p) {
  const price = p.price?.basicPrice;
  if (price == null || price === 0) return null;
  return parseFloat(price);
}

function formatColruytPrice(p) {
  const value = getColruytPriceValue(p);
  return value == null ? null : value.toFixed(2) + ' €';
}

// ── Pas d'EAN dans ce dataset ──
function getColruytEan(p) {
  return ''; // pas disponible dans ce JSON
}

// ── Pas de nutrition dans ce dataset → CIQUAL utilisé à la place ──
function getColruytNutrition(p) {
  return null;
}

// ── Matching ingrédient → produit Colruyt ──
// Rayons qui ne vendent jamais un ingrédient de recette : sans ce filtre,
// "miel" → baume à lèvres, "thon"/"poulet" → pâtée pour chat, "courgette"
// → petit pot bébé (le moins cher contenant le terme gagnait).
const COLRUYT_NON_FOOD_CATEGORIES = new Set([
  'Lichaamsverzorging/Parfumerie', 'Niet-voeding', 'Onderhoud/Huishouden',
  'Huisdieren', 'Baby', 'Gezondheid',
]);

// Pertinence d'un produit pour un terme NL (plus petit = meilleur) :
//   0  nom générique = le terme (± pluriel)          "courgetten", "rode paprika"
//   1  nom générique qui COMMENCE par le terme        "eieren vers L", "rijst thai"
//   2  terme en mot entier ailleurs dans le nom       "vrij uitloop eieren"
//   3  terme en début de mot composé                  "appelsap", "kipfilet"
//   4  simple sous-chaîne (marque, nom long…)
// Un produit dérivé (sauce, soupe, biscuit, chewing-gum…) recule de 1,5
// rang, sauf si le terme lui-même le demande ("appelsap", "pesto saus").
const COLRUYT_DERIVED_WORDS = /(?:^| )(saus|soep|chips|snack|mousse|koek(?:je)?s?|wafels?|taart|pap|salade|dressing|smaak|sap|siroop|lolly|reep|stick|bonbons?|ijs|roomijs|yoghurt|drink|falafel|hummus|spread|terrine|rol)(?= |$)/;
// Rayons boissons : seulement si le terme désigne lui-même une boisson (ou
// le cacao, rangé en boissons) — sinon "appel" → jus de pomme, "laurier" →
// Muscadet "Les Lauriers", "feve" → tonic Fever-Tree.
const COLRUYT_DRINK_CATEGORIES = new Set(['Dranken', 'Wijn']);
const COLRUYT_DRINK_TERMS = /wijn|bier|rum|sap|cider|porto|cognac|likeur|whisky|vodka|calvados|kirsch|water|limonade|cola|tonic|martini|sherry|madeira|koffie|thee|cacao/;
function _colruytScore(p, t) {
  const name = (p.name || '').toLowerCase();
  const derived = !COLRUYT_DERIVED_WORDS.test(t) && COLRUYT_DERIVED_WORDS.test(name);
  return _colruytTermRank(p, t) * 2 + (derived ? 3 : 0);
}

function _colruytTermRank(p, t) {
  const name = (p.name || '').toLowerCase().trim();
  const esc  = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pl   = "(?:s|n|en|'s)?";
  if (new RegExp(`^${esc}${pl}$`).test(name)) return 0;
  if (new RegExp(`^${esc}${pl}(?= )`).test(name)) return 1;
  if (new RegExp(`(?:^| )${esc}${pl}(?= |$)`).test(name)) return 2;
  if (new RegExp(`(?:^| )${esc}`).test(name)) return 3;
  return 4;
}

function _lexLess(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
}

// Parmi tous les termes NL de l'ingrédient : meilleur rang de pertinence,
// puis ordre des termes (le premier est le plus spécifique), puis
// disponible, puis prix le plus bas.
function matchColruyt(normKey) {
  if (!colruytData || colruytData.length === 0) return null;
  // Eau, eau tiède… n'ont pas de produit Colruyt et ne doivent pas polluer
  // la file d'attente du Bridge Wizard (voir garde plus bas).
  if (typeof _isAlwaysAvailable === 'function' && _isAlwaysAvailable(normKey)) return null;
  // bridgeLookupFull() lit d'abord recettes_bridge_custom (les confirmations
  // du Bridge Wizard) avant de retomber sur bridgeLookup()/WHITELIST — sans
  // ça, valider un match dans le wizard n'avait aucun effet ici, seulement
  // sur le badge du panel d'import. Si un ingrédient reste introuvable, il
  // est aussi ajouté en pending pour le wizard (même effet de bord que pour
  // l'import).
  const bridgeTerms = typeof bridgeLookupFull === 'function' ? bridgeLookupFull(normKey) : bridgeLookup(normKey);
  const terms = (Array.isArray(bridgeTerms) ? bridgeTerms : [normKey]).map(t => t.toLowerCase());

  let best = null, bestKey = null;
  colruytData.forEach(p => {
    if (COLRUYT_NON_FOOD_CATEGORIES.has(p.topCategoryName)) return;
    const hay = ((p.LongName || '') + ' ' + (p.name || '') + ' ' + (p.brand || '')).toLowerCase();
    terms.forEach((t, ti) => {
      if (!hay.includes(t)) return;
      if (COLRUYT_DRINK_CATEGORIES.has(p.topCategoryName) && !COLRUYT_DRINK_TERMS.test(t)) return;
      const price = p.price?.basicPrice > 0 ? p.price.basicPrice : Infinity;
      const key = [_colruytScore(p, t), ti, p.isAvailable === true ? 0 : 1, price];
      if (!bestKey || _lexLess(key, bestKey)) { best = p; bestKey = key; }
    });
  });
  return best;
}
