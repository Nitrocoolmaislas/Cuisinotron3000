// ══════════════════════════════════════════════
//  BILL SCANNER — OCR ticket de caisse Colruyt
//  Dépend de : utils.js  (normIngredient, unitOptions),
//              stock.js  (stock, saveStock, renderStock, showToast)
// ══════════════════════════════════════════════

let _bsItems = [];

// Tesseract.js is loaded statically via js/vendor/tesseract.min.js.
// Paths must be absolute so the Web Worker resolves them correctly
// regardless of the page URL depth.
const _bsRoot = window.location.href.replace(/[^/]*$/, '');
const _TESS_OPTS = {
  workerPath: _bsRoot + 'js/vendor/tesseract.worker.min.js',
  corePath:   _bsRoot + 'js/vendor/',
  langPath:   _bsRoot + 'data/tessdata/',
};

// ── PLU IndexedDB ─────────────────────────────────────────────────────────────

async function _pluDbOpen() {
  return idb.openDB('cuisinotron-plu', 1, {
    upgrade(db) { db.createObjectStore('plu', { keyPath: 'plu' }); }
  });
}

async function _pluUpsert(item, dateStr) {
  try {
    const db = await _pluDbOpen();
    const existing = await db.get('plu', item.plu);

    if (!existing) {
      await db.put('plu', {
        plu:          item.plu,
        denomination: item.denomination,
        unitPrice:    item.unitPrice,
        lastQty:      item.qty,
        lastTotal:    item.total,
        lastSeen:     dateStr,
        priceHistory: [{ date: dateStr, unitPrice: item.unitPrice }]
      });
      return 'new';
    }

    let status = 'unchanged';
    const updated = { ...existing, lastQty: item.qty, lastTotal: item.total, lastSeen: dateStr };

    if (existing.denomination.toLowerCase().trim() !== item.denomination.toLowerCase().trim()) {
      updated.denomination = item.denomination;
      status = 'denomination_changed';
    }

    if (Math.abs(existing.unitPrice - item.unitPrice) > 0.001) {
      updated.unitPrice    = item.unitPrice;
      updated.priceHistory = [...(existing.priceHistory || []), { date: dateStr, unitPrice: item.unitPrice }];
      if (status === 'unchanged') status = 'price_changed';
    }

    await db.put('plu', updated);
    return status;
  } catch (e) {
    console.warn('[BillScanner] PLU DB error:', e.message);
    return 'unknown';
  }
}

// ── Panel ─────────────────────────────────────────────────────────────────────

