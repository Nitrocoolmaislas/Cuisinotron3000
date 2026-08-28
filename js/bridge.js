// ══════════════════════════════════════════════
//  BRIDGE — lookup FR → NL Colruyt
//  Les termes NL vivent désormais dans WHITELIST
//  (data/whitelist_canonique.js, champ `colruytTerms`) —
//  une seule table d'identité ingrédient, avec un champ
//  par fonction consommatrice (ciqual, colruytTerms, aliases).
//  Ce fichier ne contient plus que la logique de résolution.
//
//  Logique de lookup : bridgeLookup() / bridgeLookupFull() (bridgeWizard.js)
// ══════════════════════════════════════════════

// ─── Irréguliers — priorité absolue dans bridgeLookup ────────────────────────
// Exceptions linguistiques (pluriels en -x, ligatures) que la cascade
// morphologique de bridgeLookup() ne peut pas déduire par elle-même.
const IRREGULAR_FORMS = {
  // Pluriels en -eux/-aux
  'poireaux':       'poireau',
  'choux':          'chou',
  'choux fleurs':   'chou fleur',
  // Ligatures (normIngredient les corrige, mais IRREGULAR_FORMS sert de filet)
  'boeufs':         'boeuf',
  'ufs':            'oeuf',        // "œufs" si normIngredient rate la ligature
  'buf':            'boeuf',       // "bœuf" seul
  'buf hache':      'boeuf hache', // "bœuf haché"
  // Invariables en -x (protège contre strip /s$/ → noi / poi)
  'noix':           'noix',
  'pois':           'pois',
  // Cas où le parser remonte l'unité comme rawName
  'gousses':        'ail',
  'gousse':         'ail',
  // Pluriels irréguliers divers
  'oignons rouges': 'oignon rouge',
};

// ─── Variantes morphologiques (singulier/pluriel) d'un normKey ───────────────
function _bridgeVariants(normKey) {
  const out = new Set([normKey]);
  const s1 = normKey.replace(/s$/, '');
  if (s1 !== normKey) out.add(s1);
  out.add(normKey + 's');
  const words = normKey.split(' ');
  out.add(words.map(w => w.replace(/s$/, '')).join(' '));
  out.add(words.map(w => (w.endsWith('s') ? w : w + 's')).join(' '));
  out.add(words[0].replace(/s$/, ''));
  out.add(words[0]);
  return [...out];
}

// ─── Lookup avec fallbacks pluriels ──────────────────────────────────────────
// Cherche un normKey (ou une variante singulier/pluriel proche) parmi les
// clés canoniques WHITELIST, et retourne les colruytTerms de l'entrée
// trouvée. Ne suit PAS les `aliases` (qui regroupent des produits
// nutritionnellement proches mais distincts pour CIQUAL, ex: "nouilles"
// alias de "pates blanches") — seules les variantes morphologiques du
// même mot sont considérées, pour ne jamais chercher le mauvais produit
// sur Colruyt.
function bridgeLookup(normKey) {
  if (typeof whitelistEntry === 'undefined') return null;

  const canonical = IRREGULAR_FORMS[normKey];
  const start = canonical || normKey;

  for (const v of _bridgeVariants(start)) {
    const entry = whitelistEntry(v);
    if (entry?.colruytTerms) return entry.colruytTerms;
  }
  return null;
}
