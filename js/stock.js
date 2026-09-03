// ══════════════════════════════════════════════
//  STOCK — état global + gestion
// ══════════════════════════════════════════════

let _mergeSelection = new Set();
let _catalogMergeSelection = new Set();

function loadStockFromStorage() {
  try {
    const raw = JSON.parse(localStorage.getItem('recettes_stock') || 'null');
    if (!raw) return {};
    // Migration ancien format array
    if (Array.isArray(raw)) {
      const obj = {};
      raw.forEach(name => { const k = normIngredient(name); obj[k] = { name, unit: '', qty: 0 }; });
      return obj;
    }
    return raw;
  } catch(e) { return {}; }
}

// ─── Migration des clés stock ─────────────────────────────────────────────────
// L'ancienne version de normIngredient remplaçait les non-alphanum par des espaces
// (ex: "flocons d avoine") alors que la nouvelle les supprime ("flocons davoine").
// Cette migration renormalise toutes les clés existantes au chargement.
function migrateStockKeys(rawStock) {
  const migrated = {};
  let changed = false;
  for (const [oldKey, entry] of Object.entries(rawStock)) {
    // Ignorer les entrées corrompues (nom commençant par / ou chiffre isolé)
    const entryName = entry.name || oldKey;
    if (/^[\/\d]/.test(entryName.trim())) { changed = true; continue; }

    let newKey = normIngredient(entryName);

    // Canonicaliser via whitelist sémantique
    if (typeof whitelistLookup !== 'undefined') {
      const canonical = whitelistLookup(newKey);
      if (canonical && canonical !== newKey) {
        const wEntry = typeof whitelistEntry !== 'undefined' ? whitelistEntry(canonical) : null;
        if (wEntry) entry.name = wEntry.name;
        newKey = canonical;
      }
    }

    if (newKey !== oldKey) {
      changed = true;
      console.info('[Stock] Migration clé:', oldKey, '→', newKey);
    }
    // Si collision : additionner les qtés
    if (migrated[newKey]) {
      migrated[newKey].qty = (migrated[newKey].qty || 0) + (entry.qty || 0);
    } else {
      migrated[newKey] = { ...entry };
    }
  }
  if (changed) {
    localStorage.setItem('recettes_stock', JSON.stringify(migrated));
    console.info('[Stock] Migration clés terminée');
  }
  return migrated;
}

let stock = migrateStockKeys(loadStockFromStorage());

// ── Ingrédients masqués dans le catalogue ──
let hiddenIngredients = new Set(JSON.parse(localStorage.getItem('recettes_hidden_ings') || '[]'));

function saveHidden() {
  localStorage.setItem('recettes_hidden_ings', JSON.stringify([...hiddenIngredients]));
}

function deleteCatalogEntry(key) {
  hiddenIngredients.add(key);
  saveHidden();
  renderCatalog();
}

function restoreAllCatalog() {
  hiddenIngredients.clear();
  saveHidden();
  renderCatalog();
}

// ── Persistance ──
function saveStock() {
  localStorage.setItem('recettes_stock', JSON.stringify(stock));
  scheduleDriveSave();
}

// ══════════════════════════════════════════════
//  DÉDOUBLONNAGE DE STOCK — file d'attente pour le Bridge Wizard
//  canonicalIngredientKey() ne résout que les alias déjà connus de WL_IDX.
//  Un nouvel ingrédient de stock qui n'y figure pas devient sa propre ligne
//  au lieu de fusionner avec une entrée existante — on détecte ces paires
//  candidates (mot entier partagé) et on les propose dans le Bridge Wizard,
//  qui délègue la fusion réelle au panneau de fusion déjà existant
//  (openMergePanel/confirmMerge, cf. plus bas) pour ne pas dupliquer la
//  logique d'addition des quantités.
// ══════════════════════════════════════════════
const STOCK_DEDUP_PENDING_KEY = 'recettes_stock_dedup_pending';
const STOCK_DEDUP_IGNORED_KEY = 'recettes_stock_dedup_ignored';

