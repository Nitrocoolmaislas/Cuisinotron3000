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
  'courge spaghetti':       ['pompoen'],
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
  'oignon blanc':           ['uien'],
  'oignon rouge':           ['rode ui', 'rode uien'],
  'oignon':                 ['uien'],
  'echalote':               ['sjalot'],
  'ail':                    ['knoflook'],
  'gousses d ail':          ['knoflook'],
  'gousse d ail':           ['knoflook'],
  'gousses dail':           ['knoflook'],  // "d'" sans espace
  'gousse dail':            ['knoflook'],
  'brocoli':                ['broccoli'],
  'concombre':              ['komkommer'],
  'carotte':                ['wortel', 'wortelen'],
  'carottes':               ['wortel', 'wortelen'],
  'celeri':                 ['selder', 'selderij'],
  'mais':                   ['maïs', 'mais'],
  'avocat':                 ['avocado'],
  'citron':                 ['citroenen', 'citroen bio'],
  'citrons':                ['citroenen'],
  'ciboulette':             ['bieslook'],
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
  'lentilles vertes':       ['linzen'],
  'lentilles corail':       ['rode linzen'],
  'lentilles':              ['linzen'],
  'haricots rouges':        ['rode bonen', 'kidneybonen'],
  'pois chiches':           ['kikkererwten'],
  'pois chiche':            ['kikkererwten'],
  'pates':                  ['pasta', 'spaghetti', 'penne'],
  'spaghetti':              ['spaghetti'],
  'flocons d avoine':       ['havervlokken', 'havermout'],
  'flocon d avoine':        ['havervlokken', 'havermout'],
  'flocons davoine':        ['havervlokken', 'havermout'],  // "d'" sans espace après normIngredient
  'flocon davoine':         ['havervlokken', 'havermout'],
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
  'tofu':                   ['tofu'],
  'ricotta':                ['ricotta'],
  'feta':                   ['feta'],

  // ── Produits laitiers ──
  'lait':                   ['volle melk', 'halfvolle melk'],
  'lait de soja':           ['sojadrink'],
  'lait d amande':          ['amandelmelk'],
  'lait damande':           ['amandelmelk'],  // "d'" sans espace
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
  'sirop dagave':           ['agavesiroop'],           // "d'" sans espace
  'sirop d erable':         ['esdoornsiroop', 'ahornsirup'],
  'sirop derable':          ['esdoornsiroop', 'ahornsirup'],
  'raisins secs':           ['rozijnen'],
  'cacao':                  ['cacaopoeder', 'cacao'],
  'vanille':                ['vanille', 'vanillepoeder'],
  'extrait de vanille':     ['vanille-extract', 'vanille extract'],
  'sucre vanille':          ['vanillesuiker'],
  'cannelle':               ['kaneel'],

  // ── Épices & herbes ──
  'cumin':                  ['komijn', 'cumin'],
  'curry':                  ['curry'],
  'paprika':                ['kruiden paprika'],
  'poivre noir':            ['zwarte peper'],
  'poivre blanc':           ['witte peper'],
  'poivre':                 ['peper'],
  'curcuma':                ['kurkuma', 'curcuma'],
  'gingembre':              ['gember'],
  'coriandre':              ['koriander'],
  'thym':                   ['tijm'],
  'laurier':                ['laurier', 'laurierblad'],
  'persil':                 ['peterselie'],
  'basilic':                ['basilicum'],
  'origan':                 ['oregano'],
  'aneth':                  ['dille'],
  'brins d aneth':          ['dille'],
  'brins daneth':           ['dille'],
  'piment':                 ['piment', 'chili'],
  'garam masala':           ['garam masala'],
  'garam':                  ['garam masala'],
  'masala':                 ['garam masala'],
  'epices chili':           ['chilipoeder', 'chilipeper'],
  'epices a chili':         ['chilipoeder', 'chilipeper'],
  'melange d epices a chili': ['chilipoeder', 'chilipeper'],
  'melange depices a chili':  ['chilipoeder', 'chilipeper'],
  'wasabi':                 ['wasabi'],
  'sel':                    ['zout'],
  'soja':                   ['tauge', 'sojascheuten'],  // "germes de soja" → "soja" après strip

  // ── Légumes supplémentaires ──
  'aubergine':              ['aubergine'],
  'olive':                  ['olijven'],
  'olives':                 ['olijven'],
  'jeunes oignons':         ['jonge ui'],
  'germes de soja':         ['tauge', 'sojascheuten'],
  'cerneaux de noix':       ['walnoten'],
  'levure chimique':        ['bakpoeder'],
  'bicarbonate':            ['natriumbicarbonaat', 'baking soda'],
  'bicarbonate de soude':   ['natriumbicarbonaat', 'baking soda'],
  'sauce d huitre':         ['oestersaus'],
  'sauce huitre':           ['oestersaus'],

  // ── Sauces, huiles & condiments ──
  'huile d olive':          ['olijfolie'],
  'huile dolive':           ['olijfolie'],              // "d'" sans espace
  'huile de sesame':        ['sesamolie'],
  'sauce soja':             ['sojasaus'],
  'sauce d huitre':         ['oestersaus'],
  'sauce dhuitre':          ['oestersaus'],             // "d'" sans espace
  'concentre de tomate':    ['tomatenpuree'],
  'bouillon de legumes':    ['bouillon groenten'],
  'bouillon de poulet':     ['kippenbouillon'],
  'bouillon':               ['bouillon'],
  'tahini':                 ['tahini', 'sesampasta'],
  'houmous':                ['hummus', 'houmous'],
  'vinaigre blanc':         ['witte wijnazijn', 'azijn'],
  'vinaigre':               ['azijn'],
  'vin blanc':              ['witte wijn'],
  'vin blanc sec':          ['droge witte wijn', 'witte wijn'],
  'jus de citron':          ['citroensap'],
  'jus d citron':           ['citroensap'],   // "jus d'½ citron" / "jus d'un citron"
  'jus d un citron':        ['citroensap'],
  'jus de citron vert':     ['limoensap'],
  'sauce cocktail':         ['cocktailsaus'],
  'mayonnaise':             ['mayonaise', 'mayo'],
  'moutarde':               ['mosterd'],
  'cornichon':              ['augurk', 'augurken'],
  'cornichons':             ['augurken', 'cornichon'],
};

// ─── Lookup avec fallbacks pluriels ──────────────────────────────────────────
function bridgeLookup(normKey) {
  // 0. Whitelist : si colruyt_sku renseigné → retourner directement
  if (typeof whitelistEntry !== 'undefined') {
    const wEntry = whitelistEntry(normKey);
    if (wEntry?.sku) return [wEntry.sku];
  }

  // 1. Irréguliers — priorité absolue
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
