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
    let latestKey = null;

    // Stratégie 1 : API JSON GCS avec startOffset sur les 7 derniers jours
    // → retourne uniquement les fichiers récents, on prend le dernier
    try {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const startOffset = PREFIX + d.toISOString().slice(0, 10);
      const apiUrl = `https://storage.googleapis.com/storage/v1/b/colruyt-products/o` +
                     `?prefix=${encodeURIComponent(PREFIX)}` +
                     `&startOffset=${encodeURIComponent(startOffset)}` +
                     `&maxResults=20`;
      const listResp = await fetch(apiUrl);
      if (listResp.ok) {
        const listData = await listResp.json();
        const items = (listData.items || []).filter(i => i.name.endsWith('.json'));
        if (items.length > 0) {
          items.sort((a, b) => b.name.localeCompare(a.name));
          latestKey = items[0].name;
        }
      }
    } catch(e) {
      console.warn('[Colruyt] Listing API échoué, fallback direct:', e.message);
    }

    // Stratégie 2 (fallback) : construire l'URL avec mediaLink connu
    // Le scraper tourne à 08:00 UTC → on essaie le fichier du jour connu
    if (!latestKey) {
      // On tente de récupérer le mediaLink depuis les métadonnées d'un objet récent
      // en cherchant le fichier le plus récent connu
      throw new Error('Impossible de lister le bucket — vérifie ta connexion');
    }

    colruytFileName = latestKey.replace(PREFIX, '');
    setColruytStatus(`Téléchargement de ${colruytFileName}…`, 'loading');

    // Téléchargement via l'API JSON GCS (supporte CORS, contrairement à l'URL directe)
    const encodedKey = encodeURIComponent(latestKey);
    const fileUrl = `https://storage.googleapis.com/storage/v1/b/colruyt-products/o/${encodedKey}?alt=media`;
    const fileResp = await fetch(fileUrl);
    if (!fileResp.ok) throw new Error(`Téléchargement échoué (HTTP ${fileResp.status})`);

    colruytData = await fileResp.json();

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
// Parmi tous les matches : isAvailable=true + prix le plus bas
function matchColruyt(normKey) {
  if (!colruytData || colruytData.length === 0) return null;
  const bridge = INGREDIENT_BRIDGE[normKey];
  const terms  = bridge ? bridge.terms : [normKey];

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
