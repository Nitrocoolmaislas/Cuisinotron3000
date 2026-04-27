// ══════════════════════════════════════════════
//  GOOGLE DRIVE — Configuration
// ══════════════════════════════════════════════
const GOOGLE_CLIENT_ID   = '758662499322-tmh1469ov6fnp5s0vjeqqd6023gm3edv.apps.googleusercontent.com';
const DRIVE_STOCK_FILE   = 'recettes_clara_stock.json';
const DRIVE_CUSTOMS_FILE  = 'recettes_clara_custom.json';
const DRIVE_BRIDGE_FILE   = 'recettes_clara_bridge_custom.json';

let driveTokenClient  = null;
let driveAccessToken  = null;
let driveStockFileId  = null;
let driveCustomFileId = null;
  driveBridgeFileId = null;
let driveBridgeFileId = null;
let driveReady        = false;
let driveSaveTimer    = null;
let driveCustomTimer  = null;
let driveBridgeTimer  = null;

function onGISLoad() {
  const configured = GOOGLE_CLIENT_ID !== 'VOTRE_CLIENT_ID_ICI';
  document.getElementById('drive-not-configured').style.display = configured ? 'none' : '';
  document.getElementById('drive-signin-row').style.display     = configured ? '' : 'none';
  if (!configured) return;

  driveTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.file',
    callback: async (resp) => {
      if (resp.error) { setDriveStatus('Erreur d\'authentification', 'error'); return; }
      driveAccessToken = resp.access_token;
      driveReady = true;
      showDriveConnected();
      await loadFromDrive();
    }
  });
  // Pas de tentative silencieuse — évite le popup bloqué par le navigateur
}

function driveSignIn() {
  if (!driveTokenClient) return;
  driveTokenClient.requestAccessToken({ prompt: 'consent' });
}

function driveSignOut() {
  if (driveAccessToken) google.accounts.oauth2.revoke(driveAccessToken, () => {});
  driveAccessToken = null;
  driveStockFileId = null;
  driveCustomFileId = null;
  driveBridgeFileId = null;
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
      if (Array.isArray(data.customRecipes) && data.customRecipes.length > 0) {
        data.customRecipes.forEach(r => {
          r.custom = true;
          if (!RECIPES.find(x => x.id === r.id)) RECIPES.push(r);
          else Object.assign(RECIPES.find(x => x.id === r.id), r);
        });
        localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(data.customRecipes));
      }
    }

    // Charge le bridge custom
    driveBridgeFileId = await findDriveFileByName(DRIVE_BRIDGE_FILE);
    if (driveBridgeFileId) {
      const data = await fetchDriveFile(driveBridgeFileId);
      if (data.bridgeCustom && typeof data.bridgeCustom === 'object') {
        // Drive = source de vérité — écrase le localStorage
        localStorage.setItem('recettes_bridge_custom', JSON.stringify(data.bridgeCustom));
        console.info('[Drive] Bridge custom chargé :', Object.keys(data.bridgeCustom).length, 'entrées');
      }
    }

    renderStock(); renderCatalog(); renderGrid(); updateCounts();
    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');
  } catch(e) {
    setDriveStatus('Erreur de chargement', 'error');
    console.error('Drive load error:', e);
  }
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
    const bridgeCustom = JSON.parse(localStorage.getItem('recettes_bridge_custom') || '{}');
    driveBridgeFileId = await saveDriveFile(driveBridgeFileId, DRIVE_BRIDGE_FILE, { bridgeCustom });
    console.info('[Drive] Bridge custom sauvegardé :', Object.keys(bridgeCustom).length, 'entrées');
  } catch(e) {
    console.error('[Drive] Bridge custom save error:', e);
  }
}

function scheduleBridgeSave() {
  clearTimeout(driveBridgeTimer);
  driveBridgeTimer = setTimeout(saveBridgeCustomToDrive, 1000);
}
