// ══════════════════════════════════════════════
//  UTILS — fonctions partagées
// ══════════════════════════════════════════════

const ALL_UNITS = ['', 'g', 'kg', 'ml', 'cl', 'L', 'càc', 'càs', 'conserve', 'boîte',
                   'sachet', 'gousse', 'brin', 'feuille', 'filet', 'pot', 'verre', 'trait', 'pièce'];

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

// ── Parse un ingrédient brut → { name, unit, qty } ──
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
    return { qty, unit, name: cleanName(rest) };
  }

  // Qty simple
  const qtyMatch = s.match(/^([\d.,]+)\s*/);
  if (!qtyMatch) return { qty: '', unit: '', name: cleanName(s) };

  const qty = qtyMatch[1].trim();
  let rest = s.slice(qtyMatch[0].length).trim();
  let unit = '';
  for (const u of UNITS) {
    const m = rest.match(new RegExp('^(' + u.re.source + ')[\\s.]*', 'i'));
    if (m) { unit = u.label; rest = rest.slice(m[0].length).trim(); break; }
  }
  rest = rest.replace(/^d[e'']\s*/i, '').trim();
  return { qty, unit, name: cleanName(rest) };
}
