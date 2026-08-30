// ══════════════════════════════════════════════
//  GOALS — objectifs nutritionnels cumulables
//  Dépend de : ingredientParser.js, utils.js, nutrition_data.js (toGrams),
//              ciqual_fr.js (getNutriData), recipes.js
// ══════════════════════════════════════════════

const GOALS_KEY = 'recettes_nutrition_goals';

const GOAL_DEFS = [
  { key: 'fb',   label: 'Fibres',    unit: 'g',    icon: '🌾', defaultMode: 'min', defaultThreshold: 5   },
  { key: 'p',    label: 'Protéines', unit: 'g',    icon: '💪', defaultMode: 'min', defaultThreshold: 20  },
  { key: 'kcal', label: 'Calories',  unit: 'kcal', icon: '🔥', defaultMode: 'max', defaultThreshold: 600 },
  { key: 'c',    label: 'Glucides',  unit: 'g',    icon: '🍞', defaultMode: 'max', defaultThreshold: 40  },
  { key: 'f',    label: 'Lipides',   unit: 'g',    icon: '🫒', defaultMode: 'max', defaultThreshold: 20  },
];

// ── Persistance ──
function loadGoalsState() {
  try {
    const raw = JSON.parse(localStorage.getItem(GOALS_KEY) || 'null');
    if (raw && typeof raw === 'object' && raw.goals) return raw;
  } catch (e) {}
  return { strict: false, goals: {} };
}

function saveGoalsState(state) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(state));
}

function activeGoalDefs() {
  const state = loadGoalsState();
  return GOAL_DEFS.filter(d => state.goals[d.key]?.enabled);
}

// ── Macros par recette — synchrone (pas d'appel réseau dans le pipeline actuel) ──
const _recipeMacroCache = new Map();

function invalidateRecipeMacroCache(id) {
  if (id) _recipeMacroCache.delete(id);
  else _recipeMacroCache.clear();
}

function computeRecipeMacros(recipe) {
  if (_recipeMacroCache.has(recipe.id)) return _recipeMacroCache.get(recipe.id);

  const totals = { kcal: 0, p: 0, c: 0, f: 0, fb: 0 };
  let covered = 0, total = 0;

  for (const raw of (recipe.ingredients || [])) {
    let name, qty, unit;
    if (typeof parseIngredientString !== 'undefined') {
      const p = parseIngredientString(raw);
      name = p.rawName; qty = p.qty ? String(p.qty) : ''; unit = p.unit || '';
    } else {
      ({ name, qty, unit } = parseIngredient(raw));
    }
    const key = normIngredient(name);
    total++;

    const grams = typeof toGrams !== 'undefined' ? toGrams(qty, unit, key) : 0;
    const nutri = typeof getNutriData !== 'undefined' ? getNutriData(key) : null;

    if (nutri && grams > 0) {
      const factor = grams / 100;
      totals.kcal += (nutri.kcal ?? 0) * factor;
      totals.p    += (nutri.prot ?? 0) * factor;
      totals.c    += (nutri.gluc ?? 0) * factor;
      totals.f    += (nutri.lip  ?? 0) * factor;
      totals.fb   += (nutri.fib  ?? 0) * factor;
      covered++;
    }
  }

  const servings = recipe.servings || 1;
  const perServing = {
    kcal: totals.kcal / servings,
    p:    totals.p    / servings,
    c:    totals.c    / servings,
    f:    totals.f    / servings,
    fb:   totals.fb   / servings,
  };
  const coverage = total > 0 ? covered / total : 0;

  const result = { total: totals, perServing, coverage };
  _recipeMacroCache.set(recipe.id, result);
  return result;
}

// ── Correspondance aux objectifs actifs ──
// matches = la recette respecte TOUS les objectifs activés (cumulable)
// score   = marge moyenne au-delà du seuil, pour trier les recettes qui
//           correspondent le mieux en premier
function recipeGoalMatch(recipe) {
  const defs = activeGoalDefs();
  if (!defs.length) return { hasGoals: false, matches: true, metCount: 0, total: 0, score: 0 };

  const state = loadGoalsState();
  const { perServing, coverage } = computeRecipeMacros(recipe);

  let metCount = 0, score = 0;
  for (const def of defs) {
    const g = state.goals[def.key];
    const val = perServing[def.key] || 0;
    const threshold = g.threshold;
    const ok = g.mode === 'min' ? val >= threshold : val <= threshold;
    if (ok) metCount++;
    // Marge normalisée (utile pour le tri même hors mode strict)
    score += g.mode === 'min'
      ? (threshold > 0 ? (val - threshold) / threshold : 0)
      : (threshold > 0 ? (threshold - val) / threshold : 0);
  }

  return { hasGoals: true, matches: metCount === defs.length, metCount, total: defs.length, score, coverage };
}

function goalsBadgeHtml(recipe) {
  const m = recipeGoalMatch(recipe);
  if (!m.hasGoals || !m.matches) return '';
  return `<span class="goal-badge" title="Correspond à tes objectifs nutritionnels">🎯 Objectifs</span>`;
}

