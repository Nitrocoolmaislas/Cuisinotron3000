// ══════════════════════════════════════════════
//  GLYCEMIC — charge glycémique (CG) estimée par recette
//  Dépend de : ingredientParser.js, utils.js, nutrition_data.js (toGrams),
//              ciqual_fr.js (getNutriData), glycemic_index.js (getGlycemicIndex)
//
//  Formule standard : CG = IG × (glucides disponibles en g) / 100, par
//  ingrédient, sommée sur la recette puis divisée par le nombre de
//  portions. CIQUAL.gluc exclut déjà les fibres (glucides disponibles),
//  donc pas de retraitement nécessaire avant d'appliquer la formule.
//
//  coverage = part des glucides de la recette couverte par un IG connu.
//  En dessous de 60%, la CG n'est pas jugée fiable (trop de glucides
//  "à IG inconnu" pour que le total ait un sens) — glPerServing est
//  alors null plutôt qu'un chiffre trompeur.
// ══════════════════════════════════════════════

const GL_COVERAGE_THRESHOLD = 0.6;

const _recipeGLCache = new Map();

function invalidateGLCache(id) {
  if (id) _recipeGLCache.delete(id);
  else _recipeGLCache.clear();
}

function computeRecipeGlycemicLoad(recipe) {
  if (_recipeGLCache.has(recipe.id)) return _recipeGLCache.get(recipe.id);

  let totalGL = 0, carbsCovered = 0, carbsTotal = 0;

  for (const raw of (recipe.ingredients || [])) {
    let p;
    try { p = parseIngredientString(raw); } catch (e) { continue; }
    const key = canonicalIngredientKey(p.rawName);
    const grams = typeof toGrams !== 'undefined' ? toGrams(p.qty ? String(p.qty) : '', p.unit, key) : 0;
    const nutri = typeof getNutriData !== 'undefined' ? getNutriData(key) : null;
    if (!nutri || !grams) continue;

    const carbs = (nutri.gluc ?? 0) * grams / 100;
    if (carbs <= 0) continue;
    carbsTotal += carbs;

    const gi = typeof getGlycemicIndex === 'function' ? getGlycemicIndex(key) : null;
    if (gi != null) {
      totalGL += gi * carbs / 100;
      carbsCovered += carbs;
    }
  }

  const servings = recipe.servings || 1;
  const coverage = carbsTotal > 0 ? carbsCovered / carbsTotal : 0;
  const glPerServing = coverage >= GL_COVERAGE_THRESHOLD ? totalGL / servings : null;

  const result = { glPerServing, coverage };
  _recipeGLCache.set(recipe.id, result);
  return result;
}
