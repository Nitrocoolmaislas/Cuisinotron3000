// ══════════════════════════════════════════════
//  CUSTOM RECIPES — recettes ajoutées par l'utilisateur
//  Stockées en localStorage + sync Drive
//  Fusionnées avec RECIPES au chargement
// ══════════════════════════════════════════════

const CUSTOM_RECIPES_KEY = 'recettes_custom';

// ── Charge et fusionne les recettes custom avec RECIPES ──
function loadCustomRecipes() {
  try {
    const raw = JSON.parse(localStorage.getItem(CUSTOM_RECIPES_KEY) || '[]');
    raw.forEach(r => {
      if (!RECIPES.find(x => x.id === r.id)) RECIPES.push(r);
    });
  } catch(e) { console.warn('Erreur chargement recettes custom:', e); }
}

function saveCustomRecipes() {
  const customs = RECIPES.filter(r => r.custom === true);
  localStorage.setItem(CUSTOM_RECIPES_KEY, JSON.stringify(customs));
  scheduleDriveSave();
}

// ── Génère un ID unique depuis le titre ──
function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) + '-' + Date.now().toString(36);
}

// ══════════════════════════════════════════════
//  PANNEAU DE CRÉATION
// ══════════════════════════════════════════════

let _editingRecipeId = null; // null = création, id = édition

function openRecipeForm(recipeId = null) {
  _editingRecipeId = recipeId;
  const panel = document.getElementById('recipe-form-panel');

  if (recipeId) {
    // Mode édition : pré-remplir le formulaire
    const r = RECIPES.find(x => x.id === recipeId);
    if (!r) return;
    document.getElementById('rf-title').value       = r.name;
    document.getElementById('rf-desc').value        = r.description || '';
    document.getElementById('rf-category').value    = r.category;
    document.getElementById('rf-prep').value        = r.prepTime || '';
    document.getElementById('rf-cook').value        = r.cookTime || '';
    document.getElementById('rf-servings').value    = r.servings || 2;
    document.getElementById('rf-notes').value       = r.notes || '';
    document.getElementById('rf-form-title').textContent = '✏️ Modifier la recette';
    document.getElementById('rf-submit-btn').textContent = '💾 Enregistrer les modifications';
    renderIngredientInputs(r.ingredients);
    renderStepInputs(r.steps);
  } else {
    // Mode création : formulaire vide
    document.getElementById('rf-title').value       = '';
    document.getElementById('rf-desc').value        = '';
    document.getElementById('rf-category').value    = 'repas';
    document.getElementById('rf-prep').value        = '';
    document.getElementById('rf-cook').value        = '';
    document.getElementById('rf-servings').value    = 2;
    document.getElementById('rf-notes').value       = '';
    document.getElementById('rf-form-title').textContent = '➕ Nouvelle recette';
    document.getElementById('rf-submit-btn').textContent = '✅ Ajouter la recette';
    renderIngredientInputs(['']);
    renderStepInputs(['']);
  }

  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('rf-title').focus();
}

function closeRecipeForm() {
  document.getElementById('recipe-form-panel').classList.remove('open');
  document.body.style.overflow = '';
  _editingRecipeId = null;
}

// ── Ingrédients dynamiques ──
function renderIngredientInputs(items = ['']) {
  const container = document.getElementById('rf-ingredients');
  container.innerHTML = items.map((val, i) => ingredientRow(val, i)).join('');
}

function ingredientRow(val, idx) {
  return `<div class="rf-list-row" id="rf-ing-${idx}">
    <input type="text" class="rf-list-input" placeholder="ex: 200g de champignons"
      value="${escapeAttr(val)}" oninput="syncIngredientVal(${idx}, this.value)">
    <button class="rf-list-remove" onclick="removeIngredientRow(${idx})" title="Supprimer">✕</button>
  </div>`;
}

let _ingredients = [''];
function syncIngredientVal(idx, val) { _ingredients[idx] = val; }
function addIngredientRow() {
  _ingredients.push('');
  const container = document.getElementById('rf-ingredients');
  const idx = _ingredients.length - 1;
  container.insertAdjacentHTML('beforeend', ingredientRow('', idx));
  container.querySelectorAll('.rf-list-input')[idx]?.focus();
}
function removeIngredientRow(idx) {
  _ingredients.splice(idx, 1);
  renderIngredientInputs(_ingredients);
}

