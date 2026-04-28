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
            À ajouter dans <code>js/bridge.js</code>, dans <code>INGREDIENT_BRIDGE</code> :
          </p>
          <div class="contrib-snippet" id="snippet-bridge">
            <pre class="contrib-code">${_generateBridgeSnippet(bridgeCustom)}</pre>
            <button class="contrib-copy-btn" onclick="copySnippet('snippet-bridge', this)">
              📋 Copier
            </button>
          </div>
          <div class="contrib-actions">
            <a href="https://github.com/Nitrocoolmaislas/Cuisinotron3000/edit/main/js/bridge.js"
               target="_blank" class="contrib-github-btn">
              ✏️ Ouvrir bridge.js sur GitHub
            </a>
          </div>
        `}
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
      const pad = Math.max(0, 26 - normKey.length);
      const spaces = ' '.repeat(pad);
      const termsStr = JSON.stringify(terms);
      return `  '${normKey}':${spaces}${termsStr},`;
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
