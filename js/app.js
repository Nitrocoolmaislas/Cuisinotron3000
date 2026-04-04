// ══════════════════════════════════════════════
//  APP — logique principale
//  Dépend de : recipes.js, utils.js, stock.js
// ══════════════════════════════════════════════

let currentCat        = 'all';
let currentFeasFilter = null;

// ── Faisabilité ──
function checkFeasibility(recipe) {
  const stockKeys = Object.keys(stock);
  if (stockKeys.length === 0) return { status: 'unknown', pct: 0, missing: [] };
  let matched = 0;
  const missing = [];
  for (const ing of recipe.ingredients) {
    const { name } = parseIngredient(ing);
    const key = normIngredient(name);
    let found = key in stock;
    if (!found) found = stockKeys.some(sk => sk.length >= 3 && key.includes(sk) && key.replace(sk, '').trim().length < 6);
    if (!found) found = stockKeys.some(sk => key.length >= 3 && sk.includes(key) && sk.replace(key, '').trim().length < 6);
    if (found) matched++;
    else missing.push(ing);
  }
  const pct = recipe.ingredients.length > 0 ? matched / recipe.ingredients.length : 0;
  let status = 'no';
  if (pct >= 0.85) status = 'ok';
  else if (pct >= 0.5) status = 'partial';
  return { status, pct, missing };
}

function feasibilityBadge(status, pct) {
  if (status === 'unknown') return `<span class="feasibility-badge unknown">📦 Ajouter au stock</span>`;
  if (status === 'ok')      return `<span class="feasibility-badge ok">✅ Faisable</span>`;
  if (status === 'partial') return `<span class="feasibility-badge partial">⚡ ${Math.round(pct * 100)}% des ingrédients</span>`;
  return `<span class="feasibility-badge no">❌ Manque des ingrédients</span>`;
}

// ── Grille de recettes ──
function renderGrid() {
  if (plannerMode) { renderPlanner(); return; }
  const q = document.getElementById('search-input').value.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let list = RECIPES;
  if (currentCat !== 'all') list = list.filter(r => r.category === currentCat);
  if (currentFeasFilter)    list = list.filter(r => checkFeasibility(r).status === currentFeasFilter);
  if (q) {
    list = list.filter(r => {
      const hay = (r.name + ' ' + r.description + ' ' + r.ingredients.join(' '))
        .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return hay.includes(q);
    });
  }

  const grid = document.getElementById('recipe-grid');
  if (list.length === 0) {
    grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
      <div class="nr-icon">🍽️</div><p>Aucune recette trouvée.</p>
    </div>`;
    return;
  }
  grid.innerHTML = list.map(r => {
    const f        = checkFeasibility(r);
    const cookInfo = r.cookTime > 0
      ? `<span>⏱ ${r.prepTime + r.cookTime} min</span>`
      : `<span>⚡ ${r.prepTime} min</span>`;
    return `<div class="recipe-card" onclick="openModal('${r.id}')">
      <div class="card-category">${r.categoryLabel}</div>
      <div class="card-name">${r.name}</div>
      <div class="card-meta">${cookInfo}<span>👤 ${r.servings} portion${r.servings > 1 ? 's' : ''}</span></div>
      ${feasibilityBadge(f.status, f.pct)}
    </div>`;
  }).join('');
}

// ── Modal recette ──
function openModal(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  document.getElementById('modal-cat').textContent   = r.categoryLabel;
  document.getElementById('modal-title').textContent = r.name;
  document.getElementById('modal-desc').textContent  = r.description;

  const cookInfo = r.cookTime > 0
    ? `<span>🥄 Prép. ${r.prepTime} min</span><span>🔥 Cuisson ${r.cookTime} min</span>`
    : `<span>⚡ ${r.prepTime} min</span>`;
  document.getElementById('modal-meta').innerHTML =
    cookInfo + `<span>👤 ${r.servings} portion${r.servings > 1 ? 's' : ''}</span>`;

  const stockKeys       = Object.keys(stock);
  const ingredientsHTML = r.ingredients.map(ing => {
    const { name } = parseIngredient(ing);
    const key = normIngredient(name);
    let inStock = key in stock;
    if (!inStock) inStock = stockKeys.some(sk => sk.length >= 3 && key.includes(sk) && key.replace(sk, '').trim().length < 6);
    if (!inStock) inStock = stockKeys.some(sk => key.length >= 3 && sk.includes(key) && sk.replace(key, '').trim().length < 6);
    const dotClass = stockKeys.length === 0 ? '' : (inStock ? 'in-stock' : 'out-stock');
    return `<li><span class="ing-dot ${dotClass}"></span>${ing}</li>`;
  }).join('');
  document.getElementById('modal-ingredients').innerHTML = ingredientsHTML;
  document.getElementById('modal-steps').innerHTML = r.steps.map((s, i) =>
    `<li><span class="step-num">${i + 1}</span>${s}</li>`
  ).join('');

  const notesEl = document.getElementById('modal-notes');
  if (r.notes) {
    notesEl.style.display = '';
    notesEl.innerHTML = `<strong>💡 Notes</strong>${r.notes}`;
  } else {
    notesEl.style.display = 'none';
  }
  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── Filtres catégorie / faisabilité ──
function filterCat(cat) {
  hidePlanner();
  currentCat        = cat;
  currentFeasFilter = null;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('cat-' + cat)?.classList.add('active');
  const titles = { all: 'Toutes les recettes', repas: 'Repas chauds', tartinade: 'Tartinades & Dips', petitdej: 'Petits-déjeuners' };
  document.getElementById('view-title').textContent    = titles[cat] || cat;
  document.getElementById('view-subtitle').textContent = '';
  renderGrid();
}

function filterFeasibility(status) {
  hidePlanner();
  currentFeasFilter = currentFeasFilter === status ? null : status;
  currentCat        = 'all';
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  if (currentFeasFilter) {
    document.getElementById('cat-' + status)?.classList.add('active');
    const lbl = { ok: '✅ Recettes faisables', partial: '⚡ Ingrédients partiels' };
    document.getElementById('view-title').textContent    = lbl[status];
    document.getElementById('view-subtitle').textContent = 'Basé sur votre stock actuel';
  } else {
    document.getElementById('cat-all')?.classList.add('active');
    document.getElementById('view-title').textContent    = 'Toutes les recettes';
    document.getElementById('view-subtitle').textContent = '';
  }
  renderGrid();
}

// ── Compteurs sidebar ──
function updateCounts() {
  document.getElementById('cnt-all').textContent     = RECIPES.length;
  ['repas', 'tartinade', 'petitdej'].forEach(cat => {
    document.getElementById('cnt-' + cat).textContent = RECIPES.filter(r => r.category === cat).length;
  });
  document.getElementById('cnt-ok').textContent      = RECIPES.filter(r => checkFeasibility(r).status === 'ok').length;
  document.getElementById('cnt-partial').textContent = RECIPES.filter(r => checkFeasibility(r).status === 'partial').length;
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  updateCounts();
  renderGrid();
  renderStock();
  document.getElementById('stock-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') addStockItem();
  });
  const origRenderStock = renderStock;
  window.renderStock = function() { origRenderStock(); updateCounts(); };
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModalDirect();
    closeAddModalDirect();
    closeShoppingPanel();
  }
});