function loadStockDedupPending() {
  try { return JSON.parse(localStorage.getItem(STOCK_DEDUP_PENDING_KEY) || '[]'); }
  catch { return []; }
}
function saveStockDedupPending(list) {
  localStorage.setItem(STOCK_DEDUP_PENDING_KEY, JSON.stringify(list));
}
function loadStockDedupIgnored() {
  try { return new Set(JSON.parse(localStorage.getItem(STOCK_DEDUP_IGNORED_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveStockDedupIgnored(set) {
  localStorage.setItem(STOCK_DEDUP_IGNORED_KEY, JSON.stringify([...set]));
}

// Cherche, parmi les autres clés déjà en stock, un candidat doublon pour
// newKey (mot entier partagé dans un sens ou l'autre) et l'ajoute en pending
// si ce n'est ni déjà en file, ni déjà tranché "différents" par l'utilisateur.
function checkStockDuplicate(newKey) {
  if (typeof _wordIn !== 'function') return;
  const ignored = loadStockDedupIgnored();
  const candidate = Object.keys(stock).find(sk =>
    sk !== newKey && (_wordIn(newKey, sk) || _wordIn(sk, newKey))
  );
  if (!candidate) return;
  const sig = _dedupSig(newKey, candidate);
  if (ignored.has(sig)) return;
  const pending = loadStockDedupPending();
  if (pending.some(([a, b]) => _dedupSig(a, b) === sig)) return;
  pending.push([newKey, candidate]);
  saveStockDedupPending(pending);
  if (typeof refreshBadge === 'function') refreshBadge();
}

function removeStockDedupPendingPair(a, b) {
  const sig = _dedupSig(a, b);
  saveStockDedupPending(loadStockDedupPending().filter(([x, y]) => _dedupSig(x, y) !== sig));
  if (typeof refreshBadge === 'function') refreshBadge();
}

// ── Note stock : types de riz et leur charge glycémique ──────────────────
// Affichée seulement si le stock contient au moins un SKU de la famille
// riz — contextuelle, pas un panneau permanent qui encombre pour rien.
// CG calculée sur une portion de référence partagée (150g de riz cuit,
// ~28g de glucides/100g cuit toutes variétés confondues) plutôt que sur
// les valeurs CIQUAL crues de chaque SKU (bases crue/cuite incohérentes
// selon le type — cf. audit whitelist_canonique.js) : la comparaison
// entre riz doit se faire sur la même base pour avoir un sens.
const RICE_FAMILY_KEYS = ['riz blanc', 'riz basmati', 'riz complet', 'riz risotto arborio'];
const RICE_COOKED_CARBS_PER_100G = 28; // g glucides / 100g de riz cuit, valeur courante toutes variétés

function _renderRiceGlycemicNote() {
  const container = document.getElementById('stock-rice-note');
  if (!container) return;
  const stockKeys = Object.keys(stock);
  const hasRice = RICE_FAMILY_KEYS.some(k => stockKeys.includes(k));
  if (!hasRice || typeof getGlycemicIndex !== 'function' || typeof whitelistEntry !== 'function') {
    container.innerHTML = '';
    return;
  }

  const rows = RICE_FAMILY_KEYS.map(k => {
    const gi = getGlycemicIndex(k);
    if (gi == null) return null;
    const name = whitelistEntry(k)?.name || k;
    const gl150 = Math.round(gi * (RICE_COOKED_CARBS_PER_100G * 1.5) / 100);
    return { name, gi, gl150 };
  }).filter(Boolean);
  if (!rows.length) { container.innerHTML = ''; return; }

  container.innerHTML = `
    <details class="stock-rice-note">
      <summary>🍚 Types de riz et charge glycémique</summary>
      <div class="stock-rice-note-body">
        <table class="stock-rice-table">
          <thead><tr><th>Riz</th><th>IG</th><th>CG (150g cuit)</th></tr></thead>
          <tbody>
            ${rows.map(r => `<tr><td>${r.name}</td><td>${r.gi}</td><td>${r.gl150}</td></tr>`).join('')}
          </tbody>
        </table>
        <p>À 150g de riz cuit, toutes les variétés retombent en charge glycémique
        "élevée" (≥20) — la taille de la portion pèse plus lourd que le type de
        riz à cette échelle. Repère indicatif, pas un avis médical.</p>
      </div>
    </details>`;
}

// ── Panneau stock ──
function toggleStock() {
  document.getElementById('stock-panel').classList.toggle('open');
}

// ── Rendu liste stock ──
function renderStock() {
  const list   = document.getElementById('stock-list');
  const empty  = document.getElementById('stock-empty');
  const clrBtn = document.getElementById('stock-clear-btn');
  const badge  = document.getElementById('stock-badge');
  const keys   = Object.keys(stock);
  badge.textContent = keys.length;
  if (keys.length === 0) {
    empty.style.display = '';
    list.innerHTML = '';
    clrBtn.style.display = 'none';
    _renderRiceGlycemicNote();
    return;
  }
  empty.style.display = 'none';
  clrBtn.style.display = '';
  const mergeItems = _mergeSelection.size > 0;
  list.innerHTML = keys.sort().map(k => {
    const e = stock[k];
    const selected = _mergeSelection.has(k);
    return `<div class="stock-item ${selected ? 'stock-item-selected' : ''}">
      <span class="stock-merge-cb" onclick="toggleMergeSelect('${k}')" title="Sélectionner pour fusionner"
        style="cursor:pointer;font-size:0.9rem;flex-shrink:0;color:${selected ? 'var(--sage)' : 'var(--border)'}">${selected ? '☑' : '☐'}</span>
      <span class="stock-item-name" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.name}</span>
      <input type="number" min="0" step="any" value="${e.qty || ''}"
        placeholder="qté"
        style="width:56px;padding:3px 6px;border:1.5px solid var(--border);border-radius:5px;
               font-family:'DM Sans',sans-serif;font-size:0.82rem;text-align:right;flex-shrink:0;"
        onchange="updateStockQty('${k}', this.value)"
        oninput="updateStockQty('${k}', this.value)">
      <select class="stock-unit-select" onchange="updateStockUnit('${k}',this.value)">${unitOptions(e.unit)}</select>
      <button class="stock-item-remove" onclick="removeStock('${k}')" title="Retirer">✕</button>
    </div>`;
  }).join('');

  // Bouton fusion flottant
  let mergeBtn = document.getElementById('stock-merge-btn');
  if (!mergeBtn) {
    mergeBtn = document.createElement('button');
    mergeBtn.id = 'stock-merge-btn';
    mergeBtn.style.cssText = 'display:none;position:sticky;bottom:8px;width:100%;padding:10px;background:var(--sage);color:white;border:none;border-radius:8px;font-family:DM Sans,sans-serif;font-weight:500;cursor:pointer;margin-top:8px;';
    mergeBtn.onclick = openMergePanel;
    list.parentNode.appendChild(mergeBtn);
  }
  mergeBtn.style.display = _mergeSelection.size >= 2 ? '' : 'none';
  mergeBtn.textContent = '🔀 Fusionner (' + _mergeSelection.size + ' sélectionnées)';

  _renderRiceGlycemicNote();
}

function toggleCatalogMerge(key) {
  if (_catalogMergeSelection.has(key)) _catalogMergeSelection.delete(key);
  else _catalogMergeSelection.add(key);
  renderCatalog();
}

function toggleMergeSelect(key) {
  if (_mergeSelection.has(key)) _mergeSelection.delete(key);
  else _mergeSelection.add(key);
  renderStock();
}

function openMergePanel() {
  const sel = _catalogMergeSelection.size >= 2 ? _catalogMergeSelection
            : _mergeSelection.size >= 2 ? _mergeSelection
            : null;
  if (!sel) return;
  const entries = [...sel].map(k => {
    const s = stock[k];
    return { key: k, name: s?.name || k, unit: s?.unit || '', qty: s?.qty || 0 };
  });
  const panel = document.getElementById('merge-panel');
  if (!panel) return;
  panel.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px 12px;border-bottom:1px solid var(--border)">
      <h3 style="margin:0;font-family:'Playfair Display',serif;font-size:1rem">🔀 Fusionner des entrées</h3>
      <button onclick="closeMergePanel()" style="background:none;border:none;font-size:1.1rem;cursor:pointer">✕</button>
    </div>
    <div style="padding:16px 20px;display:flex;flex-direction:column;gap:12px">
      <p style="font-size:0.8rem;color:var(--warm-grey);margin:0">Choisis la clé canonique à conserver. Les quantités des autres seront additionnées puis supprimées.</p>
      ${entries.map(e => `
        <label style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--cream);border-radius:8px;cursor:pointer">
          <input type="radio" name="merge_target" value="${e.key}" ${entries[0].key === e.key ? 'checked' : ''}>
          <span style="flex:1">
            <div style="font-weight:500;font-size:0.88rem">${e.name}</div>
            <div style="font-size:0.72rem;color:var(--warm-grey);font-family:monospace">${e.key}</div>
          </span>
          <span style="font-size:0.8rem;color:var(--warm-grey)">${e.qty || 0} ${e.unit || ''}</span>
        </label>
      `).join('')}
      <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:4px">
        <button onclick="closeMergePanel()" style="padding:8px 14px;background:none;border:none;font-family:'DM Sans',sans-serif;color:var(--warm-grey);cursor:pointer">Annuler</button>
        <button onclick="confirmMerge()" style="padding:8px 18px;background:var(--sage);color:white;border:none;border-radius:8px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer">🔀 Fusionner</button>
      </div>
    </div>
  `;
  panel.style.display = '';
}

function closeMergePanel() {
  const panel = document.getElementById('merge-panel');
  if (panel) panel.style.display = 'none';
  _mergeSelection.clear();
  _catalogMergeSelection.clear();
  renderStock();
  renderCatalog();
}

function confirmMerge() {
  const radio = document.querySelector('input[name="merge_target"]:checked');
  if (!radio) return;
  const targetKey = radio.value;

  let totalGrams = 0;
  const _activeMergeSet = _catalogMergeSelection.size >= 2 ? _catalogMergeSelection : _mergeSelection;
  for (const key of _activeMergeSet) {
    const e = stock[key];
    if (!e) continue;
    const g = typeof toGrams !== 'undefined' ? (toGrams(String(e.qty || 0), e.unit, key) || (e.qty || 0)) : (e.qty || 0);
    totalGrams += g;
    if (key !== targetKey) delete stock[key];
  }

  // Mettre à jour la cible
  const target = stock[targetKey];
  if (target.unit && target.unit !== '' && target.unit !== '—') {
    // Recalculer dans l'unité d'origine
    const factor = totalGrams / (typeof toGrams !== 'undefined' ? (toGrams('1', target.unit, targetKey) || 1) : 1);
    target.qty = Math.round(factor * 10) / 10;
  } else {
    target.qty = Math.round(totalGrams * 10) / 10;
    target.unit = 'g';
  }

  saveStock();
  closeMergePanel();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
  showToast('✅ Fusionné → ' + targetKey);
}

function updateStockQty(key, val) {
  if (!stock[key]) return;
  stock[key].qty = parseFloat(val) || 0;
  saveStock();
}

function updateStockUnit(key, val) {
  if (!stock[key]) return;
  stock[key].unit = val;
  saveStock();
}

function addStockItem() {
  const input = document.getElementById('stock-input');
  const val = input.value.trim();
  if (!val) return;

  const p = typeof parseIngredientString !== 'undefined'
    ? (() => { const r = parseIngredientString(val); return { name: r.rawName, unit: r.unit || '', qty: r.qty ? String(r.qty) : '' }; })()
    : canonicalize(parseIngredient(val));

  const key = typeof canonicalIngredientKey === 'function' ? canonicalIngredientKey(p.name) : normIngredient(p.name);

  if (key in stock) {
    // Doublon : additionner la quantité + feedback
    if (p.qty) stock[key].qty = (stock[key].qty || 0) + (parseFloat(p.qty) || 0);
    if (typeof showToast === 'function') showToast(`📦 "${stock[key].name}" déjà en stock — quantité mise à jour`);
  } else {
    stock[key] = { name: p.name, unit: p.unit, qty: parseFloat(p.qty) || 0 };
    if (typeof showToast === 'function') showToast(`✅ "${p.name}" ajouté`);
    checkStockDuplicate(key);
  }
  saveStock();
  renderStock();
  renderGrid();
  updateCounts();
  input.value = '';
  input.focus();
}

function removeStock(key) {
  delete stock[key];
  saveStock();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
}

function clearStock() {
  if (confirm('Vider tout le stock ?')) {
    stock = {};
    saveStock();
    renderStock();
    renderCatalog();
    renderGrid();
    updateCounts();
  }
}

// ── Saisie en lot (textarea) ──
function addFromTextarea() {
  const ta = document.getElementById('stock-textarea');
  const lines = ta.value.split('\n').map(l => l.trim()).filter(Boolean);
  let added = 0, updated = 0;
  lines.forEach(line => {
    const p = typeof parseIngredientString !== 'undefined'
      ? (() => { const r = parseIngredientString(line); return { name: r.rawName, unit: r.unit || '', qty: r.qty ? String(r.qty) : '' }; })()
      : canonicalize(parseIngredient(line));
    const key = typeof canonicalIngredientKey === 'function' ? canonicalIngredientKey(p.name) : normIngredient(p.name);
    if (key in stock) {
      if (p.qty) stock[key].qty = (stock[key].qty || 0) + (parseFloat(p.qty) || 0);
      updated++;
    } else {
      stock[key] = { name: p.name, unit: p.unit, qty: parseFloat(p.qty) || 0 };
      added++;
      checkStockDuplicate(key);
    }
  });
  saveStock();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
  ta.value = '';
  const parts = [];
  if (added)   parts.push(added + ' ajouté' + (added > 1 ? 's' : ''));
  if (updated) parts.push(updated + ' mis à jour');
  if (typeof showToast === 'function' && parts.length) showToast('📦 ' + parts.join(', '));
}

// ══════════════════════════════════════════════
//  CATALOGUE
// ══════════════════════════════════════════════

let catalogCat = 'all';
let _asmKey    = null;
let _catalogIndex = {};

function setCatalogCat(cat, btn) {
  catalogCat = cat;
  document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCatalog();
}

// ── Construit la map dédupliquée ingrédient → infos ──
function buildIngredientMap(catFilter) {
  const map    = new Map();
  const catMap = { repas: 'Repas', tartinade: 'Tartinades', petitdej: 'Petits-déj.' };

  RECIPES.forEach(r => {
    if (catFilter !== 'all' && r.category !== catFilter) return;
    (r.ingredients || []).forEach(raw => {
      const _p = typeof parseIngredientString !== 'undefined'
        ? parseIngredientString(raw)
        : parseIngredient(raw);
      const qty = _p.qty ? String(_p.qty) : (_p.qty || '');
      const unit = _p.unit || '';
      const name = _p.rawName || _p.name || '';
      const rawKey = normIngredient(name);

      // Ingrédients de préparation (eau de cuisson…) → exclus du catalogue
      if (typeof _isAlwaysAvailable !== 'undefined' && _isAlwaysAvailable(rawKey)) return;

      // Résolution whitelist → clé canonique (ex: "spaghetti" → "pates blanches")
      let key = rawKey;
      let displayName = name;
      if (typeof whitelistLookup !== 'undefined') {
        const wKey = whitelistLookup(rawKey);
        if (wKey) {
          key = wKey;
          const wEntry = typeof whitelistEntry !== 'undefined' ? whitelistEntry(wKey) : null;
          if (wEntry?.name) displayName = wEntry.name;
        }
      }

      if (!map.has(key)) {
        map.set(key, { name: displayName, unit, qties: [], recipes: new Set(), cats: new Set() });
      }
      const entry = map.get(key);
      if (!entry.unit && unit) entry.unit = unit;
      if (qty && !entry.qties.includes(qty)) entry.qties.push(qty);
      entry.recipes.add(r.name);
      entry.cats.add(catMap[r.category] || r.categoryLabel);
    });
  });

  return [...map.entries()].sort((a, b) => a[1].name.localeCompare(b[1].name, 'fr'));
}

// ── Mini-modal ajout au stock depuis le catalogue ──
function catalogExpand(key) {
  const entry = _catalogIndex[key];
  if (!entry) return;
  _asmKey = key;
  document.getElementById('asm-name').textContent = entry.name;
  document.getElementById('asm-unit').innerHTML   = unitOptions(entry.unit);
  document.getElementById('asm-qty').value        = '';
  const overlay = document.getElementById('add-stock-overlay');
  overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('asm-qty').focus(), 80);
}

function closeAddModal(e) {
  if (e.target === document.getElementById('add-stock-overlay')) closeAddModalDirect();
}
function closeAddModalDirect() {
  document.getElementById('add-stock-overlay').style.display = 'none';
  _asmKey = null;
}

function confirmAddModal() {
  if (!_asmKey) return;
  const qty  = parseFloat(document.getElementById('asm-qty').value) || 0;
  const unit = document.getElementById('asm-unit').value || '';
  const name = document.getElementById('asm-name').textContent;
  stock[_asmKey] = { name, unit, qty };
  saveStock();
  closeAddModalDirect();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
}

function catalogRemove(key) {
  delete stock[key];
  saveStock();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
}

function renderCatalog() {
  const q = (document.getElementById('catalog-search')?.value || '')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const entries  = buildIngredientMap(catalogCat);
  const tbody    = document.getElementById('catalog-tbody');
  const empty    = document.getElementById('catalog-empty');
  const restoreBar  = document.getElementById('catalog-restore-bar');
  const hiddenCount = document.getElementById('hidden-count');
  if (!tbody) return;

  const hiddenVisible = entries.filter(([key]) => hiddenIngredients.has(key)).length;
  if (hiddenCount) hiddenCount.textContent = hiddenVisible;
  if (restoreBar)  restoreBar.style.display = hiddenVisible > 0 ? '' : 'none';

  let filtered = entries.filter(([key]) => !hiddenIngredients.has(key));
  if (q) {
    filtered = filtered.filter(([key, v]) =>
      key.includes(q) || v.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
    );
  }

  if (filtered.length === 0) { tbody.innerHTML = ''; empty.style.display = ''; return; }
  empty.style.display = 'none';

  _catalogIndex = {};
  filtered.forEach(([key, v]) => { _catalogIndex[key] = { name: v.name, unit: v.unit }; });

  tbody.innerHTML = filtered.map(([key, v]) => {
    const inStock  = key in stock;
    const rowClass = inStock ? 'catalog-row in-stock' : 'catalog-row';
    const unitCell = inStock
      ? `<select class="stock-unit-select" onchange="updateStockUnit('${key}',this.value)">${unitOptions(stock[key].unit)}</select>`
      : `<span class="ing-unit">${v.unit || '—'}</span>`;
    const qtyCell = inStock
      ? `<input type="number" min="0" step="any"
           value="${stock[key].qty || ''}" placeholder="qté"
           style="width:52px;padding:3px 5px;border:1.5px solid var(--border);border-radius:5px;
                  font-family:'DM Sans',sans-serif;font-size:0.82rem;text-align:right;"
           onchange="updateStockQty('${key}',this.value)"
           oninput="updateStockQty('${key}',this.value)">`
      : `<span style="color:var(--warm-grey)">—</span>`;
    const stockBtn = inStock
      ? `<button class="toggle-stock-btn remove" onclick="catalogRemove('${key}')" title="Retirer du stock">−</button>`
      : `<button class="toggle-stock-btn add"    onclick="catalogExpand('${key}')" title="Ajouter au stock">+</button>`;

    const catSelected = _catalogMergeSelection.has(key);
    const colruytMatch = typeof matchColruyt === 'function' ? matchColruyt(key) : null;
    const priceStr = colruytMatch && typeof formatColruytPrice === 'function' ? formatColruytPrice(colruytMatch) : null;
    const priceCell = priceStr
      ? `<span class="cat-price-hint" title="${escapeAttr(colruytMatch.LongName || colruytMatch.name || '')}">~${priceStr}</span>`
      : `<span style="color:var(--border)">—</span>`;
    return `<tr class="${rowClass} ${catSelected ? 'catalog-row-selected' : ''}">
      <td>
        <span onclick="toggleCatalogMerge('${key}')" title="Sélectionner pour fusionner"
          style="cursor:pointer;margin-right:6px;color:${catSelected ? 'var(--sage)' : 'var(--border)'}">${catSelected ? '☑' : '☐'}</span>
        <div class="ing-name" style="display:inline">${v.name}</div>
        <span class="ing-recipes">×${v.recipes.size} recette${v.recipes.size > 1 ? 's' : ''}</span>
      </td>
      <td class="col-unit">${unitCell}</td>
      <td class="col-qty">${qtyCell}</td>
      <td class="col-price">${priceCell}</td>
      <td class="col-stock">${stockBtn}</td>
      <td class="col-del">
        <button class="del-ing-btn" onclick="deleteCatalogEntry('${key}')" title="Masquer">🗑</button>
      </td>
    </tr>`;
  }).join('');

  // Bouton fusion flottant
  let mergeBtn = document.getElementById('catalog-merge-btn');
  if (!mergeBtn) {
    mergeBtn = document.createElement('button');
    mergeBtn.id = 'catalog-merge-btn';
    mergeBtn.style.cssText = 'display:none;position:sticky;bottom:8px;width:calc(100% - 32px);margin:8px 16px;padding:10px;background:var(--sage);color:white;border:none;border-radius:8px;font-family:DM Sans,sans-serif;font-weight:500;cursor:pointer;';
    mergeBtn.onclick = openMergePanel;
    tbody.parentNode.parentNode.appendChild(mergeBtn);
  }
  mergeBtn.style.display = _catalogMergeSelection.size >= 2 ? '' : 'none';
  mergeBtn.textContent = '🔀 Fusionner (' + _catalogMergeSelection.size + ' sélectionnées)';
}

// ── Tabs du panneau stock ──
function switchStockTab(id) {
  document.querySelectorAll('.stock-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.stock-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + id).classList.add('active');
  const idx = ['mon-stock', 'catalogue', 'ajouter'].indexOf(id);
  document.querySelectorAll('.stock-tab')[idx]?.classList.add('active');
  if (id === 'catalogue') renderCatalog();
}
