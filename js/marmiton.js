// ══════════════════════════════════════════════════════════════════════
//  marmiton.js — Recherche & import Marmiton intégré
//  Dépend de : utils.js (normIngredient), stock.js (stock),
//              ingredientParser.js (parseIngredientString),
//              importer.js (openImportPanel)
// ══════════════════════════════════════════════════════════════════════

const MARMITON_BASE  = 'https://www.marmiton.org';
// Primary: allorigins passes headers more transparently than corsproxy.io
const MARMITON_CORS  = 'https://api.allorigins.win/raw?url=';
const MARMITON_CORS2 = 'https://corsproxy.io/?url=';

const MARMITON_CATS = {
  repas:     { label: 'Repas',        dt: 'platprincipal' },
  tartinade: { label: 'Tartinade',    dt: null            },
  petitdej:  { label: 'Petit-déj',    dt: null            },
  dessert:   { label: 'Dessert',      dt: 'dessert'       },
};

// ── HTTP ──────────────────────────────────────────────────────────────

async function _mFetch(url) {
  for (const proxy of [MARMITON_CORS, MARMITON_CORS2]) {
    try {
      const r = await fetch(proxy + encodeURIComponent(url), { cache: 'no-store' });
      if (r.ok) return r.text();
    } catch { /* try next proxy */ }
  }
  throw new Error(`Impossible de contacter Marmiton (proxies CORS indisponibles)`);
}

