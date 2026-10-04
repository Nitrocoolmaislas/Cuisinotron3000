// ══════════════════════════════════════════════
//  GOOGLE DRIVE — Configuration
// ══════════════════════════════════════════════
const GOOGLE_CLIENT_ID   = '758662499322-tmh1469ov6fnp5s0vjeqqd6023gm3edv.apps.googleusercontent.com';
const DRIVE_STOCK_FILE   = 'recettes_clara_stock.json';
const DRIVE_CUSTOMS_FILE  = 'recettes_clara_custom.json';
const DRIVE_BRIDGE_FILE        = 'recettes_clara_bridge_custom.json';
const DRIVE_UNIT_WEIGHTS_FILE  = 'recettes_clara_unit_weights.json';

let driveTokenClient  = null;
let driveAccessToken  = null;
let driveStockFileId  = null;
let driveCustomFileId = null;
let driveBridgeFileId      = null;
let driveUnitWeightsFileId = null;
let driveReady        = false;
let driveSaveTimer         = null;
let driveUnitWeightsTimer  = null;
let driveCustomTimer  = null;
let driveBridgeTimer  = null;

function _initGIS() {
  const configured = GOOGLE_CLIENT_ID !== 'VOTRE_CLIENT_ID_ICI';
  document.getElementById('drive-not-configured').style.display = configured ? 'none' : '';
  if (!driveReady) {
    document.getElementById('drive-signin-row').style.display = configured ? '' : 'none';
  }
  if (!configured) return;

  driveTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: async (resp) => {
      if (resp.error) { setDriveStatus("Erreur d'authentification", 'error'); return; }
      driveAccessToken = resp.access_token;
      driveReady = true;
      const expiry = Date.now() + (resp.expires_in || 3600) * 1000;
      localStorage.setItem('drive_token', resp.access_token);
      localStorage.setItem('drive_token_expiry', String(expiry));
      showDriveConnected();
      await loadFromDrive();
      // Sync les données locales vers Drive (bridge, unit weights créés hors-ligne)
      const localBridge = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
      if (Object.keys(localBridge).length > 0) scheduleBridgeSave();
      const localWeights = JSON.parse(localStorage.getItem('recettes_unit_weights_custom') || '{}');
      if (Object.keys(localWeights).length > 0) scheduleDriveSaveUnitWeights();
    }
  });
}

function onGISLoad() {
  window._gisReady = true;
  if (typeof _initGIS === 'function') _initGIS();
}

document.addEventListener('DOMContentLoaded', () => {
  if (window._gisReady) _initGIS();
  // Restaurer le token si valide (survit aux refreshs)
  const savedToken  = localStorage.getItem('drive_token');
  const tokenExpiry = parseInt(localStorage.getItem('drive_token_expiry') || '0');
  if (savedToken && Date.now() < tokenExpiry - 60000) {
    driveAccessToken = savedToken;
    driveReady = true;
    setTimeout(() => { showDriveConnected(); loadFromDrive(); }, 300);
  } else {
    localStorage.removeItem('drive_token');
    localStorage.removeItem('drive_token_expiry');
  }
});



function driveSignIn() {
  if (!driveTokenClient) return;
  driveTokenClient.requestAccessToken({ prompt: 'consent' });
}

function driveSignOut() {
  if (driveAccessToken) google.accounts.oauth2.revoke(driveAccessToken, () => {});
  driveAccessToken = null;
  localStorage.removeItem('drive_token');
  localStorage.removeItem('drive_token_expiry');
  driveStockFileId = null;
  driveCustomFileId = null;
  driveBridgeFileId      = null;
  driveUnitWeightsFileId = null;
  driveReady = false;
  document.getElementById('drive-signin-row').style.display  = '';
  document.getElementById('drive-status-row').style.display  = 'none';
}

function showDriveConnected() {
  document.getElementById('drive-signin-row').style.display  = 'none';
  document.getElementById('drive-status-row').style.display  = '';
}

function setDriveStatus(msg, type) {
  const txt = document.getElementById('drive-status-text');
  const dot = document.getElementById('drive-dot');
  if (!txt || !dot) return;
  txt.textContent = msg;
  dot.className = 'drive-status-dot ' + type;
}

// ── Trouve un fichier Drive par nom ──
async function findDriveFileByName(name) {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D'${name}'+and+trashed%3Dfalse&fields=files(id)`,
    { headers: { Authorization: `Bearer ${driveAccessToken}` } }
  );
  const d = await r.json();
  return d.files?.[0]?.id || null;
}

// ── Télécharge un fichier Drive par ID ──
async function fetchDriveFile(fileId) {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${driveAccessToken}` } }
  );
  return r.json();
}

