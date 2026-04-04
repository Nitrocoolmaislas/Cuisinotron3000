// ══════════════════════════════════════════════
//  UTILS — fonctions partagées
// ══════════════════════════════════════════════

const ALL_UNITS = ['', 'g', 'kg', 'ml', 'cl', 'L', 'càc', 'càs', 'conserve', 'boîte',
                   'sachet', 'gousse', 'brin', 'feuille', 'pot', 'verre', 'pièce'];

function escapeAttr(str) {
  return (str || '').replace(/'/g, '&#39;').replace(/"/g, '&quot;');
}

function unitOptions(selected) {
  return ALL_UNITS.map(u =>
    `<option value="${u}" ${u === (selected || '') ? 'selected' : ''}>${u || '—'}</option>`
  ).join('');
}

// ── Normalisation pour déduplication et matching ──
function normIngredient(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// ══════════════════════════════════════════════
//  CANONICAL MAP
//  Résout les variantes d'un ingrédient vers :
//    - un nom canonique (clé stock unique)
//    - une conversion d'unité vague → quantité réelle
//
//  Format : normKey → { canonical, qty?, unit? }
//  Si qty/unit sont définis, ils remplacent ceux parsés
// ══════════════════════════════════════════════
const CANONICAL_MAP = {
  // ── Huile d'olive ──
  'filet d huile d olive':       { canonical: 'huile d olive',    qty: '15',  unit: 'ml' },
  'filets d huile d olive':      { canonical: 'huile d olive',    qty: '15',  unit: 'ml' },
  'trait d huile d olive':       { canonical: 'huile d olive',    qty: '5',   unit: 'ml' },
  'un peu d huile d olive':      { canonical: 'huile d olive',    qty: '10',  unit: 'ml' },
  'huile':                       { canonical: 'huile d olive',    qty: null,  unit: null },

  // ── Huile de sésame ──
  'filet d huile de sesame':     { canonical: 'huile de sesame',  qty: '5',   unit: 'ml' },
  'quelques gouttes d huile de sesame': { canonical: 'huile de sesame', qty: '3', unit: 'ml' },

  // ── Sel & poivre ──
  'sel et poivre':               { canonical: 'sel',              qty: null,  unit: null },
  'sel poivre':                  { canonical: 'sel',              qty: null,  unit: null },

  // ── Ail ──
  'ail hache':                   { canonical: 'ail',              qty: null,  unit: null },
  'gousses d ail hachees':       { canonical: 'ail',              qty: null,  unit: null },
  'gousse d ail hachee':         { canonical: 'ail',              qty: null,  unit: null },

  // ── Citron ──
  'citron':                      { canonical: 'citron',           qty: null,  unit: null },
  'jus de citron':               { canonical: 'citron',           qty: null,  unit: null },
  'jus d un citron':             { canonical: 'citron',           qty: '1',   unit: 'pièce' },
  'jus d 0 5 citron':            { canonical: 'citron',           qty: '0.5', unit: 'pièce' },

  // ── Fromage frais ──
  'fromage frais aux fines herbes': { canonical: 'fromage frais', qty: null,  unit: null },
  'fromage frais nature':        { canonical: 'fromage frais',    qty: null,  unit: null },

  // ── Lait ──
  'lait de soja ou de vache':    { canonical: 'lait',             qty: null,  unit: null },
  'lait vegetal ou de vache':    { canonical: 'lait',             qty: null,  unit: null },

  // ── Miel / sucrant ──
  'miel ou sirop d agave':       { canonical: 'miel',             qty: null,  unit: null },

  // ── Épinards ──
  'epinards frais':              { canonical: 'epinards',         qty: null,  unit: null },
  'epinards surgeles':           { canonical: 'epinards',         qty: null,  unit: null },

  // ── Champignons ──
  'champignons de paris':        { canonical: 'champignons',      qty: null,  unit: null },
  'champignons shiitake':        { canonical: 'champignons',      qty: null,  unit: null },

  // ── Tomates ──
  'tomates en des':              { canonical: 'tomates concassees', qty: null, unit: null },
  'conserve de tomates en des':  { canonical: 'tomates concassees', qty: '400', unit: 'g' },
  'tomates cerises':             { canonical: 'tomates cerises',  qty: null,  unit: null },

  // ── Bouillon ──
  'bouillon de legumes':         { canonical: 'bouillon',         qty: null,  unit: null },
  'bouillon de poulet':          { canonical: 'bouillon',         qty: null,  unit: null },
  'cube de bouillon':            { canonical: 'bouillon',         qty: null,  unit: null },

  // ── Herbes & épices vagues ──
  'herbes de provence':          { canonical: 'herbes sechees',   qty: null,  unit: null },
  'fines herbes':                { canonical: 'herbes sechees',   qty: null,  unit: null },
  'melange d epices a chili':    { canonical: 'epices chili',     qty: null,  unit: null },
  'epices a chili':              { canonical: 'epices chili',     qty: null,  unit: null },
};

// ── Conversions d'unités vagues → ml/g ──
const VAGUE_UNIT_CONVERSIONS = {
  'filet':  { qty: 15, unit: 'ml' },
  'trait':  { qty: 5,  unit: 'ml' },
  'pincee': { qty: 2,  unit: 'g'  },
  'peu':    { qty: 10, unit: 'ml' },
};

// ══════════════════════════════════════════════
//  canonicalize — résout nom + unité vague
//  Entrée  : { name, qty, unit } depuis parseIngredient
//  Sortie  : { name, qty, unit } canonicalisés
// ══════════════════════════════════════════════
function canonicalize(parsed) {
  const key = normIngredient(parsed.name);

  // 1. Lookup dans CANONICAL_MAP
  const canon = CANONICAL_MAP[key];
  if (canon) {
    return {
      name: canon.canonical,
      qty:  canon.qty  !== null ? (canon.qty  ?? parsed.qty)  : parsed.qty,
      unit: canon.unit !== null ? (canon.unit ?? parsed.unit) : parsed.unit,
    };
  }

  // 2. Conversion d'unité vague si pas de canonical
  if (parsed.unit && VAGUE_UNIT_CONVERSIONS[parsed.unit]) {
    const conv = VAGUE_UNIT_CONVERSIONS[parsed.unit];
    return {
      name: parsed.name,
      qty:  parsed.qty ? String(parseFloat(parsed.qty) * conv.qty) : String(conv.qty),
      unit: conv.unit,
    };
  }

  return parsed;
}

// ── Parse un ingrédient brut → { name, unit, qty } canonicalisés ──
function parseIngredient(raw) {
  const UNITS = [
    { re: /c\.?\s*(?:uillères?)?\s*à\s*soupe|càs/i, label: 'càs' },
    { re: /c\.?\s*(?:uillères?)?\s*à\s*caf[eé]|càc/i, label: 'càc' },
    { re: /conserves?/i,  label: 'conserve' },
    { re: /boîtes?/i,     label: 'boîte' },
    { re: /sachets?/i,    label: 'sachet' },
    { re: /gousses?/i,    label: 'gousse' },
    { re: /brins?/i,      label: 'brin' },
    { re: /feuilles?/i,   label: 'feuille' },
    { re: /filets?/i,     label: 'filet' },
    { re: /pots?/i,       label: 'pot' },
    { re: /verres?/i,     label: 'verre' },
    { re: /traits?/i,     label: 'trait' },
    { re: /pincée?s?/i,   label: 'pincee' },
    { re: /\bkg\b/i,      label: 'kg' },
    { re: /\bml\b/i,      label: 'ml' },
    { re: /\bcl\b/i,      label: 'cl' },
    { re: /\bL\b/,        label: 'L'  },
    { re: /\bg\b/i,       label: 'g'  },
  ];

  function cleanName(n) {
    return n
      .replace(/^(quelques?\s+|un\s+peu\s+de\s+|un\s+filet\s+de\s+|un\s+trait\s+de\s+)/i, '')
      .replace(/^(les?\s+|la\s+|l['']\s*|une?\s+|des?\s+|du\s+|de\s+(?:la\s+|l['']\s*)?)/i, '')
      .replace(/\bjus\s+d[e'']\s*/i, '')
      .replace(/^à\s+[\d.,]+\s+\S+\s+de\s+/i, '')
      .replace(/^à\s+[\d.,]+\s+/i, '')
      .replace(/^[\d.,]+\s+/, '')
      .replace(/\(.*?\)/g, '')
      .replace(/,\s*(haché[e]?s?|émincé[e]?s?|pressé[e]?s?|coupé[e]?s?|râpé[e]?s?|grillé[e]?s?|écrasé[e]?s?|taillé[e]?s?|tranché[e]?s?|fondu[e]?s?|demi[e]?s?|frais|fraîche[s]?|mûr[e]?s?|nature|bio|cuit[e]?s?|congelé[e]?s?).*$/i, '')
      .replace(/\s+(haché[e]?s?|émincé[e]?s?|pressé[e]?s?|râpé[e]?s?|grillé[e]?s?|écrasé[e]?s?|tranché[e]?s?)$/i, '')
      .replace(/,.*$/, '')
      .replace(/\b(facultatif|optionnel|ou\b.*|et\b.*|selon\b.*|si\b.*|type\b.*)\b.*$/i, '')
      .replace(/\s+/g, ' ').trim()
      .toLowerCase();
  }

  let s = raw.trim()
    .replace(/½/g, '0.5').replace(/¼/g, '0.25').replace(/¾/g, '0.75')
    .replace(/⅓/g, '0.33').replace(/⅔/g, '0.67');

  s = s.replace(/^quelques?\s+/i, '');

  let parsed;

  // Range qty: "5 à 6" ou "5-6"
  const rangeMatch = s.match(/^([\d.,]+)\s*(?:à|-|–)\s*([\d.,]+)\s*/);
  if (rangeMatch) {
    const qty = `${rangeMatch[1]}-${rangeMatch[2]}`;
    let rest = s.slice(rangeMatch[0].length).trim();
    let unit = '';
    for (const u of UNITS) {
      const m = rest.match(new RegExp('^(' + u.re.source + ')[\\s.]*', 'i'));
      if (m) { unit = u.label; rest = rest.slice(m[0].length).trim(); break; }
    }
    rest = rest.replace(/^d[e'']\s*/i, '').trim();
    parsed = { qty, unit, name: cleanName(rest) };
  } else {
    // Qty simple
    const qtyMatch = s.match(/^([\d.,]+)\s*/);
    if (!qtyMatch) {
      parsed = { qty: '', unit: '', name: cleanName(s) };
    } else {
      const qty = qtyMatch[1].trim();
      let rest = s.slice(qtyMatch[0].length).trim();
      let unit = '';
      for (const u of UNITS) {
        const m = rest.match(new RegExp('^(' + u.re.source + ')[\\s.]*', 'i'));
        if (m) { unit = u.label; rest = rest.slice(m[0].length).trim(); break; }
      }
      rest = rest.replace(/^d[e'']\s*/i, '').trim();
      parsed = { qty, unit, name: cleanName(rest) };
    }
  }

  // Canonicalisation finale
  return canonicalize(parsed);
}
