// ══════════════════════════════════════════════════════════════════════
//  marmiton.js — Recherche & import Marmiton intégré
//  Dépend de : utils.js (normIngredient), stock.js (stock),
//              ingredientParser.js (parseIngredientString),
//              importer.js (openImportPanel)
// ══════════════════════════════════════════════════════════════════════

const MARMITON_BASE  = 'https://www.marmiton.org';
const _M_REPO        = 'Nitrocoolmaislas/Cuisinotron3000';
const _M_WF          = 'marmiton-scrape.yml';
const _M_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy/?quest=',
];

// ── HTTP ──────────────────────────────────────────────────────────────

// Délai max par proxy — sans ça, un proxy public lent/mort (allorigins,
// corsproxy.io, codetabs sont connus pour être capricieux) peut faire
// traîner fetch() très longtemps avant d'échouer, et comme les 3 sont
// essayés en séquence, une recherche hors catalogue peut rester bloquée
// sur "Recherche en cours…" pendant très longtemps sur mobile.
const _M_PROXY_TIMEOUT_MS = 6000;

async function _mFetch(url) {
  for (const proxy of _M_PROXIES) {
    try {
      const r = await fetch(proxy + encodeURIComponent(url), {
        cache: 'no-store',
        signal: AbortSignal.timeout(_M_PROXY_TIMEOUT_MS),
      });
      if (!r.ok) continue;
      const html = await r.text();
      // Reject bot-detection / consent pages (no useful content)
      if (html.length < 2000 || (!html.includes('marmiton') && !html.includes('recette'))) continue;
      // Reject consent/captcha pages — valid pages always have structured data
      if (!html.includes('__NEXT_DATA__') && !html.includes('application/ld+json')) continue;
      return html;
    } catch { /* timeout ou erreur réseau — passe au proxy suivant */ }
  }
  throw new Error('Proxies CORS indisponibles — Marmiton bloque les requêtes automatiques');
}

function _mNextData(html) {
  const m = html.match(/<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch { return null; }
}

function _mJsonLd(html) {
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      const items = Array.isArray(data) ? data
        : data['@graph'] ? data['@graph'] : [data];
      const rec = items.find(x => x['@type'] === 'Recipe' ||
        (Array.isArray(x['@type']) && x['@type'].includes('Recipe')));
      if (rec) return rec;
    } catch { /* skip malformed */ }
  }
  return null;
}

// ── Recipe detail ─────────────────────────────────────────────────────

function _mRecipeFromNextData(nd) {
  // Try several known paths in Marmiton's __NEXT_DATA__
  const r = nd?.props?.pageProps?.recipe
         || nd?.props?.pageProps?.SSRRecipe
         || nd?.props?.pageProps?.recipeDetails
         || nd?.props?.pageProps?.data?.recipe;
  if (!r?.name || !r?.recipeIngredient?.length) return null;
  const _min = v => { const m = String(v||'').match(/(?:(\d+)H)?(?:(\d+)M)?/); return m?(+m[1]||0)*60+(+m[2]||0):0; };
  return {
    name:        r.name.trim(),
    ingredients: (r.recipeIngredient||[]).map(i=>String(i).trim()).filter(Boolean),
    steps:       (r.recipeInstructions||[]).map(s=>typeof s==='string'?s:(s.text||s.name||'')).filter(Boolean),
    description: (r.description||'').trim(),
    prepTime:    _min(r.prepTime),
    cookTime:    _min(r.cookTime||r.totalTime),
    servings:    parseInt(String(Array.isArray(r.recipeYield)?r.recipeYield[0]:r.recipeYield||'').match(/\d+/)?.[0])||2,
    sourceUrl:   MARMITON_BASE + (r.url||''),
    image:       (Array.isArray(r.image)?r.image[0]?.url||r.image[0]:r.image?.url||r.image||''),
  };
}

