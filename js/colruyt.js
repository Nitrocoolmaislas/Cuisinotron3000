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
    setColruytStatus(`✓ ${colruytFileName} — ${colruytData.length} produits`, 'ok');

    // Sauvegarder en cache IndexedDB (pas de limite de taille)
    _idbSetColruyt(colruytData);
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
function formatColruytPrice(p) {
  const price = p.price?.basicPrice;
  if (price == null || price === 0) return null;
  return parseFloat(price).toFixed(2) + ' €';
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
// Parmi tous les matches : isAvailable=true + prix le plus bas
function matchColruyt(normKey) {
  if (!colruytData || colruytData.length === 0) return null;
  const bridge = INGREDIENT_BRIDGE[normKey];
  const terms  = Array.isArray(bridge) ? bridge : (bridge?.terms ?? [normKey]);

  for (const term of terms) {
    const t = term.toLowerCase();
    const matches = colruytData.filter(p => {
      const hay = ((p.LongName || '') + ' ' + (p.name || '') + ' ' + (p.brand || ''))
        .toLowerCase();
      return hay.includes(t);
    });

    if (matches.length === 0) continue;

    // Préférer les produits disponibles
    const available = matches.filter(p => p.isAvailable === true);
    const pool      = available.length > 0 ? available : matches;

    // Parmi le pool, prendre le prix le plus bas (basicPrice > 0)
    const withPrice = pool.filter(p => p.price?.basicPrice > 0);
    if (withPrice.length > 0) {
      return withPrice.reduce((best, p) =>
        p.price.basicPrice < best.price.basicPrice ? p : best
      );
    }

    return pool[0]; // fallback si aucun prix dispo
  }
  return null;
}
