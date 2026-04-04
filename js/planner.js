// ══════════════════════════════════════════════
//  PLANIFICATEUR & LISTE DE COURSES
//  Dépend de : recipes.js, utils.js, stock.js, colruyt.js, bridge.js
// ══════════════════════════════════════════════

let plannerMode     = false;
let plannerSelected = new Set(); // IDs de recettes sélectionnées

let _lastShoppingMissing = [];
let _lastShoppingInStock = [];

// ── Afficher le planificateur ──
function showPlanner() {
  plannerMode = true;
  currentCat        = 'all';
  currentFeasFilter = null;
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('cat-planner')?.classList.add('active');
  document.getElementById('view-title').textContent    = '🗓️ Planificateur de repas';
  document.getElementById('view-subtitle').textContent = 'Clique sur les plats que tu veux cuisiner cette semaine';
  renderPlanner();
  document.getElementById('planner-bar').style.display = 'flex';
  // Préchargement Colruyt en arrière-plan
  fetchColruytLatest();
}

function hidePlanner() {
  plannerMode = false;
  document.getElementById('planner-bar').style.display = 'none';
}

// ── Rendu des cartes du planificateur ──
function renderPlanner() {
  const grid = document.getElementById('recipe-grid');
  grid.innerHTML = RECIPES.map(r => {
    const sel      = plannerSelected.has(r.id);
    const cookInfo = r.cookTime > 0
      ? `⏱ ${r.prepTime + r.cookTime} min`
      : `⚡ ${r.prepTime} min`;
    return `<div class="recipe-card planner-card ${sel ? 'planner-selected' : ''}"
         onclick="togglePlannerRecipe('${r.id}')">
      <div class="planner-check">${sel ? '✓' : ''}</div>
      <div class="card-category">${r.categoryLabel}</div>
      <div class="card-name">${r.name}</div>
      <div class="card-meta">
        <span>${cookInfo}</span>
        <span>👤 ${r.servings} portion${r.servings > 1 ? 's' : ''}</span>
      </div>
    </div>`;
  }).join('');
}

function togglePlannerRecipe(id) {
  if (plannerSelected.has(id)) plannerSelected.delete(id);
  else plannerSelected.add(id);
  renderPlanner();
  updatePlannerBar();
  document.getElementById('cnt-planner').textContent = plannerSelected.size || '';
}

function updatePlannerBar() {
  const count = plannerSelected.size;
  const bar   = document.getElementById('planner-bar-count');
  const btn   = document.getElementById('planner-generate-btn');
  if (bar) bar.innerHTML = count === 0
    ? 'Aucun plat sélectionné'
    : `<strong>${count}</strong> plat${count > 1 ? 's' : ''} sélectionné${count > 1 ? 's' : ''}`;
  if (btn) btn.disabled = count === 0;
}

function clearPlanner() {
  plannerSelected.clear();
  renderPlanner();
  updatePlannerBar();
  document.getElementById('cnt-planner').textContent = '';
}

// ══════════════════════════════════════════════
//  GÉNÉRATION LISTE DE COURSES
// ══════════════════════════════════════════════
function generateShoppingList() {
  if (plannerSelected.size === 0) return;

  // 1. Collecter tous les ingrédients des plats sélectionnés
  const ingredientMap = new Map(); // normKey → { name, unit, rawQties[], recipes[] }
  for (const id of plannerSelected) {
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe) continue;
    for (const raw of recipe.ingredients) {
      const { name, qty, unit } = parseIngredient(raw);
      const key = normIngredient(name);
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, { name, unit: unit || '', rawQties: [], recipes: [] });
      }
      const entry = ingredientMap.get(key);
      if (!entry.unit && unit) entry.unit = unit;
      if (qty && !entry.rawQties.includes(qty)) entry.rawQties.push(qty);
      if (!entry.recipes.includes(recipe.name)) entry.recipes.push(recipe.name);
    }
  }

  // 2. Comparer au stock → manquants / présents
  const stockKeys   = Object.keys(stock);
  const missing     = [];
  const inStockList = [];

  for (const [key, entry] of ingredientMap) {
    let found = key in stock;
    if (!found) found = stockKeys.some(sk => sk.length >= 3 && key.includes(sk) && key.replace(sk, '').trim().length < 6);
    if (!found) found = stockKeys.some(sk => key.length >= 3 && sk.includes(key) && sk.replace(key, '').trim().length < 6);

    const colruytMatch = matchColruyt(key);
    const item = { key, ...entry, colruytMatch };
    if (found) inStockList.push(item);
    else       missing.push(item);
  }

  missing.sort((a, b)    => a.name.localeCompare(b.name, 'fr'));
  inStockList.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  _lastShoppingMissing = missing;
  _lastShoppingInStock = inStockList;

  renderShoppingBody(missing, inStockList);
  document.getElementById('shopping-panel').classList.add('open');
  document.getElementById('cat-shopping').style.display = '';
  document.getElementById('shopping-export-btn').style.display = missing.length > 0 ? '' : 'none';
  // Précharge le bilan nutrition en arrière-plan
  renderNutritionTab();
}

