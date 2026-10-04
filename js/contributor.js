// ══════════════════════════════════════════════
//  CONTRIBUTOR — Export données custom vers GitHub
//
//  Permet d'exporter les unit_weights_custom et
//  bridge_custom sous forme de snippets JS prêts
//  à coller dans nutrition_data.js et bridge.js
// ══════════════════════════════════════════════

// ─── Render du panel Contribuer ───────────────────────────────────────────────
function renderContributorPanel() {
  const container = document.getElementById('tab-contribuer');
  if (!container) return;

  const unitWeights = _loadCustom('recettes_unit_weights_custom');
  const bridgeCustom = _loadCustom('recettes_bridge_custom');

  container.innerHTML = `
    <div class="contrib-body">

      <div class="contrib-intro">
        <h3 class="contrib-title">⚙️ Contribuer au projet</h3>
        <p class="contrib-desc">
          Tes données custom (unités et mappings bridge) sont stockées localement
          et sur Drive. Tu peux les exporter ici sous forme de snippets prêts à
          intégrer dans le code source sur GitHub — pour que tous les utilisateurs
          en bénéficient.
        </p>
      </div>

      <!-- Section 1 : Unités custom -->
      <div class="contrib-section">
        <div class="contrib-section-header">
          <span class="contrib-section-title">⚖️ Unités custom</span>
          <span class="contrib-badge ${Object.keys(unitWeights).length > 0 ? 'contrib-badge-active' : 'contrib-badge-empty'}">
            ${Object.keys(unitWeights).length} entrée${Object.keys(unitWeights).length !== 1 ? 's' : ''}
          </span>
        </div>

        ${Object.keys(unitWeights).length === 0 ? `
          <p class="contrib-empty">Aucune unité custom définie pour l'instant.<br>
          Elles apparaissent ici quand tu importes une recette avec des unités inconnues.</p>
        ` : `
          <p class="contrib-hint">
            À ajouter dans <code>data/nutrition_data.js</code>, dans la table <code>UNIT_WEIGHTS</code> :
          </p>
          <div class="contrib-snippet" id="snippet-units">
            <pre class="contrib-code">${_generateUnitWeightsSnippet(unitWeights)}</pre>
            <button class="contrib-copy-btn" onclick="copySnippet('snippet-units', this)">
              📋 Copier
            </button>
          </div>
          <div class="contrib-actions">
            <a href="https://github.com/Nitrocoolmaislas/Cuisinotron3000/edit/main/data/nutrition_data.js"
               target="_blank" class="contrib-github-btn">
              ✏️ Ouvrir nutrition_data.js sur GitHub
            </a>
          </div>
        `}
      </div>

      <!-- Section 2 : Bridge custom -->
      <div class="contrib-section">
        <div class="contrib-section-header">
          <span class="contrib-section-title">🌉 Mappings bridge custom</span>
          <span class="contrib-badge ${Object.keys(bridgeCustom).length > 0 ? 'contrib-badge-active' : 'contrib-badge-empty'}">
            ${Object.keys(bridgeCustom).length} entrée${Object.keys(bridgeCustom).length !== 1 ? 's' : ''}
          </span>
        </div>

        ${Object.keys(bridgeCustom).length === 0 ? `
          <p class="contrib-empty">Aucun mapping custom défini.<br>
          Ils apparaissent ici quand tu résous des ingrédients via le Bridge Wizard.</p>
        ` : `
          <p class="contrib-hint">
            À ajouter dans <code>data/whitelist_canonique.js</code>, dans <code>WHITELIST</code> —
            si un ingrédient proche existe déjà, ajoute plutôt <code>colruytTerms</code> à son
            entrée existante au lieu de coller une nouvelle ligne :
          </p>
          <div class="contrib-snippet" id="snippet-bridge">
            <pre class="contrib-code">${_generateBridgeSnippet(bridgeCustom)}</pre>
            <button class="contrib-copy-btn" onclick="copySnippet('snippet-bridge', this)">
              📋 Copier
            </button>
          </div>
          <div class="contrib-actions">
            <a href="https://github.com/Nitrocoolmaislas/Cuisinotron3000/edit/main/data/whitelist_canonique.js"
               target="_blank" class="contrib-github-btn">
              ✏️ Ouvrir whitelist_canonique.js sur GitHub
            </a>
          </div>
        `}
      </div>

      <!-- Section 3 : Sauvegardes (filet de sécurité contre une perte de mappings) -->
      <div class="contrib-section" id="contrib-backups">
        <div class="contrib-section-header">
          <span class="contrib-section-title">🕐 Sauvegardes</span>
        </div>
        ${_localBackupHtml()}
        <div id="contrib-drive-backups">
          <p class="contrib-empty">${typeof driveReady !== 'undefined' && driveReady
            ? 'Chargement des sauvegardes Drive…'
            : 'Connecte Google Drive pour voir les sauvegardes quotidiennes (7 derniers jours).'}</p>
        </div>
      </div>

      <!-- Instructions -->
      <div class="contrib-section contrib-instructions">
        <div class="contrib-section-title">📖 Comment contribuer</div>
        <ol class="contrib-steps">
          <li>Copie le snippet de la section concernée</li>
          <li>Clique sur le bouton "Ouvrir sur GitHub"</li>
          <li>Trouve la section correspondante dans le fichier</li>
          <li>Colle le snippet aux côtés des entrées existantes</li>
          <li>Commit avec un message clair (ex: <em>"feat: add tasse/gobelet to UNIT_WEIGHTS"</em>)</li>
          <li>GitHub Pages se redéploie automatiquement — tous les appareils sont mis à jour</li>
        </ol>
      </div>

    </div>
  `;
  _renderDriveBackups();
}