async function _mGetRecipe(uri) {
  const url = MARMITON_BASE + (uri.startsWith('/') ? uri : '/' + uri);
  const html = await _mFetch(url);

  // 1. JSON-LD (preferred)
  const ld = _mJsonLd(html);
  if (!ld) {
    // 2. __NEXT_DATA__ fallback (works when JSON-LD missing from SSR page)
    const nd  = _mNextData(html);
    const rec = nd ? _mRecipeFromNextData(nd) : null;
    if (rec) return rec;
    throw new Error('Aucune donnée de recette trouvée (Marmiton a peut-être servi une page de consentement)');
  }

  const _min = prop => {
    const v = String(ld[prop] || '');
    const m = v.match(/(?:(\d+)H)?(?:(\d+)M)?/);
    return m ? (parseInt(m[1] || 0) * 60 + parseInt(m[2] || 0)) : 0;
  };
  const _servings = () => {
    let y = ld.recipeYield || '';
    if (Array.isArray(y)) y = y[0] || '';
    const m = String(y).match(/(\d+)/);
    return m ? parseInt(m[1]) : 2;
  };
  const _steps = () => (ld.recipeInstructions || [])
    .map(s => typeof s === 'string' ? s.trim() : (s.text || s.name || '').trim())
    .filter(Boolean);
  const _img = () => {
    const i = ld.image;
    if (!i) return '';
    if (typeof i === 'string') return i;
    if (Array.isArray(i)) return i[0]?.url || i[0] || '';
    return i.url || '';
  };

  return {
    name:        (ld.name || '').trim(),
    ingredients: (ld.recipeIngredient || []).map(i => String(i).trim()).filter(Boolean),
    steps:       _steps(),
    description: (ld.description || '').trim(),
    prepTime:    _min('prepTime'),
    cookTime:    _min('cookTime'),
    servings:    _servings(),
    sourceUrl:   url,
    image:       _img(),
  };
}

// ── Stock scoring ─────────────────────────────────────────────────────

function _mScoreIngredients(ingredients) {
  if (!ingredients?.length) return { matched: 0, total: 0, pct: 0 };
  let matched = 0;
  for (const raw of ingredients) {
    const { rawName } = parseIngredientString(raw);
    const key = typeof canonicalIngredientKey === 'function' ? canonicalIngredientKey(rawName) : normIngredient(rawName);
    if (!key || key.length < 2) continue;
    if (stock[key]) { matched++; continue; }
    // substring fallback
    if (Object.keys(stock).some(k => k.length >= 3 && (k.includes(key) || key.includes(k))))
      matched++;
  }
  return { matched, total: ingredients.length, pct: Math.round(matched / ingredients.length * 100) };
}

// ── Régime alimentaire (heuristique) ───────────────────────────────────
// Best-effort, pas une garantie médicale : déduit de la catégorie WHITELIST
// (data/whitelist_canonique.js) de chaque ingrédient. "Laits & boissons
// végétales" mélange lait animal et boissons végétales — trop ambigu pour
// trancher le végan, volontairement exclu (un faux "végan" reste possible
// si une recette contient du lait de vache non catégorisé plus finement).
const _M_MEAT_FISH_CATS = new Set(['Viandes', 'Charcuteries', 'Poissons', 'Fruits de mer']);
const _M_DAIRY_EGG_CATS = new Set(['Œufs', 'Fromages', 'Crèmes', 'Produits laitiers frais']);

function _mDietFlags(ingredients) {
  let hasMeatFish = false, hasDairyEgg = false;
  for (const raw of (ingredients || [])) {
    let rawName;
    try { rawName = parseIngredientString(raw).rawName; } catch { rawName = raw; }
    const key = typeof canonicalIngredientKey === 'function' ? canonicalIngredientKey(rawName) : normIngredient(rawName);
    const entry = typeof whitelistEntry === 'function' ? whitelistEntry(key) : null;
    if (!entry?.cat) continue; // ingrédient non couvert par WHITELIST → ignoré, pas de faux négatif
    if (_M_MEAT_FISH_CATS.has(entry.cat)) hasMeatFish = true;
    if (_M_DAIRY_EGG_CATS.has(entry.cat)) hasDairyEgg = true;
  }
  return { vegetarian: !hasMeatFish, vegan: !hasMeatFish && !hasDairyEgg };
}