function renderShoppingBody(missing, inStockList) {
  const body = document.getElementById('shopping-body');
  if (!body) return;
  let html = '';

  // Section : À acheter
  if (missing.length === 0) {
    html += `<div class="shopping-empty">
      <div class="s-icon">🎉</div>
      <p>Tout est en stock !<br>Rien à acheter.</p>
    </div>`;
  } else {
    html += `<div class="shopping-section-title">
      À acheter <span class="s-badge">${missing.length}</span>
    </div>`;
    html += missing.map(item => {
      const qtyStr = item.rawQties.length > 0
        ? item.rawQties.join(', ') + (item.unit ? ' ' + item.unit : '')
        : '';
      let colruytHtml = '';
      if (!colruytData && !colruytLoading) {
        colruytHtml = `<div class="colruyt-match"><span class="colruyt-loading">Données Colruyt non chargées — cliquer ↻</span></div>`;
      } else if (colruytLoading) {
        colruytHtml = `<div class="colruyt-match"><span class="colruyt-loading">⏳ Chargement Colruyt…</span></div>`;
      } else if (item.colruytMatch) {
        const price = formatColruytPrice(item.colruytMatch);
        colruytHtml = `<div class="colruyt-match">
          <span class="colruyt-logo">COLRUYT</span>
          <span class="colruyt-product-name">${getColruytName(item.colruytMatch)}</span>
          ${price ? `<span class="colruyt-price">${price}</span>` : ''}
        </div>`;
      } else {
        colruytHtml = `<div class="colruyt-match"><span class="colruyt-loading">Aucun produit Colruyt trouvé</span></div>`;
      }
      return `<div class="shopping-item">
        <div class="shopping-item-top">
          <div class="shopping-item-dot missing"></div>
          <div class="shopping-item-name">${item.name}${qtyStr
            ? ` <span style="color:var(--warm-grey);font-size:0.8rem;font-weight:400">(${qtyStr})</span>`
            : ''}</div>
        </div>
        <div class="shopping-item-recipes">${item.recipes.join(', ')}</div>
        ${colruytHtml}
      </div>`;
    }).join('');
  }

  // Section : Déjà en stock
  if (inStockList.length > 0) {
    html += `<div class="shopping-section-title" style="margin-top:8px">
      Déjà en stock <span class="s-badge ok">${inStockList.length}</span>
    </div>`;
    html += inStockList.map(item => `
      <div class="shopping-item">
        <div class="shopping-item-top">
          <div class="shopping-item-dot instock"></div>
          <div class="shopping-item-name">${item.name}</div>
        </div>
        <div class="shopping-item-instock">✓ Disponible dans ton stock</div>
      </div>`).join('');
  }

  body.innerHTML = html;
}

function toggleShoppingPanel() {
  document.getElementById('shopping-panel').classList.toggle('open');
}
function closeShoppingPanel() {
  document.getElementById('shopping-panel').classList.remove('open');
}

function switchShoppingTab(id, btn) {
  document.querySelectorAll('.shopping-tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.shopping-tab').forEach(el => el.classList.remove('active'));
  document.getElementById('shopping-tab-' + id).classList.add('active');
  btn.classList.add('active');
  if (id === 'nutrition') renderNutritionTab();
}

// ── Export JSON ──
function exportShoppingList() {
  if (_lastShoppingMissing.length === 0) return;
  const exportData = {
    generatedAt: new Date().toISOString(),
    plats: [...plannerSelected].map(id => RECIPES.find(r => r.id === id)?.name).filter(Boolean),
    liste: _lastShoppingMissing.map(item => ({
      ingredient: item.name,
      quantite:   item.rawQties.join(', ') || null,
      unite:      item.unit || null,
      recettes:   item.recipes,
      colruyt:    item.colruytMatch ? {
        nom:  getColruytName(item.colruytMatch),
        prix: formatColruytPrice(item.colruytMatch)
      } : null
    }))
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `liste-courses-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
