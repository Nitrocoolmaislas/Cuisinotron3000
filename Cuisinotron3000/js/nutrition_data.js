// ══════════════════════════════════════════════
//  DONNÉES NUTRITIONNELLES — CIQUAL / USDA
//  Source : Table CIQUAL (Anses) + USDA FoodData
//  Toutes les valeurs sont pour 100g de produit brut
//  defaultWeight = poids en grammes d'une "pièce" ou portion sans unité
// ══════════════════════════════════════════════

const NUTRITION_DATA = {

  // ── Légumes ──
  'champignons de paris':   { kcal:22,  p:3.1,  c:2.8,  f:0.3,  fb:1.0,  defaultWeight:200  },
  'epinards frais':         { kcal:23,  p:2.9,  c:1.4,  f:0.4,  fb:2.2,  defaultWeight:150  },
  'epinards':               { kcal:23,  p:2.9,  c:1.4,  f:0.4,  fb:2.2,  defaultWeight:150  },
  'courgette':              { kcal:17,  p:1.2,  c:2.2,  f:0.3,  fb:1.0,  defaultWeight:200  },
  'courge spaghetti':       { kcal:31,  p:0.7,  c:7.0,  f:0.5,  fb:1.5,  defaultWeight:600  },
  'butternut':              { kcal:45,  p:1.0,  c:10.0, f:0.1,  fb:1.5,  defaultWeight:700  },
  'poivron rouge':          { kcal:31,  p:1.0,  c:6.0,  f:0.3,  fb:2.1,  defaultWeight:150  },
  'poivrons rouges':        { kcal:31,  p:1.0,  c:6.0,  f:0.3,  fb:2.1,  defaultWeight:150  },
  'tomate':                 { kcal:18,  p:0.9,  c:2.9,  f:0.2,  fb:1.2,  defaultWeight:120  },
  'tomates en des':         { kcal:18,  p:0.9,  c:2.9,  f:0.2,  fb:1.2,  defaultWeight:400  },
  'tomates cerises':        { kcal:18,  p:0.9,  c:2.9,  f:0.2,  fb:1.2,  defaultWeight:200  },
  'oignon blanc':           { kcal:40,  p:1.1,  c:8.0,  f:0.1,  fb:1.8,  defaultWeight:100  },
  'oignon rouge':           { kcal:40,  p:1.1,  c:8.0,  f:0.1,  fb:1.8,  defaultWeight:100  },
  'oignon':                 { kcal:40,  p:1.1,  c:8.0,  f:0.1,  fb:1.8,  defaultWeight:100  },
  'echalote':               { kcal:70,  p:2.5,  c:14.0, f:0.1,  fb:3.2,  defaultWeight:30   },
  'ail':                    { kcal:135, p:6.4,  c:21.0, f:0.5,  fb:4.7,  defaultWeight:6    },
  'gousses d ail':          { kcal:135, p:6.4,  c:21.0, f:0.5,  fb:4.7,  defaultWeight:6    },
  'gousse d ail':           { kcal:135, p:6.4,  c:21.0, f:0.5,  fb:4.7,  defaultWeight:6    },
  'brocoli':                { kcal:34,  p:2.8,  c:4.0,  f:0.4,  fb:2.6,  defaultWeight:300  },
  'concombre':              { kcal:12,  p:0.6,  c:1.8,  f:0.1,  fb:0.7,  defaultWeight:250  },
  'carotte':                { kcal:35,  p:0.8,  c:6.9,  f:0.3,  fb:3.0,  defaultWeight:100  },
  'carottes':               { kcal:35,  p:0.8,  c:6.9,  f:0.3,  fb:3.0,  defaultWeight:100  },
  'celeri':                 { kcal:16,  p:0.7,  c:2.0,  f:0.2,  fb:1.8,  defaultWeight:100  },
  'mais':                   { kcal:86,  p:3.3,  c:18.0, f:1.3,  fb:2.4,  defaultWeight:285  },
  'avocat':                 { kcal:160, p:2.0,  c:2.0,  f:15.0, fb:6.7,  defaultWeight:150  },
  'citron':                 { kcal:29,  p:1.1,  c:3.7,  f:0.3,  fb:1.7,  defaultWeight:100  },

  // ── Féculents & céréales ──
  'riz':                    { kcal:350, p:7.0,  c:77.0, f:0.6,  fb:0.4,  defaultWeight:80   },
  'quinoa':                 { kcal:368, p:14.0, c:60.0, f:6.0,  fb:7.0,  defaultWeight:80   },
  'lentilles vertes':       { kcal:353, p:24.0, c:56.0, f:1.1,  fb:12.0, defaultWeight:80   },
  'lentilles corail':       { kcal:353, p:24.0, c:56.0, f:1.1,  fb:11.0, defaultWeight:80   },
  'lentilles':              { kcal:353, p:24.0, c:56.0, f:1.1,  fb:12.0, defaultWeight:80   },
  'haricots rouges':        { kcal:127, p:8.7,  c:17.0, f:0.5,  fb:7.4,  defaultWeight:400  },
  'pois chiches':           { kcal:164, p:8.9,  c:21.0, f:2.6,  fb:8.0,  defaultWeight:400  },
  'pates':                  { kcal:358, p:13.0, c:69.0, f:1.5,  fb:2.5,  defaultWeight:80   },
  'flocons d avoine':       { kcal:372, p:13.0, c:58.0, f:7.0,  fb:10.0, defaultWeight:50   },
  'nouilles':               { kcal:358, p:11.0, c:71.0, f:1.5,  fb:2.0,  defaultWeight:80   },
  'pain de mie':            { kcal:265, p:8.0,  c:50.0, f:3.5,  fb:3.0,  defaultWeight:30   },
  'pain':                   { kcal:265, p:8.0,  c:50.0, f:2.5,  fb:2.5,  defaultWeight:50   },

  // ── Protéines & viandes ──
  'boeuf hache':            { kcal:254, p:17.0, c:0.0,  f:20.0, fb:0.0,  defaultWeight:100  },
  'poulet':                 { kcal:165, p:31.0, c:0.0,  f:3.6,  fb:0.0,  defaultWeight:150  },
  'lardons':                { kcal:337, p:14.0, c:1.0,  f:30.0, fb:0.0,  defaultWeight:100  },
  'saumon':                 { kcal:208, p:20.0, c:0.0,  f:13.0, fb:0.0,  defaultWeight:150  },
  'thon':                   { kcal:116, p:26.0, c:0.0,  f:1.0,  fb:0.0,  defaultWeight:140  },
  'oeuf':                   { kcal:143, p:13.0, c:0.7,  f:10.0, fb:0.0,  defaultWeight:60   },
  'oeufs':                  { kcal:143, p:13.0, c:0.7,  f:10.0, fb:0.0,  defaultWeight:60   },

  // ── Produits laitiers ──
  'lait':                   { kcal:64,  p:3.2,  c:4.8,  f:3.5,  fb:0.0,  defaultWeight:200  },
  'lait de soja':           { kcal:43,  p:3.7,  c:2.5,  f:1.9,  fb:0.6,  defaultWeight:200  },
  'lait vegetal':           { kcal:43,  p:1.4,  c:6.0,  f:1.4,  fb:0.4,  defaultWeight:200  },
  'fromage rape':           { kcal:390, p:28.0, c:0.0,  f:31.0, fb:0.0,  defaultWeight:30   },
  'fromage frais':          { kcal:103, p:7.5,  c:3.0,  f:7.5,  fb:0.0,  defaultWeight:75   },
  'fromage frais aux fines herbes': { kcal:120, p:6.0, c:4.0, f:9.0, fb:0.0, defaultWeight:75 },
  'feta':                   { kcal:264, p:14.0, c:4.0,  f:21.0, fb:0.0,  defaultWeight:50   },
  'beurre':                 { kcal:717, p:0.9,  c:0.1,  f:80.0, fb:0.0,  defaultWeight:10   },
  'yaourt':                 { kcal:59,  p:3.8,  c:4.7,  f:3.0,  fb:0.0,  defaultWeight:125  },
  'creme fraiche':          { kcal:292, p:2.1,  c:2.8,  f:30.0, fb:0.0,  defaultWeight:30   },
  'gorgonzola':             { kcal:353, p:21.0, c:1.0,  f:29.0, fb:0.0,  defaultWeight:50   },
  'chevre':                 { kcal:268, p:18.0, c:0.0,  f:22.0, fb:0.0,  defaultWeight:50   },

  // ── Fruits ──
  'pomme':                  { kcal:52,  p:0.3,  c:13.0, f:0.2,  fb:2.4,  defaultWeight:150  },
  'pommes':                 { kcal:52,  p:0.3,  c:13.0, f:0.2,  fb:2.4,  defaultWeight:150  },
  'banane':                 { kcal:89,  p:1.1,  c:23.0, f:0.3,  fb:2.6,  defaultWeight:120  },
  'bananes':                { kcal:89,  p:1.1,  c:23.0, f:0.3,  fb:2.6,  defaultWeight:120  },
  'fruits rouges':          { kcal:57,  p:1.3,  c:11.0, f:0.5,  fb:6.5,  defaultWeight:150  },
  'framboises':             { kcal:52,  p:1.2,  c:9.0,  f:0.7,  fb:6.5,  defaultWeight:125  },
  'myrtilles':              { kcal:57,  p:0.7,  c:11.0, f:0.3,  fb:2.4,  defaultWeight:125  },

  // ── Petit-déjeuner & sucré ──
  'graines de chia':        { kcal:486, p:17.0, c:42.0, f:31.0, fb:34.0, defaultWeight:15   },
  'granola':                { kcal:450, p:9.0,  c:67.0, f:17.0, fb:5.0,  defaultWeight:60   },
  'miel':                   { kcal:304, p:0.3,  c:82.0, f:0.0,  fb:0.2,  defaultWeight:15   },
  'sirop d agave':          { kcal:310, p:0.1,  c:76.0, f:0.0,  fb:0.0,  defaultWeight:15   },
  'raisins secs':           { kcal:299, p:3.1,  c:70.0, f:0.5,  fb:4.0,  defaultWeight:30   },
  'cacao':                  { kcal:228, p:20.0, c:14.0, f:11.0, fb:33.0, defaultWeight:8    },
  'vanille':                { kcal:288, p:0.1,  c:13.0, f:0.1,  fb:0.0,  defaultWeight:2    },
  'cannelle':               { kcal:247, p:4.0,  c:55.0, f:1.2,  fb:53.0, defaultWeight:3    },

  // ── Huiles & sauces ──
  'huile d olive':          { kcal:884, p:0.0,  c:0.0,  f:100.0,fb:0.0,  defaultWeight:10   },
  'huile de sesame':        { kcal:884, p:0.0,  c:0.0,  f:100.0,fb:0.0,  defaultWeight:5    },
  'beurre de cacahuete':    { kcal:588, p:25.0, c:20.0, f:50.0, fb:6.0,  defaultWeight:30   },
  'tahini':                 { kcal:595, p:17.0, c:21.0, f:54.0, fb:9.0,  defaultWeight:15   },
  'lait de coco':           { kcal:197, p:2.0,  c:6.0,  f:19.0, fb:2.0,  defaultWeight:200  },
  'houmous':                { kcal:177, p:8.0,  c:14.0, f:10.0, fb:6.0,  defaultWeight:50   },

  // ── Épices (contribution calorique négligeable mais on les inclut) ──
  'cumin':                  { kcal:375, p:18.0, c:44.0, f:22.0, fb:11.0, defaultWeight:3    },
  'paprika':                { kcal:282, p:14.0, c:34.0, f:13.0, fb:35.0, defaultWeight:3    },
  'curcuma':                { kcal:354, p:8.0,  c:65.0, f:10.0, fb:21.0, defaultWeight:3    },
  'gingembre':              { kcal:80,  p:1.8,  c:16.0, f:0.8,  fb:2.0,  defaultWeight:5    },
  'coriandre':              { kcal:23,  p:2.1,  c:0.9,  f:0.5,  fb:2.8,  defaultWeight:5    },
  'thym':                   { kcal:101, p:5.6,  c:8.0,  f:1.7,  fb:14.0, defaultWeight:2    },
  'persil':                 { kcal:36,  p:3.0,  c:3.0,  f:0.8,  fb:3.3,  defaultWeight:10   },
};