// ── Crée ou met à jour un fichier Drive ──
async function saveDriveFile(fileId, fileName, data) {
  const body = JSON.stringify({ ...data, updatedAt: new Date().toISOString() });
  if (!fileId) {
    const meta = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { Authorization: `Bearer ${driveAccessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fileName })
    });
    fileId = (await meta.json()).id;
  }
  await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${driveAccessToken}`, 'Content-Type': 'application/json' },
      body
    }
  );
  return fileId;
}

// ══════════════════════════════════════════════
//  FUSION SÛRE + SAUVEGARDES (bridge custom, unit weights)
// ══════════════════════════════════════════════

// Fusionne une table clé→valeur venue de Drive (ou d'une sauvegarde) dans le
// localStorage : union des clés, rien n'est perdu d'aucun côté. En cas de
// conflit sur une même clé, `incoming` gagne (Drive = version partagée entre
// appareils) — sauf preferLocal (restauration : on rajoute ce qui manque
// sans défaire les corrections faites depuis). L'ancienne valeur locale est
// gardée dans <storageKey>_backup avant écriture (undo d'une génération).
function mergeCustomTable(storageKey, incoming, preferLocal = false) {
  let local = {};
  try { local = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { local = {}; }
  const merged = preferLocal ? { ...incoming, ...local } : { ...local, ...incoming };
  const localOnly   = Object.keys(local).filter(k => !(k in incoming)).length;
  const incomingNew = Object.keys(incoming).filter(k => !(k in local)).length;
  const before = JSON.stringify(local);
  const after  = JSON.stringify(merged);
  if (after !== before) {
    if (Object.keys(local).length > 0) localStorage.setItem(storageKey + '_backup', before);
    localStorage.setItem(storageKey, after);
  }
  return { merged, localOnly, incomingNew };
}

// Avant d'écrire une table sur Drive, y rapatrier les clés que seul Drive
// connaît (local prioritaire en cas de conflit : c'est l'édition en cours).
async function _mergeRemoteBeforeSave(storageKey, fileId, field) {
  if (!fileId) return;
  const remote = await fetchDriveFile(fileId);
  if (remote?.[field] && typeof remote[field] === 'object') mergeCustomTable(storageKey, remote[field], true);
}

const DRIVE_BACKUP_KEEP = 7; // sauvegardes datées conservées par table

// Tables protégées par des sauvegardes Drive datées
const DRIVE_BACKUP_TABLES = {
  recettes_bridge_custom:       { prefix: 'recettes_clara_bridge_custom_backup_', field: 'bridgeCustom', label: '🌉 Mappings bridge' },
  recettes_unit_weights_custom: { prefix: 'recettes_clara_unit_weights_backup_',  field: 'unitWeights',  label: '⚖️ Unités custom' },
};

// ── Liste les fichiers Drive dont le nom commence par prefix (plus récent d'abord) ──
async function listDriveFilesByPrefix(prefix) {
  const q = encodeURIComponent(`name contains '${prefix}' and trashed = false`);
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name)&pageSize=100`,
    { headers: { Authorization: `Bearer ${driveAccessToken}` } }
  );
  const d = await r.json();
  return (d.files || [])
    .filter(f => f.name.startsWith(prefix))
    .sort((a, b) => b.name.localeCompare(a.name)); // YYYY-MM-DD trie chronologiquement
}

async function deleteDriveFile(fileId) {
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${driveAccessToken}` }
  });
}

