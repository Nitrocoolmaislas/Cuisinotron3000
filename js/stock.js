// ══════════════════════════════════════════════
//  STOCK — état global + gestion
// ══════════════════════════════════════════════

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

let stock = loadStockFromStorage();

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
  list.innerHTML = keys.sort().map(k => {
    const e = stock[k];
    return `<div class="stock-item">
      <span style="color:var(--success);font-size:0.8rem;flex-shrink:0">●</span>
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

  // Canonicalisation : "épinards frais" → "epinards", "filet d'huile" → "huile d olive" + 15ml
  const parsed = canonicalize(parseIngredient(val));
  const key    = normIngredient(parsed.name);

  if (!(key in stock)) {
    stock[key] = { name: parsed.name, unit: parsed.unit || '', qty: parseFloat(parsed.qty) || 0 };
  } else if (parsed.qty) {
    // Si l'ingrédient existe déjà, on additionne la quantité
    stock[key].qty = (stock[key].qty || 0) + (parseFloat(parsed.qty) || 0);
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
  lines.forEach(line => {
    const parsed = canonicalize(parseIngredient(line));
    const key    = normIngredient(parsed.name);
    if (!(key in stock)) {
      stock[key] = { name: parsed.name, unit: parsed.unit || '', qty: parseFloat(parsed.qty) || 0 };
    } else if (parsed.qty) {
      stock[key].qty = (stock[key].qty || 0) + (parseFloat(parsed.qty) || 0);
    }
  });
  saveStock();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();
  ta.value = '';
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
      const { qty, unit, name } = parseIngredient(raw);
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

    return `<tr class="${rowClass}">
      <td>
        <div class="ing-name">${v.name}</div>
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
