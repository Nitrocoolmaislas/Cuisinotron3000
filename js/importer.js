// ══════════════════════════════════════════════
//  IMPORTER — import de recettes via bookmarklet
//  Détecte le fragment #import=... dans l'URL
//  Parse le JSON-LD schema.org/Recipe
//  Affiche un panel de confirmation/édition
//  Sauvegarde via saveCustomRecipes()
// ══════════════════════════════════════════════

// ── Mapping catégories depuis les keywords Marmiton / schema.org ──
const IMPORT_CATEGORY_HINTS = {
  repas:      ['plat', 'soupe', 'gratin', 'curry', 'wok', 'poêlée', 'risotto',
               'pasta', 'pâtes', 'viande', 'poisson', 'légumineuse', 'riz',
               'main', 'dinner', 'lunch'],
  tartinade:  ['tartinade', 'dip', 'houmous', 'hummus', 'tapenade', 'spread',
               'sauce', 'condiment', 'entrée', 'apéro', 'guacamole'],
  petitdej:   ['petit-déjeuner', 'petit déjeuner', 'breakfast', 'porridge',
               'muesli', 'granola', 'smoothie', 'pancake', 'crêpe', 'muffin'],
};

// ── Deviner la catégorie depuis le titre + keywords ──
function _guessCategory(title = '', keywords = []) {
  const hay = (title + ' ' + keywords.join(' ')).toLowerCase();
  for (const [cat, hints] of Object.entries(IMPORT_CATEGORY_HINTS)) {
    if (hints.some(h => hay.includes(h))) return cat;
  }
  return 'repas'; // défaut
}

// ── Normaliser les étapes schema.org (HowToStep ou string) ──
function _parseSteps(raw = []) {
  return raw.map(s => {
    if (typeof s === 'string') return s.trim();
    if (s['@type'] === 'HowToSection') {
      return (s.itemListElement || []).map(sub =>
        typeof sub === 'string' ? sub : (sub.text || sub.name || '')
      ).filter(Boolean).join(' ');
    }
    return (s.text || s.name || '').trim();
  }).filter(Boolean);
}

// ── Parser la durée ISO 8601 en minutes ──
function _parseDuration(iso = '') {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 60) + parseInt(m[2] || 0);
}

// ══════════════════════════════════════════════
//  PARSING JSON-LD
// ══════════════════════════════════════════════
function parseRecipeJsonLd(ld) {
  // Peut être un objet direct ou un array
  const recipe = Array.isArray(ld)
    ? ld.find(x => x['@type'] === 'Recipe' || (Array.isArray(x['@type']) && x['@type'].includes('Recipe')))
    : ld;

  if (!recipe) throw new Error('Aucune recette trouvée dans le JSON-LD');

  const title       = recipe.name || '';
  const description = recipe.description || '';
  const ingredients = (recipe.recipeIngredient || []).map(s => s.trim()).filter(Boolean);
  const steps       = _parseSteps(recipe.recipeInstructions || []);
  const servings    = parseInt(recipe.recipeYield) || 2;
  const prepTime    = _parseDuration(recipe.prepTime);
  const cookTime    = _parseDuration(recipe.cookTime || recipe.totalTime);
  const keywords    = typeof recipe.keywords === 'string'
    ? recipe.keywords.split(',').map(s => s.trim())
    : (recipe.keywords || []);
  const category    = _guessCategory(title, keywords);
  const sourceUrl   = recipe.url || recipe.mainEntityOfPage?.['@id'] || '';
  const image       = Array.isArray(recipe.image)
    ? recipe.image[0]?.url || recipe.image[0]
    : recipe.image?.url || recipe.image || '';

  if (!title)             throw new Error('Titre manquant dans le JSON-LD');
  if (!ingredients.length) throw new Error('Aucun ingrédient trouvé');
  if (!steps.length)      throw new Error('Aucune étape trouvée');

  return { title, description, ingredients, steps, servings,
           prepTime, cookTime, category, keywords, sourceUrl, image };
}

// ══════════════════════════════════════════════
//  PANEL D'IMPORT
// ══════════════════════════════════════════════
let _importData = null;