// ── Sauvegarde datée quotidienne + rotation sur DRIVE_BACKUP_KEEP jours ──
// Appelée après chaque sauvegarde réussie, mais n'écrit qu'une fois par jour
// calendaire. Une table vide n'est jamais sauvegardée : sinon un état vidé
// par un bug finirait par pousser les bonnes sauvegardes hors de la rotation.
async function backupCustomDataToDrive(storageKey) {
  const cfg = DRIVE_BACKUP_TABLES[storageKey];
  if (!cfg || !driveAccessToken || !driveReady) return;
  const today = new Date().toISOString().slice(0, 10);
  const guardKey = storageKey + '_last_drive_backup';
  if (localStorage.getItem(guardKey) === today) return;
  let table = {};
  try { table = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch { return; }
  if (Object.keys(table).length === 0) return;
  try {
    const existing = await listDriveFilesByPrefix(cfg.prefix);
    const todayFile = existing.find(f => f.name === `${cfg.prefix}${today}.json`);
    await saveDriveFile(todayFile ? todayFile.id : null, `${cfg.prefix}${today}.json`, { [cfg.field]: table });
    localStorage.setItem(guardKey, today);
    const all = todayFile ? existing : [{ name: `${cfg.prefix}${today}.json` }, ...existing];
    for (const old of all.slice(DRIVE_BACKUP_KEEP)) if (old.id) await deleteDriveFile(old.id);
    console.info('[Drive] Sauvegarde datée', storageKey, today, '—', Object.keys(table).length, 'entrées');
  } catch(e) {
    console.error('[Drive] Sauvegarde datée échouée :', storageKey, e);
  }
}

// ── Liste les sauvegardes Drive d'une table (pour le panel Contribuer) ──
async function listCustomDataBackups(storageKey) {
  const cfg = DRIVE_BACKUP_TABLES[storageKey];
  if (!cfg || !driveAccessToken || !driveReady) return [];
  const files = await listDriveFilesByPrefix(cfg.prefix);
  return Promise.all(files.map(async f => {
    const data = await fetchDriveFile(f.id).catch(() => ({}));
    const table = data?.[cfg.field] && typeof data[cfg.field] === 'object' ? data[cfg.field] : {};
    return { id: f.id, date: f.name.slice(cfg.prefix.length, -5), count: Object.keys(table).length, table };
  }));
}

// ── Restaure une sauvegarde : FUSION (ajoute ce qui manque), jamais écrasement ──
async function restoreCustomDataBackup(storageKey, fileId) {
  const cfg = DRIVE_BACKUP_TABLES[storageKey];
  if (!cfg) return null;
  const data = await fetchDriveFile(fileId);
  const table = data?.[cfg.field];
  if (!table || typeof table !== 'object') return null;
  const res = mergeCustomTable(storageKey, table, true);
  if (storageKey === 'recettes_bridge_custom') scheduleBridgeSave();
  else scheduleDriveSaveUnitWeights();
  return res;
}

// ══════════════════════════════════════════════
//  CHARGEMENT
// ══════════════════════════════════════════════
async function loadFromDrive() {
  setDriveStatus('Chargement…', 'loading');
  try {
    // Charge le stock
    driveStockFileId = await findDriveFileByName(DRIVE_STOCK_FILE);
    if (driveStockFileId) {
      const data = await fetchDriveFile(driveStockFileId);
      if (data.stock && typeof data.stock === 'object' && !Array.isArray(data.stock)) {
        stock = data.stock;
        localStorage.setItem('recettes_stock', JSON.stringify(stock));
      }
    }

    // Charge les recettes custom
    driveCustomFileId = await findDriveFileByName(DRIVE_CUSTOMS_FILE);
    if (driveCustomFileId) {
      const data = await fetchDriveFile(driveCustomFileId);
      // Fusionner Drive + localStorage
      // Drive peut être en retard si une recette a été créée hors-ligne ou entre deux syncs
      const driveRecipes = Array.isArray(data.customRecipes) ? data.customRecipes : [];
      const localRecipes = JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY) || '[]');
      const merged = [...driveRecipes];
      localRecipes.forEach(r => {
        if (!merged.find(x => x.id === r.id)) merged.push(r);
      });
      merged.forEach(r => {
        r.custom = true;
        if (!RECIPES.find(x => x.id === r.id)) RECIPES.push(r);
        else Object.assign(RECIPES.find(x => x.id === r.id), r);
      });
      localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(merged));
      if (typeof invalidateRecipeMacroCache === 'function') invalidateRecipeMacroCache();
      if (typeof invalidateGLCache === 'function') invalidateGLCache();
      // Si des recettes locales manquaient sur Drive → forcer une resync
      if (merged.length > driveRecipes.length) scheduleCustomRecipesSave();
    }

    // Charge le bridge custom — FUSION avec le local, jamais d'écrasement.
    // Un mapping confirmé dans le Bridge Wizard n'a aucune raison d'expirer :
    // écraser le local par une copie Drive vide/périmée (autre appareil pas
    // encore synchronisé) faisait disparaître silencieusement des mappings.
    driveBridgeFileId = await findDriveFileByName(DRIVE_BRIDGE_FILE);
    if (driveBridgeFileId) {
      const data = await fetchDriveFile(driveBridgeFileId);
      if (data.bridgeCustom && typeof data.bridgeCustom === 'object') {
        const { merged, localOnly } = mergeCustomTable('recettes_bridge_custom', data.bridgeCustom);
        console.info('[Drive] Bridge custom fusionné :', Object.keys(merged).length, 'entrées');
        // Drive en retard sur le local → le rattraper
        if (localOnly > 0) scheduleBridgeSave();
      }
    }

    // Charge les unit weights custom — même fusion que le bridge
    driveUnitWeightsFileId = await findDriveFileByName(DRIVE_UNIT_WEIGHTS_FILE);
    if (driveUnitWeightsFileId) {
      const uwData = await fetchDriveFile(driveUnitWeightsFileId);
      if (uwData.unitWeights && typeof uwData.unitWeights === 'object') {
        const { localOnly } = mergeCustomTable('recettes_unit_weights_custom', uwData.unitWeights);
        if (localOnly > 0) scheduleDriveSaveUnitWeights();
      }
    }

    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');

    // Syncer les données locales qui n'existent pas encore sur Drive
    // (créées hors-ligne ou avant la première connexion)
    const localBridge = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
    if (!driveBridgeFileId && Object.keys(localBridge).length > 0) {
      saveBridgeCustomToDrive();
    }
    const localWeights = JSON.parse(localStorage.getItem('recettes_unit_weights_custom') || '{}');
    if (!driveUnitWeightsFileId && Object.keys(localWeights).length > 0) {
      saveUnitWeightsToDrive();
    }
    const localCiqual = JSON.parse(localStorage.getItem('recettes_ciqual_custom') || '{}');
    if (typeof saveCiqualCustomToDrive === 'function' && Object.keys(localCiqual).length > 0) {
      saveCiqualCustomToDrive();
    }
  } catch(e) {
    setDriveStatus('Erreur · ' + (e.message || e), 'error');
    console.error('Drive load error:', e);
  }
  renderStock(); renderCatalog(); renderGrid(); updateCounts();
}

