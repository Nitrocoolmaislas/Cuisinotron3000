// ══════════════════════════════════════════════
//  INGREDIENT BRIDGE
//  Clé   = normIngredient(nom dans les recettes)
//  terms = mots-clés à chercher dans LongName/name Colruyt (NL)
//
//  Confirmé sur le JSON réel du 2026-03-28 :
//    - noms en néerlandais uniquement
//    - LongName = "BRAND Naam inhoud" (ex: "BONI Champignons 250g")
//    - topCategoryName en NL (ex: "Groenten en fruit")
// ══════════════════════════════════════════════

const INGREDIENT_BRIDGE = {

  // ── Légumes ──
  'champignons de paris':   { terms: ['champignons', 'paddenstoelen'] },
  'epinards frais':         { terms: ['spinazie'] },
  'epinards':               { terms: ['spinazie'] },
  'courgette':              { terms: ['courgette'] },
  'courge spaghetti':       { terms: ['spaghettipompoen'] },
  'butternut':              { terms: ['butternut', 'pompoen'] },
  'poivron rouge':          { terms: ['rode paprika'] },
  'poivrons rouges':        { terms: ['rode paprika'] },
  'tomate':                 { terms: ['tomaat', 'tomaten'] },
  'tomates en des':         { terms: ['tomaten blokjes', 'tomatenblokjes', 'tomaten in stukjes'] },
  'tomates cerises':        { terms: ['kerstomaat', 'cherrytomaat'] },
  'oignon blanc':           { terms: ['ui', 'uien'] },
  'oignon rouge':           { terms: ['rode ui', 'rode uien'] },
  'oignon':                 { terms: ['ui', 'uien'] },
  'echalote':               { terms: ['sjalot'] },
  'ail':                    { terms: ['knoflook'] },
  'gousses d ail':          { terms: ['knoflook'] },
  'gousse d ail':           { terms: ['knoflook'] },
  'brocoli':                { terms: ['broccoli'] },
  'concombre':              { terms: ['komkommer'] },
  'carotte':                { terms: ['wortel', 'wortelen'] },
  'carottes':               { terms: ['wortel', 'wortelen'] },
  'celeri':                 { terms: ['selder', 'selderij'] },
  'mais':                   { terms: ['maïs', 'mais'] },
  'avocat':                 { terms: ['avocado'] },
  'citron':                 { terms: ['citroen'] },

  // ── Féculents & céréales ──
  'riz':                    { terms: ['rijst'] },
  'quinoa':                 { terms: ['quinoa'] },
  'lentilles vertes':       { terms: ['groene linzen'] },
  'lentilles corail':       { terms: ['rode linzen'] },
  'lentilles':              { terms: ['linzen'] },
  'haricots rouges':        { terms: ['rode bonen', 'kidneybonen'] },
  'pois chiches':           { terms: ['kikkererwten'] },
  'pates':                  { terms: ['pasta', 'spaghetti', 'penne'] },
  'flocons d avoine':       { terms: ['havervlokken', 'havermout'] },
  'nouilles':               { terms: ['noedels', 'noodles'] },
  'pain de mie':            { terms: ['sandwichbrood', 'sneetjesbrood'] },
  'pain':                   { terms: ['brood'] },

  // ── Protéines & viandes ──
  'boeuf hache':            { terms: ['gehakt', 'rundergehakt'] },
  'poulet':                 { terms: ['kip', 'kipfilet'] },
  'lardons':                { terms: ['spekblokjes', 'lardons'] },
  'saumon':                 { terms: ['zalm'] },
  'thon':                   { terms: ['tonijn'] },
  'oeuf':                   { terms: ['eieren', 'ei'] },
  'oeufs':                  { terms: ['eieren'] },

  // ── Produits laitiers ──
  'lait':                   { terms: ['volle melk', 'halfvolle melk'] },
  'lait de soja':           { terms: ['sojamelk', 'soja drink'] },
  'lait vegetal':           { terms: ['plantaardige melk', 'havermelk', 'amandelmelk'] },
  'fromage rape':           { terms: ['geraspte kaas', 'raskaas'] },
  'fromage frais':          { terms: ['verse kaas', 'smeerkaas'] },
  'fromage frais aux fines herbes': { terms: ['verse kaas fijne kruiden', 'boursin'] },
  'feta':                   { terms: ['feta'] },
  'beurre':                 { terms: ['boter'] },
  'yaourt':                 { terms: ['yoghurt'] },
  'creme fraiche':          { terms: ['room', 'crème fraîche', 'creme fraiche'] },
  'gorgonzola':             { terms: ['gorgonzola'] },
  'chevre':                 { terms: ['geitenkaas'] },

  // ── Fruits ──
  'pomme':                  { terms: ['appel', 'appelen'] },
  'pommes':                 { terms: ['appel', 'appelen'] },
  'banane':                 { terms: ['banaan', 'bananen'] },
  'bananes':                { terms: ['banaan', 'bananen'] },
  'fruits rouges':          { terms: ['rood fruit', 'bosvruchten', 'rode vruchten'] },
  'framboises':             { terms: ['frambozen'] },
  'myrtilles':              { terms: ['bosbessen'] },

  // ── Petit-déjeuner & sucré ──
  'graines de chia':        { terms: ['chiazaad', 'chia'] },
  'granola':                { terms: ['granola', 'muesli'] },
  'miel':                   { terms: ['honing'] },
  'sirop d agave':          { terms: ['agavesiroop'] },
  'raisins secs':           { terms: ['rozijnen'] },
  'cacao':                  { terms: ['cacaopoeder', 'cacao'] },
  'vanille':                { terms: ['vanille', 'vanillepoeder'] },
  'cannelle':               { terms: ['kaneel'] },

  // ── Épices ──
  'cumin':                  { terms: ['komijn', 'cumin'] },
  'paprika':                { terms: ['paprikapoeder', 'paprika poeder'] },
  'curcuma':                { terms: ['kurkuma', 'curcuma'] },
  'gingembre':              { terms: ['gember'] },
  'coriandre':              { terms: ['koriander'] },
  'thym':                   { terms: ['tijm'] },
  'laurier':                { terms: ['laurier', 'laurierblad'] },
  'persil':                 { terms: ['peterselie'] },

  // ── Sauces & huiles ──
  'huile d olive':          { terms: ['olijfolie'] },
  'huile de sesame':        { terms: ['sesamolie'] },
  'sauce soja':             { terms: ['sojasaus'] },
  'concentre de tomate':    { terms: ['tomatenpuree'] },
  'bouillon de legumes':    { terms: ['groentebouillon'] },
  'bouillon de poulet':     { terms: ['kippenbouillon'] },
  'lait de coco':           { terms: ['kokosmelk'] },
  'tahini':                 { terms: ['tahini', 'sesampasta'] },
  'houmous':                { terms: ['hummus', 'houmous'] },
  'vinaigre':               { terms: ['azijn'] },
};
