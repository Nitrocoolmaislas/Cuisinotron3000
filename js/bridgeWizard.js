/**
 * bridgeWizard.js
 * Gère les ingrédients non mappés dans le bridge :
 * 1. Fuzzy match CIQUAL (validation forme canonique FR)
 * 2. Fetch Colruyt (BelgianNoise bucket) → top 3 produits
 * 3. Sauvegarde dans bridge_custom (localStorage)
 *
 * Dépendances : ciqual_fr.js (CIQUAL_FR), bridge.js (normIngredient, bridgeLookup)
 */

// ─── Clé localStorage ────────────────────────────────────────────────────────
const BRIDGE_CUSTOM_KEY   = 'recettes_bridge_custom';
const BRIDGE_PENDING_KEY  = 'recettes_bridge_pending';

// ─── Charger/sauver le bridge custom ─────────────────────────────────────────
function loadBridgeCustom() {
  try {
    return JSON.parse(localStorage.getItem(BRIDGE_CUSTOM_KEY) || '{}');
  } catch { return {}; }
}

function saveBridgeCustom(custom) {
  localStorage.setItem(BRIDGE_CUSTOM_KEY, JSON.stringify(custom));
  // Sync Drive si connecté
  if (typeof scheduleBridgeSave === 'function') scheduleBridgeSave();
}

// ─── Charger/sauver la liste des normKeys en attente ─────────────────────────
function loadPending() {
  try {
    return JSON.parse(localStorage.getItem(BRIDGE_PENDING_KEY) || '[]');
  } catch { return []; }
}

function savePending(list) {
  localStorage.setItem(BRIDGE_PENDING_KEY, JSON.stringify([...new Set(list)]));
}

function addPending(normKey) {
  const list = loadPending();
  if (!list.includes(normKey)) {
    list.push(normKey);
    savePending(list);
    refreshBadge();
  }
}

function removePending(normKey) {
  savePending(loadPending().filter(k => k !== normKey));
  refreshBadge();
}

// ─── bridgeLookup étendu (builtin + custom) ───────────────────────────────────
/**
 * À appeler à la place de bridgeLookup() partout dans l'app.
 * Cherche d'abord dans le bridge custom, puis dans le builtin.
 * Si rien trouvé → enregistre en pending pour le wizard.
 */
function bridgeLookupFull(normKey) {
  // 1. Bridge custom (utilisateur)
  const custom = loadBridgeCustom();
  if (custom[normKey]) return custom[normKey];

  // 2. Bridge builtin (bridge.js)
  const builtin = bridgeLookup(normKey);
  if (builtin) return builtin;

  // 3. Rien trouvé → ajouter en pending
  addPending(normKey);
  return null;
}

// ─── Fuzzy match CIQUAL ───────────────────────────────────────────────────────
/**
 * Retourne les N meilleures correspondances CIQUAL pour un normKey donné.
 * Stratégie : score par nombre de mots du normKey trouvés dans alim_norm.
 */