// Extract a readable name from a Marmiton recipe URL slug
// /recettes/recette_gateau-au-chocolat-fondant_12345.aspx → "Gateau au chocolat fondant"
function _mNameFromSlug(url) {
  const m = url.match(/recette_([^_]+(?:_[^_\d][^_]*)*)_\d/);
  if (!m) return '';
  return m[1].replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
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

// ── Search ────────────────────────────────────────────────────────────

async function _mSearch(query, { category = 'repas', noCat = false, n = 8 } = {}) {
  const cat = MARMITON_CATS[category] || MARMITON_CATS.repas;
  const params = new URLSearchParams({ aqt: query, sort: 'markdesc' });
  if (!noCat && cat.dt) params.set('dt', cat.dt);
  const url = `${MARMITON_BASE}/recettes/recherche.aspx?${params}`;

  const html = await _mFetch(url);
  const results = [];

  // Try __NEXT_DATA__ first (modern Marmiton React structure)
  const nd = _mNextData(html);
  if (nd) {
    const hits = nd?.props?.pageProps?.searchResults?.hits
              || nd?.props?.pageProps?.recipes
              || [];
    for (const h of hits) {
      let slug = h.urlFriendlyName || h.url || '';
      if (slug && !slug.startsWith('/')) slug = '/recettes/' + slug;
      if (slug) results.push({ url: slug, name: h.name || h.title || '' });
    }
  }

  // Fallback: parse anchor hrefs
  if (!results.length) {
    const seen = new Set();
    for (const m of html.matchAll(/href="(\/recettes\/recette_[^"?#]+)"/g)) {
      if (!seen.has(m[1])) { seen.add(m[1]); results.push({ url: m[1], name: '' }); }
    }
  }

  // Fill missing names from slug
  for (const r of results) {
    if (!r.name) r.name = _mNameFromSlug(r.url);
  }

  return results.slice(0, n * 3);
}

// ── Recipe detail ─────────────────────────────────────────────────────

async function _mGetRecipe(uri) {
  const url = MARMITON_BASE + (uri.startsWith('/') ? uri : '/' + uri);
  const html = await _mFetch(url);
  const ld   = _mJsonLd(html);
  if (!ld) throw new Error('Aucune donnée structurée trouvée sur cette page');

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
    const key = normIngredient(rawName);
    if (!key || key.length < 2) continue;
    if (stock[key]) { matched++; continue; }
    // substring fallback
    if (Object.keys(stock).some(k => k.length >= 3 && (k.includes(key) || key.includes(k))))
      matched++;
  }
  return { matched, total: ingredients.length, pct: Math.round(matched / ingredients.length * 100) };
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

let _mResults    = [];
let _mSearching  = false;

// ── Panel helpers ─────────────────────────────────────────────────────

function openMarmitonPanel() {
  document.getElementById('marmiton-panel').style.display = 'flex';
  document.getElementById('marmiton-panel-overlay').style.display = 'block';
  setTimeout(() => document.getElementById('marmiton-query').focus(), 100);
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
  if (!hits.length) {
    _mSetStatus('<div class="marm-empty">Aucun résultat trouvé.</div>');
    return;
  }
  _mResults = hits;
  const rows = hits.map((h, i) => {
    const score  = h.score;
    const time   = h.detail ? (h.detail.prepTime + h.detail.cookTime) : 0;
    const serves = h.detail?.servings;
    return `<div class="marm-hit" data-idx="${i}">
      <div class="marm-hit-info">
        <div class="marm-hit-name">${_esc(h.name || h.url.split('/').pop())}</div>
        <div class="marm-hit-meta">
          ${time   ? `⏱ ${time} min` : ''}
          ${serves ? `· 👤 ${serves} portion${serves > 1 ? 's' : ''}` : ''}
          ${score  ? _mScoreBadge(score.pct) : ''}
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

  _mSearching = true;
  _mSetStatus('<div class="marm-loading">⏳ Recherche en cours…</div>');

  try {
    const hits = await _mSearch(query, { category, n: 8 });
    if (!hits.length) {
      _mSetStatus(`<div class="marm-empty">Aucun résultat pour "<em>${_esc(query)}</em>".<br>
        <small>Vérifie que corsproxy.io est accessible depuis ton navigateur.</small></div>`);
      return;
    }
    _mRenderResults(hits);
  } catch (e) {
    _mSetStatus(`<div class="marm-error">❌ ${_esc(e.message)}<br>
      <small>Le proxy CORS (corsproxy.io) est peut-être temporairement indisponible.</small></div>`);
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

  _mSearching = true;
  document.getElementById('marmiton-query').value = tops.slice(0, 3).join(', ');
  _mSetStatus('<div class="marm-loading">⏳ Recherche de recettes basées sur ton stock…</div>');

  try {
    // Search all 4 ingredients IN PARALLEL
    const searchResults = await Promise.allSettled(
      tops.slice(0, 4).map(ing => _mSearch(ing, { noCat: true, n: 6 }))
    );
    const seen = new Set();
    const allHits = [];
    for (const r of searchResults) {
      if (r.status !== 'fulfilled') continue;
      for (const h of r.value) {
        if (!seen.has(h.url)) { seen.add(h.url); allHits.push(h); }
      }
    }

    if (!allHits.length) {
      _mSetStatus('<div class="marm-empty">Aucun résultat pour ce stock.</div>');
      return;
    }

    // Show results immediately (unscored) so the user isn't waiting
    _mRenderResults(allHits);

    // Then fetch all recipe details IN PARALLEL to get scores
    const limit = Math.min(allHits.length, 8);
    _mSetStatus(`<div class="marm-loading">⏳ Calcul du score stock… (${limit} recettes en parallèle)</div>`);

    const fetched = await Promise.allSettled(
      allHits.slice(0, limit).map(h => _mGetRecipe(h.url))
    );

    const scored = [];
    for (let i = 0; i < fetched.length; i++) {
      if (fetched[i].status !== 'fulfilled') continue;
      const detail = fetched[i].value;
      const score  = _mScoreIngredients(detail.ingredients);
      scored.push({ ...allHits[i], name: detail.name || allHits[i].name, detail, score });
    }

    if (scored.length) {
      scored.sort((a, b) => b.score.pct - a.score.pct);
      _mRenderResults(scored);
    } else {
      // Score fetch failed — keep the unscored results already shown
      _mRenderResults(allHits);
    }
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
    const detail = hit.detail || await _mGetRecipe(hit.url);

    // Build JSON-LD object compatible with the existing importer
    const ld = {
      '@type':            'Recipe',
      name:               detail.name,
      description:        detail.description,
      recipeIngredient:   detail.ingredients,
      recipeInstructions: detail.steps.map(s => ({ '@type': 'HowToStep', text: s })),
      recipeYield:        String(detail.servings),
      prepTime:           `PT${detail.prepTime}M`,
      cookTime:           `PT${detail.cookTime}M`,
      url:                detail.sourceUrl,
      image:              detail.image || '',
    };

    closeMarmitonPanel();
    openImportPanel(ld);
  } catch (e) {
    // JSON-LD fetch failed — fall back to the URL import panel with the URL pre-filled
    if (btn) { btn.disabled = false; btn.textContent = '📥 Importer'; }
    const fullUrl = MARMITON_BASE + hit.url;
    closeMarmitonPanel();
    _mOpenImportUrl(fullUrl);
  }
}

// Open the recipe URL in the import URL panel (pre-filled)
function marmOpenUrl(idx) {
  const hit = _mResults[idx];
  if (!hit) return;
  closeMarmitonPanel();
  _mOpenImportUrl(MARMITON_BASE + hit.url);
}

async function _mOpenImportUrl(url) {
  openImportUrlPanel();                           // ouvre et reset le champ
  const input = document.getElementById('import-url-input');
  if (input) input.value = url;                   // pré-remplit APRÈS le reset
  // Lance l'import proxy automatiquement — si ça marche l'utilisateur ne voit pas ce panneau
  await importFromUrl();
}
