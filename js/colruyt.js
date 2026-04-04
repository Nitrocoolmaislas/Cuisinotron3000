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

// ── Parse le XML de listing GCS ──
function parseGCSListing(xmlText) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml');
  return [...doc.querySelectorAll('Contents Key')].map(el => el.textContent);
}

async function fetchColruytLatest(force = false) {
  if (colruytLoading) return;
  if (colruytData && !force) {
    setColruytStatus(`✓ ${colruytFileName} — ${colruytData.length} produits`, 'ok');
    return;
  }
  colruytLoading = true;
  setColruytStatus('Recherche du fichier Colruyt le plus récent…', 'loading');

  const BASE   = 'https://storage.googleapis.com/colruyt-products/';
  const PREFIX = 'colruyt-products/';

  try {
    // Lister depuis J-4 pour être sûr d'avoir le dernier fichier
    const d = new Date();
    d.setDate(d.getDate() - 4);
    const marker = PREFIX + d.toISOString().slice(0, 10);

    const listResp = await fetch(`${BASE}?max-keys=10&marker=${encodeURIComponent(marker)}`);
    if (!listResp.ok) throw new Error(`Listing échoué (HTTP ${listResp.status})`);

    const keys = parseGCSListing(await listResp.text());
    if (keys.length === 0) throw new Error('Aucun fichier trouvé');

    // Dernier fichier = plus récent (tri alpha = chrono)
    const latestKey = keys[keys.length - 1];
    colruytFileName = latestKey.replace(PREFIX, '');
    setColruytStatus(`Téléchargement de ${colruytFileName}…`, 'loading');

    const fileResp = await fetch(BASE + latestKey);
    if (!fileResp.ok) throw new Error(`Téléchargement échoué (HTTP ${fileResp.status})`);

    colruytData = await fileResp.json(); // tableau plat directement

    console.info('[Colruyt] Fichier :', colruytFileName);
    console.info('[Colruyt] Produits :', colruytData.length);
    console.info('[Colruyt] Exemple :', colruytData[0]);

    setColruytStatus(`✓ ${colruytFileName} — ${colruytData.length} produits`, 'ok');

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
// Cherche dans LongName (brand + name + contenu) et name
function matchColruyt(normKey) {
  if (!colruytData || colruytData.length === 0) return null;
  const bridge = INGREDIENT_BRIDGE[normKey];
  const terms  = bridge ? bridge.terms : [normKey];

  for (const term of terms) {
    const t = term.toLowerCase();
    const match = colruytData.find(p => {
      const hay = ((p.LongName || '') + ' ' + (p.name || '') + ' ' + (p.brand || ''))
        .toLowerCase();
      return hay.includes(t);
    });
    if (match) return match;
  }
  return null;
}
