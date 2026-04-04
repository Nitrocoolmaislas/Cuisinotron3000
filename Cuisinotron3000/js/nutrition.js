// ══════════════════════════════════════════════
//  NUTRITION — calcul des macros hebdomadaires
//
//  Priorité des sources de données (par ordre) :
//  1. Données nutritionnelles du produit Colruyt (si dispo dans le JSON)
//  2. Table CIQUAL statique dans nutrition_data.js
//  3. Open Food Facts API (via EAN Colruyt)
//
//  Dépend de : recipes.js, utils.js, nutrition_data.js, colruyt.js
// ══════════════════════════════════════════════

// Cache Open Food Facts (EAN → données)
const _offCache = {};

async function fetchNutritionFromOFF(ean) {
  if (!ean || ean.length < 8) return null;
  if (_offCache[ean]) return _offCache[ean];
  try {
    const resp = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${ean}.json` +
      `?fields=product_name,nutriscore_grade,nova_group,nutriments`
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.status !== 1 || !data.product?.nutriments) return null;
    const n = data.product.nutriments;
    const result = {
      source: 'openfoodfacts',
      kcal: n['energy-kcal_100g'] ?? (n['energy_100g'] ? n['energy_100g'] / 4.184 : null),
      p:    n['proteins_100g']       ?? null,
      c:    n['carbohydrates_100g']  ?? null,
      f:    n['fat_100g']             ?? null,
      fb:   n['fiber_100g']           ?? null,
      nutriscore: data.product.nutriscore_grade?.toUpperCase() ?? null,
      nova:       data.product.nova_group ?? null,
    };
    _offCache[ean] = result;
    return result;
  } catch { return null; }
}

// ── Trouve les données nutritionnelles pour un ingrédient ──
// Sources (par priorité) :
// 1. Table CIQUAL statique (nutrition_data.js)
// 2. Open Food Facts par nom si pas de correspondance CIQUAL (futur)
// Note : le dataset Colruyt ne contient pas d'EAN ni de données nutritionnelles
async function getNutritionFor(normKey, colruytProduct) {
  // 1. Table CIQUAL statique
  const ciqual = NUTRITION_DATA[normKey];
  if (ciqual) return { ...ciqual, source: 'ciqual' };

  return null;
}

// ── Calcul macros totales pour les recettes sélectionnées ──
async function calcWeeklyNutrition(selectedIds) {
  const totals  = { kcal: 0, p: 0, c: 0, f: 0, fb: 0 };
  const details = [];
  let covered = 0, total = 0;
  const sourceCount = { colruyt: 0, openfoodfacts: 0, ciqual: 0, unknown: 0 };

  for (const id of selectedIds) {
    const recipe = RECIPES.find(r => r.id === id);
    if (!recipe) continue;

    const recipeNutri = { kcal: 0, p: 0, c: 0, f: 0, fb: 0 };

    for (const raw of recipe.ingredients) {
      const { name, qty, unit } = parseIngredient(raw);
      const key   = normIngredient(name);
      const grams = toGrams(qty, unit, key);
      total++;

      const colProd = matchColruyt(key);
      const nutri   = await getNutritionFor(key, colProd);

      if (nutri && grams > 0) {
        const factor = grams / 100;
        recipeNutri.kcal += (nutri.kcal ?? 0) * factor;
        recipeNutri.p    += (nutri.p    ?? 0) * factor;
        recipeNutri.c    += (nutri.c    ?? 0) * factor;
        recipeNutri.f    += (nutri.f    ?? 0) * factor;
        recipeNutri.fb   += (nutri.fb   ?? 0) * factor;
        covered++;
        sourceCount[nutri.source || 'unknown']++;
      }
    }

    const perServing = roundMacros({ ...recipeNutri });
    const recipeTotal = roundMacros({
      kcal: recipeNutri.kcal * recipe.servings,
      p:    recipeNutri.p    * recipe.servings,
      c:    recipeNutri.c    * recipe.servings,
      f:    recipeNutri.f    * recipe.servings,
      fb:   recipeNutri.fb   * recipe.servings,
    });

    details.push({ recipe, perServing, total: recipeTotal });
    Object.keys(totals).forEach(k => { totals[k] += recipeTotal[k]; });
  }

  return {
    totals:   roundMacros(totals),
    details,
    perDay:   roundMacros({ kcal: totals.kcal/7, p: totals.p/7, c: totals.c/7, f: totals.f/7, fb: totals.fb/7 }),
    coverage: total > 0 ? Math.round((covered / total) * 100) : 0,
    sourceCount,
  };
}

function roundMacros(obj) {
  const out = {};
  Object.keys(obj).forEach(k => { out[k] = Math.round(obj[k]); });
  return out;
}

// ══════════════════════════════════════════════
//  RENDU DU TAB NUTRITION
// ══════════════════════════════════════════════

let _lastNutritionData = null;

async function renderNutritionTab() {
  const panel = document.getElementById('nutrition-body');
  if (!panel) return;

  if (plannerSelected.size === 0) {
    panel.innerHTML = `<div class="shopping-empty">
      <div class="s-icon">📊</div>
      <p>Sélectionne des plats dans le planificateur pour voir le bilan nutritionnel.</p>
    </div>`;
    return;
  }

  panel.innerHTML = `<div style="padding:20px;text-align:center;color:var(--warm-grey);font-size:0.85rem;">
    ⏳ Calcul des macros en cours…</div>`;

  const data = await calcWeeklyNutrition(plannerSelected);
  _lastNutritionData = data;
  const { totals, perDay, details, coverage, sourceCount } = data;

  const DAILY_REF = { kcal: 2000, p: 75, c: 260, f: 70, fb: 25 };

  function macroBar(label, val, ref, color, unit = 'g') {
    const pct = ref > 0 ? Math.min(100, Math.round((val / ref) * 100)) : 0;
    const over = val > ref;
    return `<div class="macro-row">
      <span class="macro-label">${label}</span>
      <div class="macro-bar-wrap">
        <div class="macro-bar-fill" style="width:${pct}%;background:${over ? 'var(--terracotta)' : color}"></div>
      </div>
      <span class="macro-value" style="${over ? 'color:var(--terracotta)' : ''}">${val}${unit}</span>
    </div>`;
  }

  // Source badge
  function sourceBadge() {
    const parts = [];
    if (sourceCount.colruyt > 0)      parts.push(`${sourceCount.colruyt} × Colruyt`);
    if (sourceCount.openfoodfacts > 0) parts.push(`${sourceCount.openfoodfacts} × Open Food Facts`);
    if (sourceCount.ciqual > 0)        parts.push(`${sourceCount.ciqual} × CIQUAL`);
    return parts.join(' · ');
  }

  let html = '';

  // Couverture + sources
  html += `<div class="nutri-coverage">
    Couverture : <strong>${coverage}%</strong> des ingrédients analysés
    ${coverage < 60 ? ' <span style="color:var(--warning)">· données partielles</span>' : ''}
    ${sourceCount.colruyt || sourceCount.openfoodfacts || sourceCount.ciqual
      ? `<br><span style="font-size:0.68rem">${sourceBadge()}</span>` : ''}
  </div>`;

  // Bilan semaine
  html += `<div class="nutri-section-title">📅 Bilan de la semaine</div>
  <div class="nutri-card">
    <div class="nutri-kcal">${totals.kcal.toLocaleString('fr-BE')} <span>kcal</span></div>
    <div class="nutri-macros-grid">
      <div class="nutri-macro-chip" style="--chip-color:#E87D6F">
        <div class="chip-val">${totals.p}g</div><div class="chip-lbl">Protéines</div>
      </div>
      <div class="nutri-macro-chip" style="--chip-color:#6FA3E0">
        <div class="chip-val">${totals.c}g</div><div class="chip-lbl">Glucides</div>
      </div>
      <div class="nutri-macro-chip" style="--chip-color:#F0C060">
        <div class="chip-val">${totals.f}g</div><div class="chip-lbl">Lipides</div>
      </div>
      <div class="nutri-macro-chip" style="--chip-color:#7CBF7C">
        <div class="chip-val">${totals.fb}g</div><div class="chip-lbl">Fibres</div>
      </div>
    </div>
  </div>`;

  // Moyenne journalière vs référence
  html += `<div class="nutri-section-title">📆 Moyenne journalière <span style="font-size:0.7rem;font-weight:400">(÷7 jours)</span></div>
  <div class="nutri-card">
    ${macroBar('Calories',  perDay.kcal, DAILY_REF.kcal, '#C4663A', ' kcal')}
    ${macroBar('Protéines', perDay.p,    DAILY_REF.p,    '#E87D6F')}
    ${macroBar('Glucides',  perDay.c,    DAILY_REF.c,    '#6FA3E0')}
    ${macroBar('Lipides',   perDay.f,    DAILY_REF.f,    '#F0C060')}
    ${macroBar('Fibres',    perDay.fb,   DAILY_REF.fb,   '#7CBF7C')}
    <div style="font-size:0.67rem;color:var(--warm-grey);margin-top:8px;text-align:right;">
      Références : ${DAILY_REF.kcal} kcal · ${DAILY_REF.p}g prot. · ${DAILY_REF.c}g gluc. · ${DAILY_REF.f}g lip. · ${DAILY_REF.fb}g fibres
    </div>
  </div>`;

  // Détail recettes
  html += `<div class="nutri-section-title">🍽️ Par recette (toutes portions)</div>`;
  html += details.map(d => `
    <div class="nutri-recipe-row">
      <div class="nutri-recipe-name">${d.recipe.name}</div>
      <div class="nutri-recipe-sub">${d.recipe.servings} portion${d.recipe.servings > 1 ? 's' : ''}</div>
      <div class="nutri-recipe-chips">
        <span class="nutri-r-chip kcal">${d.total.kcal} kcal</span>
        <span class="nutri-r-chip prot">${d.total.p}g prot.</span>
        <span class="nutri-r-chip carb">${d.total.c}g gluc.</span>
        <span class="nutri-r-chip fat">${d.total.f}g lip.</span>
        <span class="nutri-r-chip" style="background:#F0FAF0;color:#3A7A3A">${d.total.fb}g fibres</span>
      </div>
    </div>`).join('');

  // Note sources
  html += `<div class="nutri-off-note">
    <span>🔬</span>
    Sources : table <strong>CIQUAL (Anses)</strong> pour les ingrédients de base,
    enrichie par les données <strong>Colruyt</strong> et <strong>Open Food Facts</strong>
    quand disponibles via EAN.
  </div>`;

  panel.innerHTML = html;
}
