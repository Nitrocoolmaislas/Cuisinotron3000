// ══════════════════════════════════════════════
//  GITHUB GIST — Sync multi-device sans Google
//  Scope PAT requis : gist
//  Clés localStorage : gist_pat, gist_id
// ══════════════════════════════════════════════

const GIST_STOCK_FILE        = 'recettes_clara_stock.json';
const GIST_CUSTOMS_FILE      = 'recettes_clara_custom.json';
const GIST_BRIDGE_FILE       = 'recettes_clara_bridge_custom.json';
const GIST_UNIT_WEIGHTS_FILE = 'recettes_clara_unit_weights.json';
const GIST_API               = 'https://api.github.com/gists';

let driveReady            = false;
let driveSaveTimer        = null;
let driveCustomTimer      = null;
let driveBridgeTimer      = null;
let driveUnitWeightsTimer = null;

// ── Helpers ───────────────────────────────────────────────────────────────────
function _gistPat() { return localStorage.getItem('gist_pat') || ''; }
function _gistId()  { return localStorage.getItem('gist_id')  || ''; }

function _gistHeaders() {
  return {
    Authorization: `token ${_gistPat()}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github+json'
  };
}

function setDriveStatus(msg, type) {
  const txt = document.getElementById('drive-status-text');
  const dot = document.getElementById('drive-dot');
  if (!txt || !dot) return;
  txt.textContent = msg;
  dot.className   = 'drive-status-dot ' + (type || '');
}

function showDriveConnected() {
  document.getElementById('drive-signin-row').style.display = 'none';
  document.getElementById('drive-setup-row').style.display  = 'none';
  document.getElementById('drive-status-row').style.display = '';
}

// ── Setup UI ──────────────────────────────────────────────────────────────────
function driveSignIn() {
  document.getElementById('drive-signin-row').style.display = 'none';
  document.getElementById('drive-setup-row').style.display  = '';
  const pat = _gistPat();
  const id  = _gistId();
  if (pat) document.getElementById('gist-pat-input').value = pat;
  if (id)  document.getElementById('gist-id-input').value  = id;
}

function gistCancelConfig() {
  document.getElementById('drive-setup-row').style.display  = 'none';
  document.getElementById('drive-signin-row').style.display = '';
}

async function gistSaveConfig() {
  const pat = (document.getElementById('gist-pat-input')?.value || '').trim();
  const id  = (document.getElementById('gist-id-input')?.value  || '').trim();
  if (!pat) { setDriveStatus('PAT requis', 'error'); return; }
  localStorage.setItem('gist_pat', pat);
  if (id) localStorage.setItem('gist_id', id);
  showDriveConnected();
  setDriveStatus('Connexion…', 'loading');
  driveReady = true;
  await loadFromDrive();
}

function driveSignOut() {
  localStorage.removeItem('gist_pat');
  localStorage.removeItem('gist_id');
  driveReady = false;
  document.getElementById('drive-status-row').style.display  = 'none';
  document.getElementById('drive-setup-row').style.display   = 'none';
  document.getElementById('drive-signin-row').style.display  = '';
}

// ── Créer un Gist initial ─────────────────────────────────────────────────────
async function _gistCreate() {
  const files = {};
  files[GIST_STOCK_FILE]        = { content: JSON.stringify({ stock: {} }) };
  files[GIST_CUSTOMS_FILE]      = { content: JSON.stringify({ customRecipes: [] }) };
  files[GIST_BRIDGE_FILE]       = { content: JSON.stringify({ bridgeCustom: {} }) };
  files[GIST_UNIT_WEIGHTS_FILE] = { content: JSON.stringify({ unitWeights: {} }) };
  const r = await fetch(GIST_API, {
    method: 'POST',
    headers: _gistHeaders(),
    body: JSON.stringify({
      description: 'Cuisinotron3000 — sync données Clara',
      public: false,
      files
    })
  });
  if (!r.ok) throw new Error(`Création Gist échouée (${r.status})`);
  const g = await r.json();
  localStorage.setItem('gist_id', g.id);
  return g;
}

// ── Lire le Gist (crée si absent) ─────────────────────────────────────────────
async function _gistGet() {
  const id = _gistId();
  if (!id) return _gistCreate();
  const r = await fetch(`${GIST_API}/${id}`, { headers: _gistHeaders() });
  if (!r.ok) throw new Error(`Lecture Gist échouée (${r.status})`);
  return r.json();
}

function _gistFileContent(gist, fileName) {
  const f = gist.files?.[fileName];
  if (!f) return null;
  try { return JSON.parse(f.content); } catch { return null; }
}

// ── Mettre à jour le Gist ─────────────────────────────────────────────────────
async function _gistPatch(filesObj) {
  const id = _gistId();
  if (!id) throw new Error('Gist ID manquant');
  const r = await fetch(`${GIST_API}/${id}`, {
    method: 'PATCH',
    headers: _gistHeaders(),
    body: JSON.stringify({ files: filesObj })
  });
  if (!r.ok) throw new Error(`Mise à jour Gist échouée (${r.status})`);
}

// ══════════════════════════════════════════════
//  CHARGEMENT
// ══════════════════════════════════════════════
async function loadFromDrive() {
  setDriveStatus('Chargement…', 'loading');
  try {
    const gist = await _gistGet();

    // Stock
    const stockData = _gistFileContent(gist, GIST_STOCK_FILE);
    if (stockData?.stock && typeof stockData.stock === 'object' && !Array.isArray(stockData.stock)) {
      stock = stockData.stock;
      localStorage.setItem('recettes_stock', JSON.stringify(stock));
    }

    // Recettes custom
    const customData = _gistFileContent(gist, GIST_CUSTOMS_FILE);
    if (customData) {
      const gistRecipes  = Array.isArray(customData.customRecipes) ? customData.customRecipes : [];
      const localRecipes = JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY) || '[]');
      const merged = [...gistRecipes];
      localRecipes.forEach(r => { if (!merged.find(x => x.id === r.id)) merged.push(r); });
      merged.forEach(r => {
        r.custom = true;
        const existing = RECIPES.find(x => x.id === r.id);
        if (!existing) RECIPES.push(r); else Object.assign(existing, r);
      });
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(merged));
      if (merged.length > gistRecipes.length) scheduleCustomRecipesSave();
    }

    // Bridge custom
    const bridgeData = _gistFileContent(gist, GIST_BRIDGE_FILE);
    if (bridgeData?.bridgeCustom && typeof bridgeData.bridgeCustom === 'object') {
      localStorage.setItem('recettes_bridge_custom', JSON.stringify(bridgeData.bridgeCustom));
    }

    // Unit weights
    const uwData = _gistFileContent(gist, GIST_UNIT_WEIGHTS_FILE);
    if (uwData?.unitWeights && typeof uwData.unitWeights === 'object') {
      localStorage.setItem('recettes_unit_weights_custom', JSON.stringify(uwData.unitWeights));
    }

    renderStock(); renderCatalog(); renderGrid(); updateCounts();
    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');

    // Sync données locales absentes du Gist
    const localBridge = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
    if (!bridgeData?.bridgeCustom && Object.keys(localBridge).length > 0) scheduleBridgeSave();
    const localWeights = JSON.parse(localStorage.getItem('recettes_unit_weights_custom') || '{}');
    if (!uwData?.unitWeights && Object.keys(localWeights).length > 0) scheduleDriveSaveUnitWeights();
    const localCiqual = JSON.parse(localStorage.getItem('recettes_ciqual_custom') || '{}');
    if (typeof saveCiqualCustomToDrive === 'function' && Object.keys(localCiqual).length > 0) {
      saveCiqualCustomToDrive();
    }
  } catch(e) {
    setDriveStatus('Erreur : ' + e.message, 'error');
    console.error('[Gist] load error:', e);
  }
}

// ══════════════════════════════════════════════
//  SAUVEGARDE STOCK
// ══════════════════════════════════════════════
async function saveToDriveNow() {
  if (!driveReady || !_gistPat()) return;
  setDriveStatus('Sauvegarde…', 'loading');
  try {
    const files = {};
    files[GIST_STOCK_FILE] = { content: JSON.stringify({ stock, updatedAt: new Date().toISOString() }) };
    await _gistPatch(files);
    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');
  } catch(e) {
    setDriveStatus('Erreur sauvegarde', 'error');
    console.error('[Gist] stock save error:', e);
  }
}

function scheduleDriveSave() {
  clearTimeout(driveSaveTimer);
  driveSaveTimer = setTimeout(saveToDriveNow, 1000);
}

// ══════════════════════════════════════════════
//  SAUVEGARDE RECETTES CUSTOM
// ══════════════════════════════════════════════
async function saveCustomRecipesToDrive() {
  if (!driveReady || !_gistPat()) return;
  try {
    const customRecipes = RECIPES.filter(r => r.custom === true);
    const files = {};
    files[GIST_CUSTOMS_FILE] = { content: JSON.stringify({ customRecipes, updatedAt: new Date().toISOString() }) };
    await _gistPatch(files);
    console.info('[Gist] Recettes custom sauvegardées :', customRecipes.length);
  } catch(e) {
    console.error('[Gist] custom recipes save error:', e);
  }
}

function scheduleCustomRecipesSave() {
  clearTimeout(driveCustomTimer);
  driveCustomTimer = setTimeout(saveCustomRecipesToDrive, 1000);
}

// ══════════════════════════════════════════════
//  SAUVEGARDE BRIDGE CUSTOM
// ══════════════════════════════════════════════
async function saveBridgeCustomToDrive() {
  if (!driveReady || !_gistPat()) return;
  try {
    const bridgeCustom = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
    const files = {};
    files[GIST_BRIDGE_FILE] = { content: JSON.stringify({ bridgeCustom, updatedAt: new Date().toISOString() }) };
    await _gistPatch(files);
    console.info('[Gist] Bridge custom sauvegardé :', Object.keys(bridgeCustom).length, 'entrées');
  } catch(e) {
    console.error('[Gist] bridge save error:', e);
  }
}

function scheduleBridgeSave() {
  clearTimeout(driveBridgeTimer);
  driveBridgeTimer = setTimeout(saveBridgeCustomToDrive, 1000);
}

// ══════════════════════════════════════════════
//  SAUVEGARDE UNIT WEIGHTS
// ══════════════════════════════════════════════
async function saveUnitWeightsToDrive() {
  if (!driveReady || !_gistPat()) return;
  try {
    const unitWeights = JSON.parse(localStorage.getItem('recettes_unit_weights_custom') || '{}');
    const files = {};
    files[GIST_UNIT_WEIGHTS_FILE] = { content: JSON.stringify({ unitWeights, updatedAt: new Date().toISOString() }) };
    await _gistPatch(files);
  } catch(e) {
    console.error('[Gist] unit weights save error:', e);
  }
}

function scheduleDriveSaveUnitWeights() {
  clearTimeout(driveUnitWeightsTimer);
  driveUnitWeightsTimer = setTimeout(saveUnitWeightsToDrive, 1000);
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (_gistPat() && _gistId()) {
    driveReady = true;
    showDriveConnected();
    setTimeout(() => loadFromDrive(), 300);
  }
});
