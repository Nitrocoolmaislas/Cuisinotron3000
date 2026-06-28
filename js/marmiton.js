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

const MARMITON_CATS = {
  repas:     { label: 'Repas',        dt: 'platprincipal' },
  tartinade: { label: 'Tartinade',    dt: null            },
  petitdej:  { label: 'Petit-déj',    dt: null            },
  dessert:   { label: 'Dessert',      dt: 'dessert'       },
};

// ── HTTP ──────────────────────────────────────────────────────────────

async function _mFetch(url) {
  for (const proxy of _M_PROXIES) {
    try {
      const r = await fetch(proxy + encodeURIComponent(url), { cache: 'no-store' });
      if (!r.ok) continue;
      const html = await r.text();
      // Reject bot-detection / consent pages (no useful content)
      if (html.length < 2000 || (!html.includes('marmiton') && !html.includes('recette'))) continue;
      // Reject consent/captcha pages — valid pages always have structured data
      if (!html.includes('__NEXT_DATA__') && !html.includes('application/ld+json')) continue;
      return html;
    } catch { /* try next proxy */ }
  }
  throw new Error('Proxies CORS indisponibles — Marmiton bloque les requêtes automatiques');
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
      if (!slug) continue;
      // Extract partial detail when available (avoids fetching individual pages)
      const ings = h.ingredients || h.recipeIngredient || [];
      const detail = ings.length ? {
        name: h.name || h.title || '',
        ingredients: ings.map(i => String(i.name||i).trim()).filter(Boolean),
        steps: [], description: '', prepTime: h.prepTime||0,
        cookTime: h.cookTime||0, servings: parseInt(h.recipeYield)||2,
        sourceUrl: MARMITON_BASE + slug, image: h.image||h.mainImage||'',
      } : null;
      results.push({ url: slug, name: h.name || h.title || '', detail });
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

async function _mLoadCatalog() {
  if (_mCatalog) return _mCatalog;
  try {
    const settled = await Promise.allSettled([
      fetch('data/marmiton_catalog.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null),
      fetch('data/750g_catalog.json',     { cache: 'no-cache' }).then(r => r.ok ? r.json() : null),
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
  } catch { return null; }
}

function _mSearchCatalog(query, { category = null, n = 12 } = {}) {
  if (!_mCatalog?.length) return [];
  const words = normIngredient(query).split(/\s+/).filter(w => w.length > 2);
  const base = category ? _mCatalog.filter(r => r.category === category) : _mCatalog;
  if (!words.length) {
    return base.slice(0, n).map(r => ({ url: (r.sourceUrl || '').replace(MARMITON_BASE, ''), name: r.name, detail: r }));
  }
  return base
    .map(r => {
      const norm = normIngredient(r.name);
      const score = words.filter(w => norm.includes(w)).length / words.length;
      return { r, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map(({ r }) => ({ url: (r.sourceUrl || '').replace(MARMITON_BASE, ''), name: r.name, detail: r }));
}

// ── Panel helpers ─────────────────────────────────────────────────────

async function openMarmitonPanel() {
  document.getElementById('marmiton-panel').style.display = 'flex';
  document.getElementById('marmiton-panel-overlay').style.display = 'block';
  document.getElementById('marmiton-results').innerHTML = '';
  setTimeout(() => document.getElementById('marmiton-query').focus(), 100);
  const tokenInput = document.getElementById('marm-gh-token');
  if (tokenInput) tokenInput.value = _mGhToken();
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
    // Try static catalog first (instant, no proxy needed)
    const catalog = await _mLoadCatalog();
    if (catalog?.length) {
      const hits = _mSearchCatalog(query, { category, n: 12 });
      if (hits.length) { _mRenderResults(hits); return; }
    }
    // Fallback: CORS proxy (may be blocked by Marmiton bot detection)
    const hits = await _mSearch(query, { category, n: 8 });
    if (!hits.length) {
      _mSetStatus(`<div class="marm-empty">Aucun résultat pour "<em>${_esc(query)}</em>".<br>
        <small>Le catalogue ne contient pas encore cette recette.</small></div>`);
      return;
    }
    _mRenderResults(hits);
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

  _mSearching = true;
  document.getElementById('marmiton-query').value = tops.slice(0, 3).join(', ');
  _mSetStatus('<div class="marm-loading">⏳ Recherche de recettes basées sur ton stock…</div>');

  try {
    // Try static catalog first (instant, no proxy needed)
    const catalog = await _mLoadCatalog();
    if (catalog?.length) {
      const seen = new Set();
      const allHits = [];
      for (const ing of tops) {
        for (const h of _mSearchCatalog(ing, { n: 6 })) {
          if (!seen.has(h.name)) { seen.add(h.name); allHits.push(h); }
        }
      }
      if (allHits.length) {
        const scored = allHits
          .map(h => ({ ...h, score: _mScoreIngredients(h.detail?.ingredients) }))
          .sort((a, b) => b.score.pct - a.score.pct);
        _mRenderResults(scored);
        return;
      }
    }

    // Fallback: CORS proxy search
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
    const fullUrl = hit.detail?.sourceUrl || (hit.url.startsWith('http') ? hit.url : MARMITON_BASE + hit.url);
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
