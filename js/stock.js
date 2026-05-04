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
    const newKey = normIngredient(entryName);
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
  if (_mergeSelection.size < 2) return;
  const sel = _catalogMergeSelection.size > 0 ? _catalogMergeSelection : _mergeSelection;
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
  for (const key of _mergeSelection) {
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

  const key = normIngredient(p.name);

  if (key in stock) {
    // Doublon : additionner la quantité + feedback
    if (p.qty) stock[key].qty = (stock[key].qty || 0) + (parseFloat(p.qty) || 0);
    if (typeof showToast === 'function') showToast(`📦 "${stock[key].name}" déjà en stock — quantité mise à jour`);
  } else {
    stock[key] = { name: p.name, unit: p.unit, qty: parseFloat(p.qty) || 0 };
    if (typeof showToast === 'function') showToast(`✅ "${p.name}" ajouté`);
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
    const key = normIngredient(p.name);
    if (key in stock) {
      if (p.qty) stock[key].qty = (stock[key].qty || 0) + (parseFloat(p.qty) || 0);
      updated++;
    } else {
      stock[key] = { name: p.name, unit: p.unit, qty: parseFloat(p.qty) || 0 };
      added++;
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
    r.ingredients.forEach(raw => {
      const _p = typeof parseIngredientString !== 'undefined'
        ? parseIngredientString(raw)
        : parseIngredient(raw);
      const qty = _p.qty ? String(_p.qty) : (_p.qty || '');
      const unit = _p.unit || '';
      const name = _p.rawName || _p.name || '';
      const key = normIngredient(name);
      if (!map.has(key)) {
        map.set(key, { name, unit, qties: [], recipes: new Set(), cats: new Set() });
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
    return `<tr class="${rowClass} ${catSelected ? 'catalog-row-selected' : ''}">
      <td>
        <span onclick="toggleCatalogMerge('${key}')" title="Sélectionner pour fusionner"
          style="cursor:pointer;margin-right:6px;color:${catSelected ? 'var(--sage)' : 'var(--border)'}">${catSelected ? '☑' : '☐'}</span>
        <div class="ing-name" style="display:inline">${v.name}</div>
        <span class="ing-recipes">×${v.recipes.size} recette${v.recipes.size > 1 ? 's' : ''}</span>
      </td>
      <td class="col-unit">${unitCell}</td>
      <td class="col-qty">${qtyCell}</td>
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
    