// ─── Sauvegardes ──────────────────────────────────────────────────────────────
// Undo local d'une génération (écrit par mergeCustomTable() dans drive.js)
function _localBackupHtml() {
  const rows = Object.entries(typeof DRIVE_BACKUP_TABLES !== 'undefined' ? DRIVE_BACKUP_TABLES : {})
    .map(([key, cfg]) => {
      const n = Object.keys(_loadCustom(key + '_backup')).length;
      if (!n) return '';
      return `<li>${cfg.label} — état local avant la dernière synchro : ${n} entrée${n !== 1 ? 's' : ''}
        <button class="contrib-copy-btn" onclick="restoreLocalBackup('${key}')">♻️ Restaurer</button></li>`;
    }).join('');
  return rows ? `<ul class="contrib-steps">${rows}</ul>` : '';
}

async function _renderDriveBackups() {
  const box = document.getElementById('contrib-drive-backups');
  if (!box || typeof listCustomDataBackups !== 'function' || !driveReady) return;
  try {
    const parts = [];
    for (const [key, cfg] of Object.entries(DRIVE_BACKUP_TABLES)) {
      const backups = await listCustomDataBackups(key);
      const current = _loadCustom(key);
      const rows = backups.map(b => {
        const missing = Object.keys(b.table).filter(k => !(k in current)).length;
        return `<li>${b.date} — ${b.count} entrée${b.count !== 1 ? 's' : ''}${missing ? ` (<strong>${missing} absente${missing !== 1 ? 's' : ''} aujourd'hui</strong>)` : ''}
          ${missing ? `<button class="contrib-copy-btn" onclick="restoreDriveBackup('${key}','${b.id}')">♻️ Restaurer</button>` : ''}</li>`;
      }).join('');
      parts.push(`<p class="contrib-hint">${cfg.label} sur Drive :</p>` +
        (rows ? `<ul class="contrib-steps">${rows}</ul>` : '<p class="contrib-empty">Aucune sauvegarde pour l\'instant.</p>'));
    }
    box.innerHTML = parts.join('') +
      '<p class="contrib-hint">Restaurer ajoute les entrées manquantes sans toucher à celles qui existent déjà.</p>';
  } catch(e) {
    box.innerHTML = `<p class="contrib-empty">Sauvegardes Drive indisponibles : ${escapeAttr(e.message || String(e))}</p>`;
  }
}

async function restoreDriveBackup(storageKey, fileId) {
  const res = await restoreCustomDataBackup(storageKey, fileId);
  if (res) alert(`${res.incomingNew} entrée${res.incomingNew !== 1 ? 's' : ''} restaurée${res.incomingNew !== 1 ? 's' : ''}.`);
  _afterRestore();
}

function restoreLocalBackup(storageKey) {
  const res = mergeCustomTable(storageKey, _loadCustom(storageKey + '_backup'), true);
  alert(`${res.incomingNew} entrée${res.incomingNew !== 1 ? 's' : ''} restaurée${res.incomingNew !== 1 ? 's' : ''}.`);
  if (storageKey === 'recettes_bridge_custom' && typeof scheduleBridgeSave === 'function') scheduleBridgeSave();
  if (storageKey === 'recettes_unit_weights_custom' && typeof scheduleDriveSaveUnitWeights === 'function') scheduleDriveSaveUnitWeights();
  _afterRestore();
}

function _afterRestore() {
  renderContributorPanel();
  if (typeof refreshBadge === 'function') refreshBadge();
  if (typeof renderGrid === 'function') renderGrid();
}

// ─── Générateurs de snippets ──────────────────────────────────────────────────
function _generateUnitWeightsSnippet(unitWeights) {
  if (!Object.keys(unitWeights).length) return '';
  const lines = Object.entries(unitWeights)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([unit, grams]) => {
      const pad = Math.max(0, 16 - unit.length);
      const spaces = ' '.repeat(pad);
      const comment = `// 1 ${unit} ≈ ${grams}g`;
      return `  '${unit}':${spaces}(_) => ${grams}, ${comment}`;
    });
  return lines.join('\n');
}

function _generateBridgeSnippet(bridgeCustom) {
  if (!Object.keys(bridgeCustom).length) return '';
  const lines = Object.entries(bridgeCustom)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([normKey, terms]) => {
      const name = normKey.replace(/\b\w/g, c => c.toUpperCase());
      const entry = { k: normKey, name, cat: 'À catégoriser', aliases: [], ciqual: null, colruytTerms: terms };
      return `  ${JSON.stringify(entry)},`;
    });
  return lines.join('\n');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _loadCustom(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}'); }
  catch { return {}; }
}

function copySnippet(containerId, btn) {
  const pre = document.querySelector(`#${containerId} .contrib-code`);
  if (!pre) return;
  const text = pre.textContent.trim();
  navigator.clipboard.writeText(text)
    .then(() => {
      btn.textContent = '✅ Copié !';
      setTimeout(() => btn.textContent = '📋 Copier', 2000);
    })
    .catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = '✅ Copié !';
      setTimeout(() => btn.textContent = '📋 Copier', 2000);
    });
}
