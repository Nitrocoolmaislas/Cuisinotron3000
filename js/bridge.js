// ══════════════════════════════════════════════
//  BRIDGE — mapping FR → NL Colruyt
//  Clé   = normIngredient(nom ingrédient FR)
//  Valeur = array de termes NL pour matchColruyt
//
//  Logique de lookup : bridgeLookup() / bridgeLookupFull() (bridgeWizard.js)
// ══════════════════════════════════════════════

// ─── Irréguliers — priorité absolue dans bridgeLookup ────────────────────────
const IRREGULAR_FORMS = {
  // Pluriels en -eux/-aux
  'poireaux':       'poireau',
  'choux':          'chou',
  'choux fleurs':   'chou fleur',
  // Ligatures
  'boeufs':         'boeuf',
  // Invariables en -x (protège contre strip /s$/ → noi / poi)
  'noix':           'noix',
  'pois':           'pois',
  // Cas où le parser remonte l'unité comme rawName
  'gousses':        'ail',
  'gousse':         'ail',
  // Pluriels irréguliers divers
  'oignons rouges': 'oignon rouge',
};

// ─── Bridge principal ─────────────────────────────────────────────────────────
const INGREDIENT_BRIDGE = {

  // ── Légumes ──
  'champignons de paris':   ['champignons', 'paddenstoelen'],
  'champignon de paris':    ['champignons', 'paddenstoelen'],
  'champignon':             ['champignons'],
  'epinards frais':         ['spinazie'],
  'epinards':               ['spinazie'],
  'epinard':                ['spinazie'],
  'courgette':              ['courgette'],
  'courge spaghetti':       ['spaghettipompoen'],
  'butternut':              ['butternut', 'pompoen'],
  'courge':                 ['pompoen'],
  'poivron rouge':          ['rode paprika'],
  'poivrons rouges':        ['rode paprika'],
  'poivron jaune':          ['gele paprika'],
  'poivron':                ['paprika'],
  'tomate':                 ['tomaat', 'tomaten'],
  'tomates en des':         ['tomaten blokjes', 'tomatenblokjes'],
  'tomate pelee':           ['gepelde tomaten'],
  'tomate confite':         ['gedroogde tomaat'],
  'tomates cerises':        ['kerstomaat', 'cherrytomaat'],
  'tomate cerise':          ['kerstomaat', 'cherrytomaat'],
  'oignon blanc':           ['ui', 'uien'],
  'oignon rouge':           ['rode ui', 'rode uien'],
  'oignon':                 ['ui', 'uien'],
  'echalote':               ['sjalot'],
  'ail':                    ['knoflook'],
  'gousses d ail':          ['knoflook'],
  'gousse d ail':           ['knoflook'],
  'brocoli':                ['broccoli'],
  'concombre':              ['komkommer'],
  'carotte':                ['wortel', 'wortelen'],
  'carottes':               ['wortel', 'wortelen'],
  'celeri':                 ['selder', 'selderij'],
  'mais':                   ['maïs', 'mais'],
  'avocat':                 ['avocado'],
  'citron':                 ['citroen'],
  'poireau':                ['prei'],
  'chou fleur':             ['bloemkool'],
  'chou':                   ['kool'],
  'petits pois':            ['erwten'],
  'haricot rouge':          ['rode bonen', 'kidneybonen'],
  'haricot blanc':          ['witte bonen'],
  'haricots blancs':        ['witte bonen'],

  // ── Féculents & céréales ──
  'riz pour risotto':       ['risottorijst'],
  'riz':                    ['rijst'],
  'quinoa':                 ['quinoa'],
  'lentilles vertes':       ['groene linzen'],
  'lentilles corail':       ['rode linzen'],
  'lentilles':              ['linzen'],
  'haricots rouges':        ['rode bonen', 'kidneybonen'],
  'pois chiches':           ['kikkererwten'],
  'pois chiche':            ['kikkererwten'],
  'pates':                  ['pasta', 'spaghetti', 'penne'],
  'spaghetti':              ['spaghetti'],
  'flocons d avoine':       ['havervlokken', 'havermout'],
  'flocon d avoine':        ['havervlokken', 'havermout'],
  'avoine':                 ['havervlokken'],
  'nouilles':               ['noedels', 'noodles'],
  'nouille':                ['noedels', 'noodles'],
  'pain de mie':            ['sandwichbrood', 'sneetjesbrood'],
  'pain':                   ['brood'],
  'farine':                 ['bloem'],
  'graines de chia':        ['chiazaad', 'chia'],
  'graine de chia':         ['chiazaad', 'chia'],

  // ── Protéines ──
  'boeuf hache':            ['gehakt', 'rundergehakt'],
  'boeuf':                  ['rundvlees'],
  'poulet':                 ['kip', 'kipfilet'],
  'lardons':                ['spekblokjes', 'lardons'],
  'saumon':                 ['zalm'],
  'thon':                   ['tonijn'],
  'truite fumee':           ['gerookte forel'],
  'oeuf':                   ['eieren', 'ei'],
  'oeufs':                  ['eieren'],
  'ricotta':                ['ricotta'],
  'feta':                   ['feta'],

  // ── Produits laitiers ──
  'lait':                   ['volle melk', 'halfvolle melk'],
  'lait de soja':           ['sojamelk', 'soja drink'],
  'lait d amande':          ['amandelmelk'],
  'lait vegetal':           ['plantaardige melk', 'havermelk', 'amandelmelk'],
  'lait de coco':           ['kokosmelk'],
  'fromage rape':           ['geraspte kaas', 'raskaas'],
  'fromage frais':          ['verse kaas', 'smeerkaas'],
  'fromage frais aux fines herbes': ['verse kaas fijne kruiden', 'boursin'],
  'fromage':                ['kaas'],
  'beurre':                 ['boter'],
  'yaourt':                 ['yoghurt'],
  'creme fraiche':          ['room', 'crème fraîche', 'creme fraiche'],
  'gorgonzola':             ['gorgonzola'],
  'chevre':                 ['geitenkaas'],
  'parmesan':               ['parmezaan'],

  // ── Fruits ──
  'pomme':                  ['appel', 'appelen'],
  'pommes':                 ['appel', 'appelen'],
  'banane':                 ['banaan', 'bananen'],
  'bananes':                ['banaan', 'bananen'],
  'fruits rouges':          ['rood fruit', 'bosvruchten', 'rode vruchten'],
  'fruit rouge':            ['rood fruit', 'bosvruchten'],
  'framboises':             ['frambozen'],
  'myrtilles':              ['bosbessen'],

  // ── Petit-déjeuner & sucré ──
  'granola':                ['granola', 'muesli'],
  'miel':                   ['honing'],
  'sirop d agave':          ['agavesiroop'],
  'raisins secs':           ['rozijnen'],
  'cacao':                  ['cacaopoeder', 'cacao'],
  'vanille':                ['vanille', 'vanillepoeder'],
  'cannelle':               ['kaneel'],

  // ── Épices & herbes ──
  'cumin':                  ['komijn', 'cumin'],
  'paprika':                ['paprikapoeder', 'paprika poeder'],
  'curcuma':                ['kurkuma', 'curcuma'],
  'gingembre':              ['gember'],
  'coriandre':              ['koriander'],
  'thym':                   ['tijm'],
  'laurier':                ['laurier', 'laurierblad'],
  'persil':                 ['peterselie'],
  'basilic':                ['basilicum'],
  'origan':                 ['oregano'],
  'aneth':                  ['dille'],
  'piment':                 ['piment', 'chili'],
  'garam masala':           ['garam masala'],
  'wasabi':                 ['wasabi'],

  // ── Sauces, huiles & condiments ──
  'huile d olive':          ['olijfolie'],
  'huile de sesame':        ['sesamolie'],
  'sauce soja':             ['sojasaus'],
  'sauce d huitre':         ['oestersaus'],
  'concentre de tomate':    ['tomatenpuree'],
  'bouillon de legumes':    ['groentebouillon'],
  'bouillon de poulet':     ['kippenbouillon'],
  'bouillon':               ['bouillon'],
  'tahini':                 ['tahini', 'sesampasta'],
  'houmous':                ['hummus', 'houmous'],
  'vinaigre blanc':         ['witte azijn'],
  'vinaigre':               ['azijn'],
  'vin blanc':              ['witte wijn'],
  'jus de citron':          ['citroensap'],
};

