// ══════════════════════════════════════════════
//  GOOGLE DRIVE — Configuration
//  → Remplace la valeur ci-dessous par ton Client ID Google
// ══════════════════════════════════════════════
const GOOGLE_CLIENT_ID = '758662499322-tmh1469ov6fnp5s0vjeqqd6023gm3edv.apps.googleusercontent.com';
const DRIVE_FILE_NAME  = 'recettes_clara_stock.json';

let driveTokenClient = null;
let driveAccessToken = null;
let driveFileId      = null;
let driveReady       = false;
let driveSaveTimer   = null;

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
  driveTokenClient.requestAccessToken({ prompt: '' });
}

function driveSignIn() {
  if (!driveTokenClient) return;
  driveTokenClient.requestAccessToken({ prompt: 'consent' });
}

function driveSignOut() {
  if (driveAccessToken) google.accounts.oauth2.revoke(driveAccessToken, () => {});
  driveAccessToken = null; driveFileId = null; driveReady = false;
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

async function findDriveFile() {
  const r = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=name%3D'${DRIVE_FILE_NAME}'+and+trashed%3Dfalse&fields=files(id)`,
    { headers: { Authorization: `Bearer ${driveAccessToken}` } }
  );
  const d = await r.json();
  return d.files?.[0]?.id || null;
}

async function loadFromDrive() {
  setDriveStatus('Chargement…', 'loading');
  try {
    driveFileId = await findDriveFile();
    if (!driveFileId) { setDriveStatus('Prêt — aucun fichier encore', 'ok'); return; }
    const r = await fetch(
      `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`,
      { headers: { Authorization: `Bearer ${driveAccessToken}` } }
    );
    const data = await r.json();
    if (Array.isArray(data.stock)) {
      stock = data.stock;
      localStorage.setItem('recettes_stock', JSON.stringify(stock));
      renderStock(); renderCatalog(); renderGrid(); updateCounts();
    }
    const d = data.updatedAt
      ? new Date(data.updatedAt).toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : '';
    setDriveStatus('Synchronisé' + (d ? ' · ' + d : ''), 'ok');
  } catch(e) {
    setDriveStatus('Erreur de chargement', 'error');
    console.error('Drive load error:', e);
  }
}

async function saveToDriveNow() {
  if (!driveAccessToken || !driveReady) return;
  setDriveStatus('Sauvegarde…', 'loading');
  const body = JSON.stringify({ stock, updatedAt: new Date().toISOString() });
  try {
    if (!driveFileId) {
      const meta = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${driveAccessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: DRIVE_FILE_NAME })
      });
      driveFileId = (await meta.json()).id;
    }
    await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${driveFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${driveAccessToken}`, 'Content-Type': 'application/json' },
        body
      }
    );
    const now = new Date().toLocaleString('fr-BE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    setDriveStatus('Synchronisé · ' + now, 'ok');
  } catch(e) {
    setDriveStatus('Erreur de sauvegarde', 'error');
    console.error('Drive save error:', e);
  }
}

function scheduleDriveSave() {
  clearTimeout(driveSaveTimer);
  driveSaveTimer = setTimeout(saveToDriveNow, 1000);
}