// ══════════════════════════════════════════════
//  PANEL DE CONFIGURATION
// ══════════════════════════════════════════════

function openGoalsPanel() {
  renderGoalsPanel();
  const panel = document.getElementById('goals-panel');
  panel.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGoalsPanel() {
  document.getElementById('goals-panel').classList.remove('open');
  document.body.style.overflow = '';
}

function renderGoalsPanel() {
  const state = loadGoalsState();
  const body = document.getElementById('goals-body');
  if (!body) return;

  body.innerHTML = GOAL_DEFS.map(def => {
    const g = state.goals[def.key] || { enabled: false, mode: def.defaultMode, threshold: def.defaultThreshold };
    return `
      <div class="goal-row ${g.enabled ? 'goal-row-active' : ''}">
        <label class="goal-toggle">
          <input type="checkbox" id="goal-enabled-${def.key}" ${g.enabled ? 'checked' : ''}
                 onchange="_toggleGoalRow('${def.key}')">
          <span class="goal-toggle-label">${def.icon} ${def.label}</span>
        </label>
        <div class="goal-controls">
          <select id="goal-mode-${def.key}" class="rf-select goal-mode-select">
            <option value="min" ${g.mode === 'min' ? 'selected' : ''}>Au moins</option>
            <option value="max" ${g.mode === 'max' ? 'selected' : ''}>Au plus</option>
          </select>
          <input type="number" id="goal-threshold-${def.key}" class="rf-input goal-threshold-input"
                 min="0" step="1" value="${g.threshold}">
          <span class="goal-unit">${def.unit}/portion</span>
        </div>
      </div>`;
  }).join('');

  const strictBox = document.getElementById('goal-strict');
  if (strictBox) strictBox.checked = !!state.strict;

  const catSelect = document.getElementById('goal-category');
  if (catSelect) catSelect.value = (typeof currentCat !== 'undefined' && currentCat !== 'custom') ? currentCat : 'all';
}

function _toggleGoalRow(key) {
  const row = document.getElementById(`goal-enabled-${key}`)?.closest('.goal-row');
  const enabled = document.getElementById(`goal-enabled-${key}`)?.checked;
  if (row) row.classList.toggle('goal-row-active', !!enabled);
}

function applyGoals() {
  const state = { strict: !!document.getElementById('goal-strict')?.checked, goals: {} };
  for (const def of GOAL_DEFS) {
    const enabled = document.getElementById(`goal-enabled-${def.key}`)?.checked || false;
    const mode = document.getElementById(`goal-mode-${def.key}`)?.value || def.defaultMode;
    const threshold = parseFloat(document.getElementById(`goal-threshold-${def.key}`)?.value);
    state.goals[def.key] = {
      enabled,
      mode,
      threshold: isNaN(threshold) ? def.defaultThreshold : threshold,
    };
  }
  saveGoalsState(state);
  closeGoalsPanel();
  renderGoalsChips();

  // En mode planificateur, filterCat() nous en ferait sortir (hidePlanner())
  // — on reste dedans et on se contente de re-render avec les objectifs.
  // Le sélecteur "type de plat" ne s'applique qu'à la grille normale.
  if (typeof plannerMode !== 'undefined' && plannerMode) {
    renderPlanner();
    return;
  }

  // filterCat() gère aussi le rendu de la grille (et remet en évidence le
  // bon bouton catégorie dans la sidebar) — pas besoin d'appeler renderGrid()
  // en plus.
  const cat = document.getElementById('goal-category')?.value || 'all';
  if (typeof filterCat === 'function') filterCat(cat);
  else renderGrid();
}

function clearAllGoals() {
  saveGoalsState({ strict: false, goals: {} });
  renderGoalsPanel();
  renderGoalsChips();
  renderGrid();
}

function disableGoal(key) {
  const state = loadGoalsState();
  if (state.goals[key]) state.goals[key].enabled = false;
  saveGoalsState(state);
  renderGoalsChips();
  renderGrid();
}

// ── Chips résumant les objectifs actifs, sous la barre de recherche ──
function renderGoalsChips() {
  const container = document.getElementById('goals-chips');
  const countEl = document.getElementById('cnt-goals');
  if (!container) return;
  const defs = activeGoalDefs();
  const state = loadGoalsState();

  if (countEl) countEl.textContent = defs.length || '';

  if (!defs.length) { container.innerHTML = ''; container.style.display = 'none'; return; }

  container.style.display = 'flex';
  const symbol = { min: '≥', max: '≤' };
  container.innerHTML = defs.map(def => {
    const g = state.goals[def.key];
    return `<span class="goal-chip">
      ${def.icon} ${def.label} ${symbol[g.mode]}${g.threshold}${def.unit}
      <button class="goal-chip-remove" onclick="disableGoal('${def.key}')" title="Retirer">✕</button>
    </span>`;
  }).join('') + (state.strict
    ? `<span class="goal-chip goal-chip-strict">🔒 Filtre strict</span>`
    : '');
}

document.addEventListener('DOMContentLoaded', () => {
  renderGoalsChips();
});