// ══════════════════════════════════════════════
//  CONVERSION UNITÉS → GRAMMES
// ══════════════════════════════════════════════
const UNIT_WEIGHTS = {
  'g':        (q) => q,
  'kg':       (q) => q * 1000,
  'ml':       (q) => q,           // densité ≈ 1 (eau / liquides légers)
  'cl':       (q) => q * 10,
  'L':        (q) => q * 1000,
  'càs':      (_) => 15,          // 1 càs ≈ 15g
  'càc':      (_) => 5,           // 1 càc ≈ 5g
  'conserve': (_) => 400,         // 1 conserve ≈ 400g
  'boîte':    (_) => 400,
  'sachet':   (_) => 10,
  'gousse':   (q) => q * 6,       // 1 gousse d'ail ≈ 6g
  'brin':     (_) => 3,
  'feuille':  (_) => 1,
  'filet':    (_) => 10,
  'pot':      (_) => 200,
  'verre':    (_) => 200,
  'trait':    (_) => 5,
  'pièce':    (_) => null,        // dépend de l'ingrédient → defaultWeight
  '':         (_) => null,        // idem
};

// Convertit qty + unit en grammes pour un ingrédient donné
function toGrams(qty, unit, normKey) {
  if (!qty || isNaN(parseFloat(qty))) return 0;

  // Gestion des plages "5-6" → prend la moyenne
  let q;
  if (typeof qty === 'string' && qty.includes('-')) {
    const parts = qty.split('-').map(Number);
    q = (parts[0] + parts[1]) / 2;
  } else {
    q = parseFloat(qty);
  }

  const converter = UNIT_WEIGHTS[unit] || UNIT_WEIGHTS[''];
  const grams     = converter(q);

  if (grams !== null) return grams;

  // Fallback → defaultWeight de l'ingrédient × quantité
  const nutData = NUTRITION_DATA[normKey];
  if (nutData?.defaultWeight) return q * nutData.defaultWeight;

  return 0;
}