function openImportPanel(data) {
  _importData = data;

  const panel = document.getElementById('import-panel');
  if (!panel) return;

  const catLabels = { repas: '🍲 Repas chauds', tartinade: '🥙 Tartinades & Dips', petitdej: '🥣 Petits-déjeuners' };

  // Analyser les ingrédients avec le nouveau parser si disponible
  const parsedIngredients = data.ingredients.map(raw => {
    if (typeof parseIngredientString !== 'undefined') {
      const p = parseIngredientString(raw);
      const normKey = normIngredient(p.rawName);
      const hasBridge = typeof bridgeLookupFull !== 'undefined'
        ? bridgeLookupFull(normKey) !== null
        : false;
      // Vérifier si l'unité est mappée dans UNIT_WEIGHTS / custom
      const unitMapped = typeof isUnitMapped !== 'undefined'
        ? isUnitMapped(p.unit)
        : true;
      return { raw, rawName: p.rawName, normKey, unit: p.unit, qty: p.qty, hasBridge, unitMapped };
    }
    return { raw, rawName: raw, normKey: '', unit: null, qty: null, hasBridge: false, unitMapped: true };
  });

  const unknownCount   = parsedIngredients.filter(p => !p.hasBridge).length;
  const unknownUnits   = [...new Set(
    parsedIngredients.filter(p => p.unit && !p.unitMapped).map(p => p.unit)
  )];

  panel.innerHTML = `
    <div class="ip-header">
      <div class="ip-header-left">
        <div class="ip-source">📥 Import depuis ${data.sourceUrl ? new URL(data.sourceUrl).hostname : 'une recette externe'}</div>
        <h2 class="ip-title" id="ip-title-display">${data.title}</h2>
      </div>
      <button class="ip-close" onclick="closeImportPanel()">✕</button>
    </div>

    <div class="ip-body">

      <!-- Titre éditable -->
      <div class="ip-field">
        <label class="ip-label">Titre</label>
        <input class="ip-input" id="ip-title" value="${escapeAttr(data.title)}"
          oninput="document.getElementById('ip-title-display').textContent=this.value">
      </div>

      <!-- Catégorie -->
      <div class="ip-field">
        <label class="ip-label">Catégorie</label>
        <select class="ip-select" id="ip-category">
          ${Object.entries(catLabels).map(([v,l]) =>
            `<option value="${v}" ${v === data.category ? 'selected' : ''}>${l}</option>`
          ).join('')}
        </select>
      </div>

      <!-- Meta -->
      <div class="ip-meta-row">
        <div class="ip-field ip-field-sm">
          <label class="ip-label">Prép. (min)</label>
          <input class="ip-input" id="ip-prep" type="number" value="${data.prepTime || ''}">
        </div>
        <div class="ip-field ip-field-sm">
          <label class="ip-label">Cuisson (min)</label>
          <input class="ip-input" id="ip-cook" type="number" value="${data.cookTime || ''}">
        </div>
        <div class="ip-field ip-field-sm">
          <label class="ip-label">Portions</label>
          <input class="ip-input" id="ip-servings" type="number" value="${data.servings || 2}">
        </div>
      </div>

      <!-- Description -->
      ${data.description ? `
      <div class="ip-field">
        <label class="ip-label">Description</label>
        <textarea class="ip-textarea" id="ip-desc">${escapeAttr(data.description)}</textarea>
      </div>` : ''}

      <!-- Ingrédients -->
      <div class="ip-field">
        <label class="ip-label">
          Ingrédients
          ${unknownCount > 0 ? `<span class="ip-badge-warn">⚠️ ${unknownCount} non mappé${unknownCount > 1 ? 's' : ''} dans le bridge</span>` : '<span class="ip-badge-ok">✅ Tous mappés</span>'}
        </label>
        <div class="ip-ingredient-list" id="ip-ingredients">
          ${parsedIngredients.map((p, i) => `
            <div class="ip-ing-row">
              <input class="ip-ing-input ${p.hasBridge ? '' : 'ip-ing-unknown'}"
                id="ip-ing-${i}" value="${escapeAttr(p.raw)}">
              <span class="ip-ing-status" title="${p.hasBridge ? 'Mappé dans le bridge Colruyt' : 'Non trouvé dans le bridge — sera ajouté en pending'}">
                ${p.hasBridge ? '✅' : '⚠️'}
              </span>
            </div>
          `).join('')}
        </div>
        <button class="ip-add-btn" onclick="importAddIngredient()">+ Ajouter</button>
      </div>

      <!-- Unités non mappées -->
      ${unknownUnits.length > 0 ? `
      <div class="ip-field">
        <label class="ip-label">
          ⚖️ Unités inconnues
          <span class="ip-badge-warn">${unknownUnits.length} sans équivalent grammes</span>
        </label>
        <p style="font-size:0.78rem;color:#9c8f85;margin:0 0 8px">
          Ces unités ne sont pas encore connues. Donne leur un équivalent en grammes
          pour que la déduction de stock fonctionne correctement.
        </p>
        <div id="ip-unit-weights">
          ${unknownUnits.map(u => `
            <div class="ip-unit-row">
              <span class="ip-unit-label">1 <strong>${u}</strong> =</span>
              <input class="ip-unit-input" type="number" min="0" step="0.1"
                id="ip-unit-${u.replace(/[^a-z]/gi,'_')}"
                placeholder="grammes">
              <span class="ip-unit-suffix">g</span>
            </div>
          `).join('')}
        </div>
        <button class="ip-add-btn" onclick="saveImportUnitWeights()">
          💾 Sauvegarder ces équivalences
        </button>
      </div>` : ''}

      <!-- Étapes -->
      <div class="ip-field">
        <label class="ip-label">Étapes</label>
        <div id="ip-steps">
          ${data.steps.map((s, i) => `
            <div class="ip-step-row">
              <span class="ip-step-num">${i + 1}</span>
              <textarea class="ip-step-input" id="ip-step-${i}">${escapeAttr(s)}</textarea>
            </div>
          `).join('')}
        </div>
      </div>

      ${data.sourceUrl ? `
      <div class="ip-source-link">
        <a href="${data.sourceUrl}" target="_blank" rel="noopener">🔗 Voir la recette originale</a>
      </div>` : ''}

    </div>

    <div class="ip-footer">
      <button class="ip-btn-ghost" onclick="closeImportPanel()">Annuler</button>
      <button class="ip-btn-primary" onclick="confirmImport()">✅ Importer la recette</button>
    </div>
  `;

  panel.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Nettoyer le hash pour éviter de re-déclencher l'import au refresh
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

function closeImportPanel() {
  const panel = document.getElementById('import-panel');
  if (panel) panel.classList.remove('open');
  document.body.style.overflow = '';
  _importData = null;
}

function importAddIngredient() {
  const list = document.getElementById('ip-ingredients');
  if (!list) return;
  const idx = list.querySelectorAll('.ip-ing-row').length;
  const row = document.createElement('div');
  row.className = 'ip-ing-row';
  row.innerHTML = `<input class="ip-ing-input" id="ip-ing-${idx}" placeholder="ex: 200g de farine">
                   <span class="ip-ing-status">—</span>`;
  list.appendChild(row);
  row.querySelector('input').focus();
}

// ── Confirmer et sauvegarder ──
function confirmImport() {
  if (!_importData) return;

  const title    = document.getElementById('ip-title').value.trim();
  const category = document.getElementById('ip-category').value;
  const prep     = parseInt(document.getElementById('ip-prep').value) || 0;
  const cook     = parseInt(document.getElementById('ip-cook').value) || 0;
  const servings = parseInt(document.getElementById('ip-servings').value) || 2;
  const descEl   = document.getElementById('ip-desc');
  const desc     = descEl ? descEl.value.trim() : (_importData.description || '');

  // Récupérer ingrédients depuis le DOM
  const ingredients = [...document.getElementById('ip-ingredients')
    .querySelectorAll('.ip-ing-input')]
    .map(el => el.value.trim()).filter(Boolean);

  // Récupérer étapes depuis le DOM
  const steps = [...document.getElementById('ip-steps')
    .querySelectorAll('.ip-step-input')]
    .map(el => el.value.trim()).filter(Boolean);

  if (!title)             { alert('Le titre est obligatoire'); return; }
  if (!ingredients.length){ alert('Au moins un ingrédient requis'); return; }
  if (!steps.length)      { alert('Au moins une étape requise'); return; }

  const catLabels = { repas: 'Repas chauds', tartinade: 'Tartinades & Dips', petitdej: 'Petits-déjeuners' };

  const recipe = {
    id:            slugify(title),
    custom:        true,
    imported:      true,
    sourceUrl:     _importData.sourceUrl || '',
    category,
    categoryLabel: catLabels[category],
    name:          title,
    description:   desc,
    prepTime:      prep,
    cookTime:      cook,
    servings,
    ingredients,
    steps,
    notes:         _importData.sourceUrl
      ? `Recette importée depuis ${_importData.sourceUrl}`
      : null,
  };

  RECIPES.push(recipe);
  saveCustomRecipes();
  closeImportPanel();
  renderGrid();
  updateCounts();
  showToast('📥 Recette importée !');

  // Les ingrédients non mappés ont été ajoutés en pending par bridgeLookupFull
  // → le badge Bridge Wizard se mettra à jour automatiquement
  if (typeof refreshBadge === 'function') refreshBadge();
}

// ══════════════════════════════════════════════
//  DÉTECTION AU CHARGEMENT
// ══════════════════════════════════════════════
function checkImportHash() {
  const hash = window.location.hash;
  if (!hash.startsWith('#import=')) return;

  try {
    const raw    = decodeURIComponent(hash.slice('#import='.length));
    const parsed = JSON.parse(raw);
    const data   = parseRecipeJsonLd(parsed);
    // Légère pause pour que l'UI soit prête
    setTimeout(() => openImportPanel(data), 300);
  } catch(e) {
    console.warn('[Importer] Erreur parsing import:', e.message);
    showToast('⚠️ Impossible de lire la recette importée : ' + e.message);
    history.replaceState(null, '', window.location.pathname);
  }
}

// ══════════════════════════════════════════════
//  NIVEAU 1 — IMPORT PAR URL (proxy CORS)
//  NIVEAU 2 — BOOKMARKLET (déjà géré via #import=)
//  NIVEAU 3 — IMPORT MANUEL JSON-LD
// ══════════════════════════════════════════════

// Proxys CORS tentés dans l'ordre — si l'un échoue on passe au suivant
const CORS_PROXIES = [
  url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// ── Fetch HTML via proxy CORS avec fallback ──
async function _fetchViaProxy(url) {
  let lastError = null;
  for (const buildProxyUrl of CORS_PROXIES) {
    try {
      const proxyUrl = buildProxyUrl(url);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Lire en texte brut d'abord
      const text = await res.text();

      // allorigins renvoie { contents: '<html>...' } — tenter le parse JSON
      try {
        const json = JSON.parse(text);
        if (json.contents) return json.contents; // allorigins
      } catch(e) {
        // Pas du JSON → c'est directement le HTML (corsproxy.io)
      }

      // Vérifier que c'est bien du HTML et pas une erreur proxy
      if (text.trim().startsWith('<')) return text;
      throw new Error('Réponse proxy inattendue : ' + text.slice(0, 80));

    } catch(e) {
      lastError = e;
      console.warn('[Importer] Proxy échoué:', e.message);
    }
  }
  throw lastError;
}

// ── Extraire le JSON-LD depuis un HTML string ──
function _extractJsonLdFromHtml(html) {
  const parser   = new DOMParser();
  const doc      = parser.parseFromString(html, 'text/html');
  const scripts  = doc.querySelectorAll('script[type="application/ld+json"]');

  for (const s of scripts) {
    try {
      const data = JSON.parse(s.textContent);
      const candidates = Array.isArray(data) ? data
        : data['@graph'] ? data['@graph']
        : [data];
      const recipe = candidates.find(x => {
        const t = x['@type'];
        return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'));
      });
      if (recipe) return recipe;
    } catch(e) {}
  }
  return null;
}

// ── Importer depuis une URL (niveau 1) ──
async function importFromUrl() {
  const input = document.getElementById('import-url-input');
  if (!input) return;

  const url = input.value.trim();
  if (!url) return;

  // Validation URL basique
  try { new URL(url); } catch(e) {
    _showImportError('URL invalide. Ex: https://www.marmiton.org/recettes/...');
    return;
  }

  _setImportLoading(true);
  _showImportError('');

  try {
    const html   = await _fetchViaProxy(url);
    const ld     = _extractJsonLdFromHtml(html);
    if (!ld) throw new Error('Aucune recette structurée trouvée sur cette page.');
    if (!ld.url) ld.url = url;
    const data   = parseRecipeJsonLd(ld);
    _setImportLoading(false);
    closeImportUrlPanel();
    openImportPanel(data);
  } catch(e) {
    _setImportLoading(false);
    _showImportError(e.message);
    // Affiche les fallbacks niveau 2 & 3
    _showImportFallbacks(url);
  }
}

// ── Importer depuis JSON-LD collé manuellement (niveau 3) ──
function importFromManualJson() {
  const textarea = document.getElementById('import-manual-textarea');
  if (!textarea) return;

  const raw = textarea.value.trim();
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    const data   = parseRecipeJsonLd(parsed);
    closeImportUrlPanel();
    openImportPanel(data);
  } catch(e) {
    _showImportError('JSON invalide ou pas de recette : ' + e.message);
  }
}

// ── Helpers UI ──
function _setImportLoading(loading) {
  const btn = document.getElementById('import-url-btn');
  const spinner = document.getElementById('import-spinner');
  if (btn)     btn.disabled = loading;
  if (spinner) spinner.style.display = loading ? 'inline' : 'none';
}

function _showImportError(msg) {
  const el = document.getElementById('import-url-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}

function _showImportFallbacks(url) {
  const el = document.getElementById('import-fallbacks');
  if (!el) return;
  el.style.display = '';
  // Met à jour le lien bookmarklet avec l'URL courante
  const bkLink = document.getElementById('import-bk-link');
  if (bkLink) bkLink.href = url;
}

// ══════════════════════════════════════════════
//  PANEL URL D'IMPORT
// ══════════════════════════════════════════════
function openImportUrlPanel() {
  const panel = document.getElementById('import-url-panel');
  if (!panel) return;
  // Reset état
  const input = document.getElementById('import-url-input');
  if (input) input.value = '';
  _showImportError('');
  const fb = document.getElementById('import-fallbacks');
  if (fb) fb.style.display = 'none';
  const manual = document.getElementById('import-manual-section');
  if (manual) manual.style.display = 'none';
  panel.classList.add('open');
}

function closeImportUrlPanel() {
  const panel = document.getElementById('import-url-panel');
  if (panel) panel.classList.remove('open');
}

function toggleManualSection() {
  const el = document.getElementById('import-manual-section');
  if (!el) return;
  const isOpen = el.style.display !== 'none';
  el.style.display = isOpen ? 'none' : '';
}

// ── Copier le bookmarklet dans le presse-papier ──
function copyBookmarklet() {
  const code = document.getElementById('bk-code');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent.trim())
    .then(() => showToast('📋 Bookmarklet copié !'))
    .catch(() => {
      // Fallback pour navigateurs sans clipboard API
      const ta = document.createElement('textarea');
      ta.value = code.textContent.trim();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('📋 Bookmarklet copié !');
    });
}

function toggleBookmarkletHelp() {
  const el = document.getElementById('bk-help');
  if (!el) return;
  el.style.display = el.style.display === 'none' ? '' : 'none';
}

// ── Fermer le panel URL sur Escape ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeImportUrlPanel();
});