// ── Étapes dynamiques ──
function renderStepInputs(items = ['']) {
  _steps = [...items];
  const container = document.getElementById('rf-steps');
  container.innerHTML = items.map((val, i) => stepRow(val, i)).join('');
}

function stepRow(val, idx) {
  return `<div class="rf-list-row" id="rf-step-${idx}">
    <span class="rf-step-num">${idx + 1}</span>
    <textarea class="rf-list-input rf-step-input" placeholder="Décris l'étape…"
      oninput="syncStepVal(${idx}, this.value)">${escapeAttr(val)}</textarea>
    <button class="rf-list-remove" onclick="removeStepRow(${idx})" title="Supprimer">✕</button>
  </div>`;
}

let _steps = [''];
function syncStepVal(idx, val) { _steps[idx] = val; }
function addStepRow() {
  _steps.push('');
  const container = document.getElementById('rf-steps');
  const idx = _steps.length - 1;
  container.insertAdjacentHTML('beforeend', stepRow('', idx));
  container.querySelectorAll('.rf-step-input')[idx]?.focus();
}
function removeStepRow(idx) {
  _steps.splice(idx, 1);
  renderStepInputs(_steps);
}

// ── Initialise les listes depuis le DOM (pour éviter la désync) ──
function syncListsFromDOM() {
  _ingredients = [...document.getElementById('rf-ingredients')
    .querySelectorAll('.rf-list-input')]
    .map(el => el.value.trim());
  _steps = [...document.getElementById('rf-steps')
    .querySelectorAll('.rf-step-input')]
    .map(el => el.value.trim());
}

// ── Soumission ──
function submitRecipeForm() {
  syncListsFromDOM();

  const title    = document.getElementById('rf-title').value.trim();
  const category = document.getElementById('rf-category').value;
  const desc     = document.getElementById('rf-desc').value.trim();
  const prep     = parseInt(document.getElementById('rf-prep').value) || 0;
  const cook     = parseInt(document.getElementById('rf-cook').value) || 0;
  const servings = parseInt(document.getElementById('rf-servings').value) || 2;
  const notes    = document.getElementById('rf-notes').value.trim();

  const ingredients = _ingredients.filter(Boolean);
  const steps       = _steps.filter(Boolean);

  // Validation minimale
  const errors = [];
  if (!title)               errors.push('Le titre est obligatoire');
  if (ingredients.length === 0) errors.push('Au moins un ingrédient requis');
  if (steps.length === 0)   errors.push('Au moins une étape requise');

  const errEl = document.getElementById('rf-errors');
  if (errors.length > 0) {
    errEl.textContent = errors.join(' · ');
    errEl.style.display = '';
    return;
  }
  errEl.style.display = 'none';

  const catLabels = { repas: 'Repas chauds', tartinade: 'Tartinades & Dips', petitdej: 'Petits-déjeuners' };

  if (_editingRecipeId) {
    // Édition — mise à jour en place
    const idx = RECIPES.findIndex(r => r.id === _editingRecipeId);
    if (idx !== -1) {
      RECIPES[idx] = {
        ...RECIPES[idx],
        name: title, description: desc, category,
        categoryLabel: catLabels[category],
        prepTime: prep, cookTime: cook, servings,
        ingredients, steps, notes: notes || null,
        custom: true,
      };
    }
  } else {
    // Création
    RECIPES.push({
      id: slugify(title),
      custom: true,
      category,
      categoryLabel: catLabels[category],
      name: title,
      description: desc,
      prepTime: prep,
      cookTime: cook,
      servings,
      ingredients,
      steps,
      notes: notes || null,
    });
  }

  saveCustomRecipes();
  closeRecipeForm();
  renderGrid();
  updateCounts();

  // Flash de confirmation
  showToast(_editingRecipeId ? '✏️ Recette modifiée !' : '✅ Recette ajoutée !');
}

// ── Suppression d'une recette custom ──
function deleteCustomRecipe(id) {
  if (!confirm('Supprimer cette recette ?')) return;
  const idx = RECIPES.findIndex(r => r.id === id);
  if (idx !== -1) RECIPES.splice(idx, 1);
  saveCustomRecipes();
  closeModalDirect();
  renderGrid();
  updateCounts();
}

// ── Toast de confirmation ──
function showToast(msg) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      background:var(--charcoal);color:white;padding:12px 24px;
      border-radius:10px;font-family:'DM Sans',sans-serif;font-size:0.9rem;
      z-index:9999;opacity:0;transition:opacity 0.2s;pointer-events:none;
      border-left:4px solid var(--sage);
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2500);
}