function _mDietMatch(recipe, diet) {
  if (!diet) return true;
  const flags = _mDietFlags(recipe.ingredients);
  if (diet === 'vegan') return flags.vegan;
  if (diet === 'vegetarien') return flags.vegetarian;
  return true;
}

// ── Objectifs nutritionnels ─────────────────────────────────────────────
// Même règle que renderGrid()/renderPlanner() (app.js, planner.js) : trie les
// résultats qui correspondent le mieux en premier, et en mode strict (case du
// panel Objectifs) ne garde que ceux qui satisfont TOUS les objectifs actifs.
// Réutilise directement recipeGoalMatch()/computeRecipeMacros() — les entrées
// catalogue (id/ingredients/servings) ont la même forme qu'une recette
// classique, aucun calcul dupliqué ici.
function _mApplyGoals(hits) {
  if (typeof activeGoalDefs !== 'function' || !activeGoalDefs().length) return hits;
  const strict = typeof loadGoalsState === 'function' && loadGoalsState().strict;
  const withMatch = hits.map(h => ({
    h,
    // Évaluable seulement pour les résultats catalogue (id + ingrédients +
    // portions présents). computeRecipeMacros() met son résultat en cache
    // par recipe.id — un detail sans id (recherche proxy live, hors
    // catalogue) collisionnerait dans ce cache plutôt que de donner un
    // mauvais résultat, on ne l'évalue donc pas du tout.
    m: h.detail?.id ? recipeGoalMatch(h.detail) : null,
  }));
  const filtered = strict ? withMatch.filter(x => x.m && x.m.matches) : withMatch;
  filtered.sort((a, b) => {
    if (!a.m && !b.m) return 0;
    if (!a.m) return 1;   // non évaluables relégués en fin de liste
    if (!b.m) return -1;
    return (b.m.metCount - a.m.metCount) || (b.m.score - a.m.score);
  });
  return filtered.map(x => x.h);
}

function _mGoalsHint() {
  const el = document.getElementById('marmiton-goals-hint');
  if (!el) return;
  const defs = typeof activeGoalDefs === 'function' ? activeGoalDefs() : [];
  if (!defs.length) { el.style.display = 'none'; return; }
  const strict = typeof loadGoalsState === 'function' && loadGoalsState().strict;
  el.style.display = '';
  el.textContent = `🎯 ${defs.length} objectif${defs.length > 1 ? 's' : ''} nutritionnel${defs.length > 1 ? 's' : ''} actif${defs.length > 1 ? 's' : ''} — résultats ${strict ? 'filtrés' : 'triés'} en conséquence`;
}

// Simplify a stock display name to a Marmiton-friendly search term (max 2 words)
const _M_STOP = /\b(doux|douce|epaisse?|liquide|entier|entiere|frais|fraiche|blanc|blanche|noire?|rouge|vert|verte|maison|nature|bio|surgele[es]?|crue?s?|cuites?|cube[s]?|rapee?|hache[e]?|fonde?|demi|semi|leger|legere|jeune[s]?)\b/gi;
function _mSimplify(name) {
  const clean = name.replace(_M_STOP, '').replace(/\s+/g, ' ').trim();
  return clean.split(' ').slice(0, 2).join(' ') || name.split(' ')[0];
}

function _mTopStockIngredients(n = 6) {
  return Object.values(stock)
    .sort((a, b) => (b.qty || 0) - (a.qty || 0))
    .slice(0, n)
    .map(v => _mSimplify(v.name))
    .filter((s, i, arr) => s && arr.indexOf(s) === i); // dedupe
}

// ── State ─────────────────────────────────────────────────────────────

let _mResults        = [];
let _mSearching      = false;
let _mCatalog        = null;   // cache in-memory du catalogue statique
let _mCatalogUpdated = null;   // date de mise à jour (champ `updated` du JSON)

// ── GitHub token ──────────────────────────────────────────────────────