function openBillScanner() {
  _bsItems = [];
  document.getElementById('bs-upload-zone').style.display  = '';
  document.getElementById('bs-progress').style.display     = 'none';
  document.getElementById('bs-results').style.display      = 'none';
  document.getElementById('bs-footer').style.display       = 'none';
  const preview = document.getElementById('bs-preview');
  preview.style.display = 'none';
  preview.src = '';
  document.getElementById('bs-file-input').value = '';
  document.getElementById('bill-scanner-panel').classList.add('open');
  document.getElementById('bill-scanner-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBillScanner() {
  document.getElementById('bill-scanner-panel').classList.remove('open');
  document.getElementById('bill-scanner-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeBillScanner(); });

// ── OCR ───────────────────────────────────────────────────────────────────────

async function handleBillImage(file) {
  if (!file) return;

  const preview = document.getElementById('bs-preview');
  preview.src = URL.createObjectURL(file);
  preview.style.display = 'block';

  document.getElementById('bs-upload-zone').style.display = 'none';
  document.getElementById('bs-progress').style.display    = '';
  document.getElementById('bs-results').style.display     = 'none';
  document.getElementById('bs-footer').style.display      = 'none';

  const fillEl  = document.getElementById('bs-progress-fill');
  const labelEl = document.getElementById('bs-progress-label');
  fillEl.style.width = '0';

  try {
    const { data: { text } } = await Tesseract.recognize(file, 'fra', {
      ..._TESS_OPTS,
      logger(m) {
        const pct = Math.round((m.progress || 0) * 100);
        const labels = {
          'loading tesseract core':       `Chargement moteur OCR… ${pct}%`,
          'initializing tesseract':       `Initialisation… ${pct}%`,
          'loading language traineddata': `Chargement modèle français… ${pct}%`,
          'initializing api':             `Préparation…`,
          'recognizing text':             `Reconnaissance… ${pct}%`,
        };
        labelEl.textContent = labels[m.status] || m.status;
        if (pct > 0) fillEl.style.width = pct + '%';
      }
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const parsed  = _parseColruytText(text);

    _bsItems = await Promise.all(
      parsed.map(async item => ({
        ...item,
        pluStatus: await _pluUpsert(item, dateStr)
      }))
    );

    document.getElementById('bs-progress').style.display = 'none';

    if (_bsItems.length === 0) {
      document.getElementById('bs-progress').style.display = '';
      fillEl.style.display = 'none';
      const rawId = 'bs-raw-' + Date.now();
      labelEl.innerHTML = `Aucun article détecté.<br>
        <details style="text-align:left;margin-top:8px;font-size:0.75rem;cursor:pointer">
          <summary style="color:var(--sage)">Voir le texte lu par l'OCR</summary>
          <button onclick="navigator.clipboard.writeText(document.getElementById('${rawId}').textContent).then(()=>this.textContent='✅ Copié').catch(()=>this.textContent='❌')"
            style="margin:6px 0;padding:4px 10px;font-size:0.75rem;border:1px solid var(--border);
            border-radius:6px;background:var(--cream);cursor:pointer;font-family:'DM Sans',sans-serif">
            📋 Copier le texte
          </button>
          <pre id="${rawId}" style="white-space:pre-wrap;max-height:180px;overflow:auto;margin-top:4px;
            font-size:0.68rem;background:var(--cream);padding:8px;border-radius:6px;
            border:1px solid var(--border)">${_bsEsc(_bsRawText || '(vide)')}</pre>
        </details>`;
      return;
    }

    _renderBsResults(_bsItems);
    document.getElementById('bs-results').style.display = '';
    document.getElementById('bs-footer').style.display  = '';

  } catch (err) {
    document.getElementById('bs-progress').style.display = '';
    const msg = err?.message || (typeof err === 'string' ? err : JSON.stringify(err));
    labelEl.textContent = `Erreur OCR : ${msg || 'échec inattendu — voir console'}`;
    console.error('[BillScanner] OCR error:', err);
  }
}

// ── Parsing ───────────────────────────────────────────────────────────────────

const _BS_SKIP = /TOTAL|SUBTOTAL|BTW|TVA|MANAGER|COLRUYT|DATUM|TICKET|DANK\s*U|AANTAL|KORTING|COUPON|PUNTEN|KAART|BETAALD|TERUG|VIDANGE|MARCHANDISE|PAYER|BANCONTACT|EDENRED|SWIFT|IBAN|RPM|T[EÉ]L|N°\.ART|D[EÉ]NOM|VOTRE|CAISSIER|HEURES|OUVERTURE|CONDITIONS|QUALIT[EÉ]/i;

let _bsRawText = '';

function _cleanOcrLine(line) {
  return line
    .replace(/^[\s\\|/]+/, '')   // strip leading \| / artefacts (table borders)
    .replace(/[|/]/g, ' ')        // remaining | and / → space (e.g. 27227IBONI → handled below)
    .replace(/[\s.,|]+$/, '')     // strip trailing noise
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function _parseReceiptLine(line) {
  const s = _cleanOcrLine(line);
  if (s.length < 5) return null;

  // PLU (3-6 digits) near the start; [I]? handles "27227IBONI" where OCR reads border as I
  const pluM = s.match(/^[A-Za-z]?\s*(\d{3,6})[I]?\s*(.{2,})/);
  if (!pluM) return null;

  const plu = pluM[1];
  let   rest = pluM[2];

  // Strip rightmost price (X,XX or X.XX) from a string
  const stripPrice = str => {
    const m = str.match(/\s+(\d{1,4}[,\.]\d{2})\s*$/);
    return m
      ? { val: parseFloat(m[1].replace(',', '.')), str: str.slice(0, str.length - m[0].length).trim() }
      : null;
  };

  // Prices and qty are optional — OCR from a photo may not preserve column spacing
  let total = null, unitPrice = null, qty = 1;
  const p1 = stripPrice(rest);
  if (p1) { total     = p1.val; rest = p1.str; }
  const p2 = stripPrice(rest);
  if (p2) { unitPrice = p2.val; rest = p2.str; }
  const qtyM = rest.match(/\s+(\d{1,3})\s*$/);
  if (qtyM) { qty = parseInt(qtyM[1], 10); rest = rest.slice(0, rest.length - qtyM[0].length).trim(); }

  const denomination = rest.trim();
  if (denomination.length < 2) return null;

  const pkg       = _extractPackageSize(denomination);
  const stockQty  = pkg ? +(pkg.qty * qty).toFixed(1) : qty;
  const stockUnit = pkg ? pkg.unit : '';
  const stockName = _denomToStockName(denomination);

  return { plu, denomination, qty, unitPrice, total, stockName, stockQty, stockUnit };
}

function _parseColruytText(rawText) {
  _bsRawText = rawText;
  return rawText
    .split('\n')
    .filter(l => /[a-zA-Z]/.test(l) && !_BS_SKIP.test(l))
    .map(_parseReceiptLine)
    .filter(Boolean);
}

function _extractPackageSize(denom) {
  const m = denom.match(/\b(\d+(?:[,\.]\d+)?)\s*(g|kg|ml|cl|l)\b/i);
  if (!m) return null;
  let qty      = parseFloat(m[1].replace(',', '.'));
  const unit   = m[2].toLowerCase();
  if (unit === 'kg') return { qty: qty * 1000, unit: 'g'  };
  if (unit === 'cl') return { qty: qty * 10,   unit: 'ml' };
  if (unit === 'l')  return { qty: qty * 1000, unit: 'ml' };
  return { qty, unit };
}

function _denomToStockName(denom) {
  const s = denom
    .replace(/\bSG\b/g, '')
    .replace(/\b\d+[,.]?\d*\s*(?:g|kg|ml|cl|l|pcs?)\b/gi, '')
    .replace(/^(?:[A-Z][A-Z0-9'&.]*\s+)+/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .toLowerCase();
  return s || denom.toLowerCase().trim();
}

// ── Review UI ─────────────────────────────────────────────────────────────────

const _BS_BADGES = {
  new:                  ['bs-badge-new',   '🆕 Nouveau'],
  unchanged:            ['bs-badge-ok',    '✅ Connu'],
  price_changed:        ['bs-badge-price', '💰 Prix modifié'],
  denomination_changed: ['bs-badge-warn',  '⚠️ Nom modifié'],
  unknown:              ['bs-badge-grey',  '?']
};

function _bsEsc(s) {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function _renderBsResults(items) {
  document.getElementById('bs-results-count').textContent =
    `${items.length} article${items.length > 1 ? 's' : ''} détecté${items.length > 1 ? 's' : ''}`;

  document.getElementById('bs-results-table').innerHTML = items.map((it, i) => {
    const [cls, label] = _BS_BADGES[it.pluStatus] || _BS_BADGES.unknown;
    const inStock = normIngredient(it.stockName) in stock;
    return `
    <div class="bs-row" id="bs-row-${i}">
      <label class="bs-check-wrap" title="${inStock ? 'Déjà en stock' : 'Ajouter au stock'}">
        <input type="checkbox" class="bs-check" checked
               onchange="document.getElementById('bs-row-${i}').style.opacity=this.checked?'':'0.4'">
      </label>
      <div class="bs-row-body">
        <div class="bs-receipt-line">
          <span class="bs-plu">#${_bsEsc(it.plu)}</span>
          <span class="bs-denom" title="${_bsEsc(it.denomination)}">${_bsEsc(it.denomination)}</span>
          <span class="bs-receipt-qty">${it.unitPrice != null ? `${it.qty} × ${it.unitPrice.toFixed(2).replace('.',',')} € = ${it.total.toFixed(2).replace('.',',')} €` : `qté : ${it.qty}`}</span>
          <span class="bs-badge ${cls}">${label}</span>
          ${inStock ? '<span class="bs-badge bs-badge-instock">📦 En stock</span>' : ''}
        </div>
        <div class="bs-stock-line">
          <span class="bs-stock-arrow">→</span>
          <input class="bs-stock-name" id="bs-sn-${i}" value="${_bsEsc(it.stockName)}" placeholder="Ingrédient…">
          <input type="number"  class="bs-stock-qty"  id="bs-sq-${i}" value="${it.stockQty}" min="0" step="any">
          <select class="bs-stock-unit" id="bs-su-${i}">${unitOptions(it.stockUnit)}</select>
        </div>
      </div>
    </div>`;
  }).join('');
}

function bsToggleAll(checked) {
  document.querySelectorAll('.bs-check').forEach((cb, i) => {
    cb.checked = checked;
    const row = document.getElementById(`bs-row-${i}`);
    if (row) row.style.opacity = checked ? '' : '0.4';
  });
}

// ── Confirmer ─────────────────────────────────────────────────────────────────

function confirmBillItems() {
  const checks = document.querySelectorAll('.bs-check');
  let added = 0;
  checks.forEach((cb, i) => {
    if (!cb.checked) return;
    const name = (document.getElementById(`bs-sn-${i}`)?.value || '').trim();
    const qty  = parseFloat(document.getElementById(`bs-sq-${i}`)?.value) || 0;
    const unit = document.getElementById(`bs-su-${i}`)?.value || '';
    if (!name) return;
    const key = normIngredient(name);
    if (!key) return;
    if (key in stock) {
      stock[key].qty = (stock[key].qty || 0) + qty;
    } else {
      stock[key] = { name, qty, unit };
    }
    added++;
  });

  if (added > 0) {
    saveStock();
    renderStock();
    showToast(`✅ ${added} article${added > 1 ? 's' : ''} ajouté${added > 1 ? 's' : ''} au stock`);
  }
  closeBillScanner();
}
