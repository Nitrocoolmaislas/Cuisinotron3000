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
  if (currentCat === 'custom') {
    list = list.filter(r => r.custom === true);
  } else if (currentCat !== 'all') {
    list = list.filter(r => r.category === currentCat);
  }
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
    const customBadge = r.custom ? `<span class="custom-badge">perso</span>` : '';
    return `<div class="recipe-card" onclick="openModal('${r.id}')">
      <div class="card-category">${r.categoryLabel}${customBadge}</div>
      <div class="card-name">${r.name}</div>
      <div class="card-meta">${cookInfo}<span>👤 ${r.servings} portion${r.servings > 1 ? 's' : ''}</span></div>
      ${feasibilityBadge(f.status, f.pct)}
    </div>`;
  }).join('');
}

let currentModalRecipe = null; // recette affichée dans la modal

// ── Modal recette ──
function openModal(id) {
  const r = RECIPES.find(x => x.id === id);
  if (!r) return;
  currentModalRecipe = r;

  // Reset feedback
  document.getElementById('cook-feedback').style.display = 'none';
  document.getElementById('cook-btn').disabled = false;
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
  // Boutons éditer/supprimer pour les recettes custom
  const customActions = document.getElementById('modal-custom-actions');
  if (r.custom) {
    customActions.style.display = '';
    customActions.innerHTML = `
      <button class="modal-edit-btn" onclick="closeModalDirect();openRecipeForm('${r.id}')">✏️ Modifier</button>
      <button class="modal-delete-btn" onclick="deleteCustomRecipe('${r.id}')">🗑 Supprimer</button>`;
  } else {
    customActions.style.display = 'none';
    customActions.innerHTML = '';
  }

  document.getElementById('modal-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

// ── Préparer un plat → déduire les ingrédients du stock ──
function cookRecipe() {
  const r = currentModalRecipe;
  if (!r) return;

  const stockKeys = Object.keys(stock);
  const removed   = [];
  const kept      = [];
  const missing   = [];

  for (const raw of r.ingredients) {
    const { name, qty, unit } = parseIngredient(raw);
    const key = normIngredient(name);

    // Cherche la clé correspondante dans le stock (exact + substring)
    let stockKey = null;
    if (key in stock) {
      stockKey = key;
    } else {
      stockKey = stockKeys.find(sk => sk.length >= 3 && key.includes(sk) && key.replace(sk,'').trim().length < 6)
              || stockKeys.find(sk => key.length >= 3 && sk.includes(key) && sk.replace(key,'').trim().length < 6);
    }

    if (!stockKey) {
      missing.push(name);
      continue;
    }

    const entry    = stock[stockKey];
    const usedQty  = toGrams(qty, unit, key);
    const stockQty = toGrams(String(entry.qty), entry.unit, stockKey);

    if (usedQty > 0 && stockQty > 0) {
      const newGrams = stockQty - usedQty;
      if (newGrams <= 0) {
        // Stock épuisé → on supprime l'entrée
        delete stock[stockKey];
        removed.push(name);
      } else {
        // On recalcule la quantité restante dans l'unité d'origine
        const factor = newGrams / stockQty;
        stock[stockKey].qty = Math.round(entry.qty * factor * 10) / 10;
        kept.push(`${name} (reste ${stock[stockKey].qty} ${entry.unit || 'u.'})`);
      }
    } else {
      // Pas de quantité précise → on supprime simplement l'entrée
      delete stock[stockKey];
      removed.push(name);
    }
  }

  saveStock();
  renderStock();
  renderCatalog();
  renderGrid();
  updateCounts();

  // Feedback dans la modal
  const btn = document.getElementById('cook-btn');
  btn.disabled = true;
  btn.textContent = '✅ Plat préparé !';

  const fb = document.getElementById('cook-feedback');
  let html = '';
  if (removed.length)  html += `<div class="removed">🗑 Épuisés : ${removed.join(', ')}</div>`;
  if (kept.length)     html += `<div class="kept">📦 Mis à jour : ${kept.join(', ')}</div>`;
  if (missing.length)  html += `<div class="missing">⚠️ Pas en stock : ${missing.join(', ')}</div>`;
  fb.innerHTML = html;
  fb.style.display = html ? '' : 'none';
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
  const titles = {
    all: 'Toutes les recettes',
    repas: 'Repas chauds',
    tartinade: 'Tartinades & Dips',
    petitdej: 'Petits-déjeuners',
    custom: 'Mes recettes',
  };
  document.getElementById('view-title').textContent    = titles[cat] || cat;
  document.getElementById('view-subtitle').textContent = cat === 'custom'
    ? 'Recettes ajoutées par toi' : '';
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
  const customCount = RECIPES.filter(r => r.custom).length;
  const customEl = document.getElementById('cnt-custom');
  if (customEl) customEl.textContent = customCount || '';
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadCustomRecipes();  // ← charge les recettes custom avant tout
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
    closeRecipeForm();
  }
});