function _mGhToken() {
  return localStorage.getItem('marmiton_gh_token') || '';
}

function marmSaveGhToken() {
  const val = document.getElementById('marm-gh-token')?.value.trim() || '';
  if (val) localStorage.setItem('marmiton_gh_token', val);
  else localStorage.removeItem('marmiton_gh_token');
  const btn = event?.target;
  if (btn) { const prev = btn.textContent; btn.textContent = '✅'; setTimeout(() => btn.textContent = prev, 2000); }
}

async function marmTriggerScrape() {
  const token = _mGhToken();
  if (!token) {
    window.open(`https://github.com/${_M_REPO}/actions/workflows/${_M_WF}`, '_blank', 'noopener');
    return;
  }
  const btn = document.getElementById('marm-refresh-btn');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Démarrage…'; }
  try {
    const r = await fetch(
      `https://api.github.com/repos/${_M_REPO}/actions/workflows/${_M_WF}/dispatches`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ref: 'main' }),
      }
    );
    if (r.status === 204) {
      // Invalider le cache catalogue pour que la prochaine ouverture du panel charge la version fraîche
      _mCatalog = null; _mCatalogUpdated = null;
      if (btn) btn.textContent = '✅ Lancé — reviens dans ~5 min';
      const el = document.getElementById('marm-catalog-status');
      if (el) el.textContent = '⏳ Scrape en cours… recharge le panel dans 5 min';
      setTimeout(() => { if (btn) { btn.disabled = false; btn.textContent = '🔄 Mettre à jour'; } }, 8000);
    } else {
      const err = await r.json().catch(() => ({}));
      if (btn) { btn.disabled = false; btn.textContent = '🔄 Mettre à jour'; }
      alert(`Erreur GitHub API ${r.status}: ${err.message || 'token invalide?'}`);
    }
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '🔄 Mettre à jour'; }
    alert(`Erreur réseau : ${e.message}`);
  }
}

// ── Catalogue statique (data/marmiton_catalog.json) ───────────────────

// Verrou sur le fetch en cours — sans ça, deux appels concurrents (ex:
// openMarmitonPanel() puis marmSearch() lancé avant que le premier fetch
// n'ait fini) déclenchaient chacun leur propre fetch des 3 catalogues
// (jusqu'à ~1.6 Mo téléchargés et parsés deux fois), plutôt que le second
// appel attende le résultat du premier.
let _mCatalogPromise = null;