// ─── Lookup avec fallbacks pluriels ──────────────────────────────────────────
function bridgeLookup(normKey) {
  // 0. Irréguliers — priorité absolue
  const canonical = IRREGULAR_FORMS[normKey];
  if (canonical) return INGREDIENT_BRIDGE[canonical] ?? null;

  // 1. Correspondance exacte
  if (INGREDIENT_BRIDGE[normKey]) return INGREDIENT_BRIDGE[normKey];

  // 2. Strip s final (pluriels réguliers simples)
  const s1 = normKey.replace(/s$/, '');
  if (s1 !== normKey && INGREDIENT_BRIDGE[s1]) return INGREDIENT_BRIDGE[s1];

  // 3. Déplurialiser chaque mot (ex: poivrons rouges → poivron rouge)
  const deplural = normKey.split(' ').map(w => w.replace(/s$/, '')).join(' ');
  if (deplural !== normKey && INGREDIENT_BRIDGE[deplural]) return INGREDIENT_BRIDGE[deplural];

  // 4. Premier mot seul (ex: courgettes moyennes → courgette)
  const firstWord = deplural.split(' ')[0];
  if (firstWord !== deplural && INGREDIENT_BRIDGE[firstWord]) return INGREDIENT_BRIDGE[firstWord];

  return null;
}