// ─── Sauvegarder les équivalences d'unités depuis le panel import ─────────────
function saveImportUnitWeights() {
  const container = document.getElementById('ip-unit-weights');
  if (!container) return;

  const inputs = container.querySelectorAll('input[type="number"]');
  let saved = 0;

  inputs.forEach(input => {
    // Extraire l'unité depuis l'id "ip-unit-UNIT"
    const unitRaw = input.id.replace('ip-unit-', '').replace(/_/g, ' ');
    // Retrouver l'unité originale depuis le label (plus fiable)
    const label = input.closest('.ip-unit-row')?.querySelector('strong')?.textContent;
    const unit  = label || unitRaw;
    const grams = parseFloat(input.value);

    if (!unit || isNaN(grams) || grams <= 0) return;

    if (typeof addUnitWeightCustom === 'function') {
      addUnitWeightCustom(unit, grams);
      saved++;
    }
  });

  if (saved > 0) {
    showToast(`⚖️ ${saved} équivalence${saved > 1 ? 's' : ''} sauvegardée${saved > 1 ? 's' : ''} !`);
    // Rafraîchir les statuts dans le panel
    container.querySelectorAll('.ip-unit-row').forEach(row => {
      row.style.opacity = '0.5';
    });
  } else {
    showToast('⚠️ Remplis au moins une valeur avant de sauvegarder');
  }
}