async function _mLoadCatalog() {
  if (_mCatalog) return _mCatalog;
  if (_mCatalogPromise) return _mCatalogPromise;

  _mCatalogPromise = (async () => {
    try {
      const settled = await Promise.allSettled([
        fetch('data/marmiton_catalog.json',  { cache: 'no-cache' }).then(r => r.ok ? r.json() : null),
        fetch('data/750g_catalog.json',      { cache: 'no-cache' }).then(r => r.ok ? r.json() : null),
        fetch('data/cuisineaz_catalog.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null),
      ]);
      let catalog = [], updated = null;
      for (const r of settled) {
        if (r.status !== 'fulfilled' || !r.value) continue;
        catalog  = catalog.concat(r.value.customRecipes || r.value.catalog || []);
        if (!updated) updated = r.value.updated || null;
      }
      _mCatalog        = catalog;
      _mCatalogUpdated = updated;
      return _mCatalog;
    } catch {
      return null;
    } finally {
      _mCatalogPromise = null;
    }
  })();

  return _mCatalogPromise;
}

// Score de pertinence texte, titre dominant : un match dans le nom compte
// plus qu'un match perdu dans les ingrédients ou la description, pour éviter
// que la recherche élargie noie les vrais matchs de titre sous des faux
// positifs (ex: chercher "poulet" ne doit pas faire remonter en premier une
// salade qui en contient une trace au milieu de 15 ingrédients).
function _mTextScore(r, words) {
  const nameNorm = normIngredient(r.name);
  const ingNorm  = normIngredient((r.ingredients || []).join(' '));
  const descNorm = normIngredient(r.description || '');
  let score = 0;
  for (const w of words) {
    if (nameNorm.includes(w))      score += 3;
    else if (ingNorm.includes(w))  score += 1.5;
    else if (descNorm.includes(w)) score += 0.5;
  }
  return score;
}

function _mSearchCatalog(query, { category = null, diet = null, n = 12 } = {}) {
  if (!_mCatalog?.length) return [];
  const words = normIngredient(query).split(/\s+/).filter(w => w.length > 2);
  let base = category ? _mCatalog.filter(r => r.category === category) : _mCatalog;
  if (diet) base = base.filter(r => _mDietMatch(r, diet));
  // URL absolue telle quelle (pas de strip conditionnel à MARMITON_BASE) —
  // un résultat catalogue peut venir de marmiton.org, 750g.com ou
  // cuisineaz.com, et le strip d'origine ne s'appliquait qu'au premier,
  // laissant les deux autres avec leur URL complète : marmOpenUrl() y
  // re-préfixait MARMITON_BASE, produisant une URL cassée pour ces sources.
  if (!words.length) {
    return base.slice(0, n).map(r => ({ url: r.sourceUrl || '', name: r.name, detail: r }));
  }
  return base
    .map(r => ({ r, score: _mTextScore(r, words) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ r }) => ({ url: r.sourceUrl || '', name: r.name, detail: r }));
}

// ── Panel helpers ─────────────────────────────────────────────────────

async function openMarmitonPanel() {
  document.getElementById('marmiton-panel').style.display = 'flex';
  document.getElementById('marmiton-panel-overlay').style.display = 'block';
  document.getElementById('marmiton-results').innerHTML = '';
  setTimeout(() => document.getElementById('marmiton-query').focus(), 100);
  const tokenInput = document.getElementById('marm-gh-token');
  if (tokenInput) tokenInput.value = _mGhToken();
  _mGoalsHint();
  const cat = await _mLoadCatalog();
  const el = document.getElementById('marm-catalog-status');
  if (el) {
    const date = _mCatalogUpdated || 'jamais';
    el.textContent = cat?.length
      ? `📚 ${cat.length} recettes · mis à jour le ${date}`
      : '⚠ Catalogue vide — lance le workflow GitHub Actions';
  }
}

function closeMarmitonPanel() {
  document.getElementById('marmiton-panel').style.display = 'none';
  document.getElementById('marmiton-panel-overlay').style.display = 'none';
}

function _mSetStatus(html) {
  document.getElementById('marmiton-results').innerHTML = html;
}

function _mScoreBadge(pct) {
  const color = pct >= 75 ? '#4CAF50' : pct >= 40 ? '#FF9800' : '#9E9E9E';
  const label = pct >= 75 ? '🟢' : pct >= 40 ? '🟡' : '⚪';
  return `<span class="marm-score-badge" style="background:${color}">${label} ${pct}% stock</span>`;
}

function _mRenderResults(hits) {
  _mGoalsHint();
  if (!hits.length) {
    _mSetStatus('<div class="marm-empty">Aucun résultat trouvé.</div>');
    return;
  }
  _mResults = hits;
  const rows = hits.map((h, i) => {
    const score  = h.score;
    const time   = h.detail ? (h.detail.prepTime + h.detail.cookTime) : 0;
    const serves = h.detail?.servings;
    const goalBadge = h.detail?.id && typeof goalsBadgeHtml === 'function' ? goalsBadgeHtml(h.detail) : '';
    return `<div class="marm-hit" data-idx="${i}">
      <div class="marm-hit-info">
        <div class="marm-hit-name">${_esc(h.name || h.url.split('/').pop())}</div>
        <div class="marm-hit-meta">
          ${time   ? `⏱ ${time} min` : ''}
          ${serves ? `· 👤 ${serves} portion${serves > 1 ? 's' : ''}` : ''}
          ${score  ? _mScoreBadge(score.pct) : ''}
          ${goalBadge}
        </div>
      </div>
      <div class="marm-hit-btns">
        <button class="marm-btn-url" onclick="marmOpenUrl(${i})" title="Ouvrir dans l'import URL">🔗</button>
        <button class="marm-btn-import" onclick="marmImportHit(${i})" id="marm-btn-${i}">
          📥 Importer
        </button>
      </div>
    </div>`;
  }).join('');
  document.getElementById('marmiton-results').innerHTML = rows;
}

function _esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Search ────────────────────────────────────────────────────────────

async function marmSearch() {
  if (_mSearching) return;
  const query = document.getElementById('marmiton-query').value.trim();
  if (!query) return;
  const category = document.getElementById('marmiton-category').value;
  const diet     = document.getElementById('marmiton-diet')?.value || null;
  const sortBy   = document.getElementById('marmiton-sort')?.value || 'pertinence';

  _mSearching = true;
  _mSetStatus('<div class="marm-loading">⏳ Recherche en cours…</div>');

  try {
    // Recherche exclusivement dans le catalogue hors-ligne — aucune requête
    // vers un site externe (ni Marmiton ni un proxy CORS tiers). Si la
    // recette voulue n'y est pas encore, lance le workflow GitHub Actions
    // correspondant (liens en haut du panel) pour l'ajouter au catalogue.
    const catalog = await _mLoadCatalog();
    let hits = catalog?.length
      ? _mSearchCatalog(query, { category, diet, n: sortBy === 'stock' ? 30 : 12 })
      : [];
    const catalogHadMatches = hits.length > 0;
    hits = hits.map(h => ({
      ...h,
      score: h.detail?.ingredients ? _mScoreIngredients(h.detail.ingredients) : null,
    }));
    if (sortBy === 'stock') hits.sort((a, b) => (b.score?.pct || 0) - (a.score?.pct || 0));
    // Objectifs actifs : priment sur le tri choisi (même règle que la
    // grille/planificateur) — appliqué juste avant la coupe à 12 pour ne
    // pas perdre de candidats potentiellement mieux notés côté objectifs.
    hits = _mApplyGoals(hits);
    hits = hits.slice(0, 12);
    if (hits.length) { _mRenderResults(hits); return; }
    // Le catalogue avait des résultats mais le mode strict des objectifs
    // les a tous filtrés — à distinguer de "le catalogue n'a rien trouvé".
    if (catalogHadMatches) {
      _mSetStatus(`<div class="marm-empty">Le catalogue a des résultats pour "<em>${_esc(query)}</em>",
        mais aucun ne respecte tous tes objectifs nutritionnels actifs.<br>
        <small>Essaie d'assouplir tes objectifs (panel 🎯 Objectifs) ou désactive le mode strict.</small></div>`);
      return;
    }
    _mSetStatus(`<div class="marm-empty">Aucun résultat pour "<em>${_esc(query)}</em>" dans le catalogue hors-ligne.<br>
      <small>Lance une mise à jour du catalogue (🔄 ou les liens ↗ en haut) pour l'ajouter.</small></div>`);
  } catch (e) {
    _mSetStatus(`<div class="marm-error">❌ ${_esc(e.message)}<br>
      <small>Lance le workflow GitHub Actions pour générer le catalogue hors-ligne.</small></div>`);
  } finally {
    _mSearching = false;
  }
}

// ── Stock-based suggestions ────────────────────────────────────────────

async function marmStockSearch() {
  if (_mSearching) return;
  const tops = _mTopStockIngredients(5);
  if (!tops.length) {
    alert('Ton stock est vide — ajoute des ingrédients d\'abord.');
    return;
  }

  const diet = document.getElementById('marmiton-diet')?.value || null;

  _mSearching = true;
  document.getElementById('marmiton-query').value = tops.slice(0, 3).join(', ');
  _mSetStatus('<div class="marm-loading">⏳ Recherche de recettes basées sur ton stock…</div>');

  try {
    // Recherche exclusivement dans le catalogue hors-ligne (même règle que
    // marmSearch() — aucune requête vers un site externe).
    const catalog = await _mLoadCatalog();
    const seen = new Set();
    const allHits = [];
    if (catalog?.length) {
      for (const ing of tops) {
        for (const h of _mSearchCatalog(ing, { diet, n: 6 })) {
          if (!seen.has(h.name)) { seen.add(h.name); allHits.push(h); }
        }
      }
    }

    if (!allHits.length) {
      _mSetStatus('<div class="marm-empty">Aucun résultat pour ce stock dans le catalogue hors-ligne.</div>');
      return;
    }

    let scored = allHits
      .map(h => ({ ...h, score: _mScoreIngredients(h.detail?.ingredients) }))
      .sort((a, b) => b.score.pct - a.score.pct);
    scored = _mApplyGoals(scored);
    _mRenderResults(scored);
  } catch (e) {
    _mSetStatus(`<div class="marm-error">❌ ${_esc(e.message)}</div>`);
  } finally {
    _mSearching = false;
  }
}

// ── Import a result ───────────────────────────────────────────────────

async function marmImportHit(idx) {
  const hit = _mResults[idx];
  if (!hit) return;
  const btn = document.getElementById(`marm-btn-${idx}`);
  if (btn) { btn.disabled = true; btn.textContent = '⏳'; }

  try {
    // hit vient toujours du catalogue hors-ligne (_mSearchCatalog() renvoie
    // systématiquement un detail non-null) — plus de fallback vers une
    // requête live ici.
    const detail = hit.detail;

    // Build JSON-LD object compatible with the existing importer
    const ld = {
      '@type':            'Recipe',
      name:               detail.name,
      description:        detail.description,
      recipeIngredient:   detail.ingredients,
      recipeInstructions: (detail.steps || []).map(s => ({ '@type': 'HowToStep', text: s })),
      recipeYield:        String(detail.servings),
      prepTime:           `PT${detail.prepTime}M`,
      cookTime:           `PT${detail.cookTime}M`,
      url:                detail.sourceUrl,
      image:              detail.image || '',
    };

    const parsed = parseRecipeJsonLd(ld);
    closeMarmitonPanel();
    openImportPanel(parsed);
  } catch (e) {
    if (btn) { btn.disabled = false; btn.textContent = '📥 Importer'; }
    const fullUrl = hit.detail?.sourceUrl || hit.url;
    _mSetStatus(`<div class="marm-error">
      <strong>Import impossible</strong><br>
      <small>${e.message || 'Recette incomplète ou proxy bloqué.'}</small>
      <div class="marm-fallback-btns">
        <button onclick="navigator.clipboard?.writeText('${fullUrl}').then(()=>this.textContent='✅ Copié!')">
          📋 Copier l'URL
        </button>
        <button class="marm-btn-open" onclick="window.open('${fullUrl}', '_blank', 'noopener,noreferrer')">
          Ouvrir dans le navigateur ↗
        </button>
      </div>
      <small style="margin-top:6px;display:block">
        Copie l'URL → reviens dans l'app → "Importer une recette" → colle l'URL.<br>
        Ou mets à jour le catalogue (🔄) pour importer directement.
      </small>
    </div>`);
  }
}

// Open the recipe URL in the import URL panel (pre-filled)
function marmOpenUrl(idx) {
  const hit = _mResults[idx];
  if (!hit?.url) return;
  closeMarmitonPanel();
  _mOpenImportUrl(hit.url);
}

// Pré-remplit le panel d'import par URL sans lancer de requête — l'utilisateur
// doit cliquer lui-même sur "Importer" (même geste explicite que pour une URL
// collée à la main). Recherche/résultats restent 100% catalogue hors-ligne :
// ce bouton ne doit jamais déclencher de requête vers un site externe tout
// seul, seulement offrir un raccourci vers l'import manuel par URL existant.
function _mOpenImportUrl(url) {
  openImportUrlPanel();                           // ouvre et reset le champ
  const input = document.getElementById('import-url-input');
  if (input) input.value = url;                   // pré-remplit APRÈS le reset
}