// ══════════════════════════════════════════════
//  SAUVEGARDE STOCK
// ══════════════════════════════════════════════
async function saveToDriveNow() {
  if (!driveAccessToken || !driveReady) return;
  setDriveStatus('Sauvegarde stock…', 'loading');
  try {
    driveStockFileId = await saveDriveFile(driveStockFileId, DRIVE_STOCK_FILE, { stock });
    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');
  } catch(e) {
    setDriveStatus('Erreur sauvegarde stock', 'error');
    console.error('Drive stock save error:', e);
  }
}

// ══════════════════════════════════════════════
//  SAUVEGARDE RECETTES CUSTOM
// ══════════════════════════════════════════════
async function saveCustomRecipesToDrive() {
  if (!driveAccessToken || !driveReady) return;
  try {
    const customRecipes = RECIPES.filter(r => r.custom === true);
    driveCustomFileId = await saveDriveFile(driveCustomFileId, DRIVE_CUSTOMS_FILE, { customRecipes });
    console.info('[Drive] Recettes custom sauvegardées :', customRecipes.length);
  } catch(e) {
    console.error('Drive custom recipes save error:', e);
  }
}

function scheduleDriveSave() {
  clearTimeout(driveSaveTimer);
  driveSaveTimer = setTimeout(saveToDriveNow, 1000);
}

function scheduleCustomRecipesSave() {
  clearTimeout(driveCustomTimer);
  driveCustomTimer = setTimeout(saveCustomRecipesToDrive, 1000);
}

// ══════════════════════════════════════════════
//  SAUVEGARDE BRIDGE CUSTOM
// ══════════════════════════════════════════════
async function saveBridgeCustomToDrive() {
  if (!driveAccessToken || !driveReady) return;
  try {
    // Lire-fusionner-écrire : un appareil qui n'a pas encore chargé Drive ne
    // doit pas écraser les mappings que d'autres appareils y ont poussés.
    await _mergeRemoteBeforeSave('recettes_bridge_custom', driveBridgeFileId || (driveBridgeFileId = await findDriveFileByName(DRIVE_BRIDGE_FILE)), 'bridgeCustom');
    const bridgeCustom = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
    driveBridgeFileId = await saveDriveFile(driveBridgeFileId, DRIVE_BRIDGE_FILE, { bridgeCustom });
    console.info('[Drive] Bridge custom sauvegardé :', Object.keys(bridgeCustom).length, 'entrées');
    backupCustomDataToDrive('recettes_bridge_custom');
  } catch(e) {
    console.error('[Drive] Bridge custom save error:', e);
  }
}

function scheduleBridgeSave() {
  clearTimeout(driveBridgeTimer);
  driveBridgeTimer = setTimeout(saveBridgeCustomToDrive, 1000);
}

async function saveUnitWeightsToDrive() {
  if (!driveAccessToken || !driveReady) return;
  try {
    await _mergeRemoteBeforeSave('recettes_unit_weights_custom', driveUnitWeightsFileId || (driveUnitWeightsFileId = await findDriveFileByName(DRIVE_UNIT_WEIGHTS_FILE)), 'unitWeights');
    const unitWeights = JSON.parse(localStorage.getItem('recettes_unit_weights_custom') || '{}');
    driveUnitWeightsFileId = await saveDriveFile(driveUnitWeightsFileId, DRIVE_UNIT_WEIGHTS_FILE, { unitWeights });
    backupCustomDataToDrive('recettes_unit_weights_custom');
  } catch(e) {
    console.error('[Drive] Unit weights save error:', e);
  }
}

function scheduleDriveSaveUnitWeights() {
  clearTimeout(driveUnitWeightsTimer);
  driveUnitWeightsTimer = setTimeout(saveUnitWeightsToDrive, 1000);
}