function fuzzyMatchCiqual(normKey, topN = 3) {
  if (typeof CIQUAL_FR === 'undefined') return [];

  const queryWords = normKey.split(' ').filter(w => w.length > 2);
  if (!queryWords.length) return [];

  const scored = CIQUAL_FR.map(entry => {
    let score = 0;
    // Correspondance exacte = score max
    if (entry.norm === normKey) score = 100;
    else if (entry.norm.includes(normKey)) score = 80;
    else {
      // Score par mots communs
      for (const w of queryWords) {
        if (entry.norm.includes(w)) score += 10;
      }
      // Bonus si commence par le même mot
      if (entry.norm.startsWith(queryWords[0])) score += 5;
    }
    return { ...entry, score };
  });

  return scored
    .filter(e => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

// ─── Fetch produits Colruyt ───────────────────────────────────────────────────
/**
// ─── Cache mémoire du catalogue Colruyt ──────────────────────────────────────
// Téléchargé une seule fois par session — évite de re-fetcher à chaque recherche
let _colruytCache = null;
let _colruytCacheLoading = null; // Promise en cours si fetch en cours

async function _getColruytCatalog() {
  // Réutiliser le catalogue déjà chargé par colruyt.js si disponible
  if (typeof colruytData !== 'undefined' && colruytData?.length) {
    return colruytData;
  }
  // Déjà en cache wizard → retour immédiat
  if (_colruytCache) return _colruytCache;
  // Fetch déjà en cours → attendre la même Promise
  if (_colruytCacheLoading) return _colruytCacheLoading;

  _colruytCacheLoading = (async () => {
    const listUrl = 'https://storage.googleapis.com/storage/v1/b/colruyt-products/o?maxResults=1&fields=items(name)';
    const listRes = await fetch(listUrl);
    const listData = await listRes.json();
    const latestFile = listData.items?.[0]?.name;
    if (!latestFile) return [];

    const dataUrl = `https://storage.googleapis.com/storage/v1/b/colruyt-products/o/${encodeURIComponent(latestFile)}?alt=media`;
    const dataRes = await fetch(dataUrl);
    _colruytCache = await dataRes.json();
    _colruytCacheLoading = null;
    console.info('[Colruyt] Catalogue chargé :', _colruytCache.length, 'produits');
    return _colruytCache;
  })();

  return _colruytCacheLoading;
}

/**
 * Cherche dans le bucket BelgianNoise les produits correspondant à un terme NL.
 * Retourne les produits disponibles correspondant au terme, triés par prix.
 * Pas de limite stricte — retourne tous les matches (max 20 pour l'UI).
 */
const p_avail = p => p.isAvailable !== false;

async function fetchColruytProducts(searchTerm) {
  try {
    // Réutiliser colruytData de colruyt.js si déjà chargé, sinon le cache wizard
    let products = (typeof colruytData !== 'undefined' && colruytData?.length)
      ? colruytData
      : _colruytCache;

    // Sinon fetch direct (même logique que colruyt.js)
    if (!products?.length) {
      const listUrl = 'https://storage.googleapis.com/storage/v1/b/colruyt-products/o?maxResults=1&fields=items(name)';
      const listRes = await fetch(listUrl);
      const listData = await listRes.json();
      const latestFile = listData.items?.[0]?.name;
      if (!latestFile) return [];
      const dataUrl = `https://storage.googleapis.com/storage/v1/b/colruyt-products/o/${encodeURIComponent(latestFile)}?alt=media`;
      const dataRes = await fetch(dataUrl);
      products = await dataRes.json();
      _colruytCache = products;
    }

    if (!products?.length) return [];

    const term = searchTerm.toLowerCase();
    return products
      .filter(p =>
        p.name?.toLowerCase().includes(term) ||
        p.LongName?.toLowerCase().includes(term)
      )
      .sort((a, b) => {
        if (p_avail(a) && !p_avail(b)) return -1;
        if (!p_avail(a) && p_avail(b)) return 1;
        return (a.price?.basicPrice ?? 999) - (b.price?.basicPrice ?? 999);
      })
      .slice(0, 20)
      .map(p => ({
        name: p.LongName || p.name,
        price: p.price?.basicPrice ?? null,
        available: p.isAvailable ?? true,
        term: searchTerm,
      }));
  } catch (err) {
    console.warn('[bridgeWizard] Colruyt fetch error:', err);
    return [];
  }
}

// ─── Badge notification ───────────────────────────────────────────────────────
function refreshBadge() {
  const badge = document.getElementById('bridge-wizard-badge');
  if (!badge) return;
  const count = loadPending().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';

  const btn = document.getElementById('bridge-wizard-btn');
  if (btn) btn.style.display = count > 0 ? 'inline-flex' : 'none';
}

// ─── UI : ouvrir le wizard ────────────────────────────────────────────────────
function openBridgeWizard() {
  const pending = loadPending();
  if (!pending.length) return;

  let panel = document.getElementById('bridge-wizard-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'bridge-wizard-panel';
    document.body.appendChild(panel);
  }

  renderWizardStep(panel, pending, 0);
  panel.classList.add('open');
}

function closeBridgeWizard() {
  const panel = document.getElementById('bridge-wizard-panel');
  if (panel) panel.classList.remove('open');
}

// ─── Render d'une étape du wizard ─────────────────────────────────────────────
async function renderWizardStep(panel, pending, index) {
  if (index >= pending.length) {
    panel.innerHTML = `
      <div class="bw-header">
        <h3>✅ Tous les ingrédients sont mappés</h3>
        <button class="bw-close" onclick="closeBridgeWizard()">✕</button>
      </div>`;
    refreshBadge();
    return;
  }

  const normKey = pending[index];
  const ciqualMatches = fuzzyMatchCiqual(normKey);
  const bestCiqual = ciqualMatches[0] ?? null;

  panel.innerHTML = `
    <div class="bw-header">
      <h3>Ingrédients non mappés
        <span class="bw-counter">${index + 1} / ${pending.length}</span>
      </h3>
      <button class="bw-close" onclick="closeBridgeWizard()">✕</button>
    </div>

    <div class="bw-body">
      <div class="bw-ingredient-name">"${normKey}"</div>

      <!-- Étape 1 : CIQUAL -->
      <div class="bw-section">
        <label class="bw-label">Correspondance CIQUAL</label>
        ${ciqualMatches.length ? `
          <div class="bw-options" id="bw-ciqual-options">
            ${ciqualMatches.map((m, i) => `
              <label class="bw-option ${i === 0 ? 'selected' : ''}" data-idx="${i}">
                <input type="radio" name="ciqual" value="${i}" ${i === 0 ? 'checked' : ''}>
                <span class="bw-option-name">${m.nom}</span>
                <span class="bw-option-sub">${m.ssgrp}</span>
              </label>
            `).join('')}
            <label class="bw-option" data-idx="none">
              <input type="radio" name="ciqual" value="none">
              <span class="bw-option-name">Aucune correspondance</span>
            </label>
          </div>
        ` : `<p class="bw-empty">Aucun résultat CIQUAL pour "${normKey}"</p>`}
      </div>

      <!-- Étape 2 : Colruyt -->
      <div class="bw-section">
        <label class="bw-label">Terme de recherche Colruyt (NL)</label>
        <div class="bw-search-row">
          <input type="text" id="bw-colruyt-term"
            placeholder="Ex: havervlokken"
            value="${bestCiqual ? '' : ''}"
            class="bw-input"/>
          <button class="bw-btn-secondary" onclick="searchColruytFromWizard()">Rechercher</button>
        </div>
        <div id="bw-colruyt-results" class="bw-options"></div>
      </div>
    </div>

    <div class="bw-footer">
      <button class="bw-btn-ghost" onclick="skipWizardStep(${index})">Passer</button>
      <button class="bw-btn-primary" id="bw-confirm-btn"
        onclick="confirmWizardStep('${normKey}', ${index})"
        disabled>Confirmer</button>
    </div>
  `;

  // Interaction sélection option CIQUAL
  panel.querySelectorAll('input[name="ciqual"]').forEach(radio => {
    radio.addEventListener('change', () => {
      panel.querySelectorAll('.bw-option').forEach(o => o.classList.remove('selected'));
      radio.closest('.bw-option').classList.add('selected');
    });
  });
}

// ─── Recherche Colruyt depuis le wizard ───────────────────────────────────────
async function searchColruytFromWizard() {
  const termInput = document.getElementById('bw-colruyt-term');
  const resultsDiv = document.getElementById('bw-colruyt-results');
  if (!termInput || !resultsDiv) return;

  const term = termInput.value.trim();
  if (!term) return;

  resultsDiv.innerHTML = '<p class="bw-loading">Recherche en cours…</p>';

  const products = await fetchColruytProducts(term);

  if (!products.length) {
    resultsDiv.innerHTML = '<p class="bw-empty">Aucun produit trouvé. Essayez un autre terme.</p>';
    return;
  }

  resultsDiv.innerHTML = products.map((p, i) => `
    <label class="bw-option ${i === 0 ? 'selected' : ''} ${p.available === false ? 'bw-option-unavailable' : ''}" data-product="${i}">
      <input type="radio" name="colruyt_product" value="${i}" ${i === 0 ? 'checked' : ''}>
      <span class="bw-option-name">${p.name}${p.available === false ? ' <em>(indisponible)</em>' : ''}</span>
      <span class="bw-option-price">${p.price != null ? p.price.toFixed(2) + ' €' : '–'}</span>
    </label>
  `).join('');

  // Stocker les résultats pour la confirmation
  resultsDiv.dataset.products = JSON.stringify(products);
  resultsDiv.dataset.term = term;

  // Activer le bouton Confirmer
  const confirmBtn = document.getElementById('bw-confirm-btn');
  if (confirmBtn) confirmBtn.disabled = false;

  // Interaction sélection
  resultsDiv.querySelectorAll('input[name="colruyt_product"]').forEach(radio => {
    radio.addEventListener('change', () => {
      resultsDiv.querySelectorAll('.bw-option').forEach(o => o.classList.remove('selected'));
      radio.closest('.bw-option').classList.add('selected');
    });
  });
}

// ─── Confirmer une étape ──────────────────────────────────────────────────────
function confirmWizardStep(normKey, index) {
  const resultsDiv = document.getElementById('bw-colruyt-results');
  if (!resultsDiv || !resultsDiv.dataset.products) return;

  const products = JSON.parse(resultsDiv.dataset.products);
  const selectedRadio = resultsDiv.querySelector('input[name="colruyt_product"]:checked');
  const selectedIdx = selectedRadio ? parseInt(selectedRadio.value) : 0;
  const chosen = products[selectedIdx];

  // Sauvegarder dans le bridge custom
  const custom = loadBridgeCustom();
  custom[normKey] = [chosen.term];
  saveBridgeCustom(custom);

  // Retirer des pending
  removePending(normKey);

  // Étape suivante
  const pending = loadPending();
  const panel = document.getElementById('bridge-wizard-panel');
  renderWizardStep(panel, pending, index < pending.length ? index : 0);
}

// ─── Passer une étape ─────────────────────────────────────────────────────────
function skipWizardStep(index) {
  const pending = loadPending();
  const panel = document.getElementById('bridge-wizard-panel');
  const nextIndex = index + 1;
  if (nextIndex >= pending.length) {
    closeBridgeWizard();
  } else {
    renderWizardStep(panel, pending, nextIndex);
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  refreshBadge();
});
