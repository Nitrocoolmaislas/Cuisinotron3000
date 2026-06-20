// data/whitelist_canonique.js
// Base de données sémantique — 332 SKUs canoniques, 2009 entrées d'index
// Générée depuis FoodEx2/WOLF
//
// Champs :
//   k      : normKey canonique (lookup direct)
//   name   : nom lisible
//   cat    : catégorie
//   ciqual : code CIQUAL (null = à renseigner)
//   ratio  : raw_to_cooked_ratio (null = à renseigner)
//   sku    : terme NL Colruyt (null = à renseigner)
//   aliases: formes alternatives normalisées

const WHITELIST = [
  {
    "id": 1,
    "k": "yaourt nature",
    "name": "Yaourt nature",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yogourt",
      "yoghourt",
      "yaourt blanc",
      "laitage fermente",
      "yaourt nature entier"
    ]
  },
  {
    "id": 2,
    "k": "yaourt nature 0 mg",
    "name": "Yaourt nature 0% MG",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yaourt maigre",
      "yaourt 0",
      "yaourt allege",
      "yaourt ecreme",
      "yogourt 0"
    ]
  },
  {
    "id": 3,
    "k": "yaourt aux fruits",
    "name": "Yaourt aux fruits",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yaourt fruite",
      "yaourt fraise",
      "yaourt framboise",
      "yaourt peche",
      "yaourt abricot"
    ]
  },
  {
    "id": 4,
    "k": "yaourt aromatise",
    "name": "Yaourt aromatisé",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yaourt parfume",
      "yaourt vanille",
      "yaourt citron",
      "yaourt caramel",
      "yaourt saveur"
    ]
  },
  {
    "id": 5,
    "k": "yaourt a la grecque",
    "name": "Yaourt à la grecque",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yaourt grec",
      "greek yogurt",
      "yogourt grec",
      "yaourt epais",
      "strained yogurt"
    ]
  },
  {
    "id": 6,
    "k": "skyr",
    "name": "Skyr",
    "cat": "Produits laitiers frais",
    "aliases": [
      "skyr islandais",
      "fromage frais islandais",
      "yaourt skyr",
      "laitage islandais"
    ]
  },
  {
    "id": 7,
    "k": "yaourt a boire",
    "name": "Yaourt à boire",
    "cat": "Produits laitiers frais",
    "aliases": [
      "yaourt liquide",
      "boisson lactee fermentee",
      "yaourt buvable",
      "dairy drink"
    ]
  },
  {
    "id": 8,
    "k": "kefir de lait",
    "name": "Kéfir de lait",
    "cat": "Produits laitiers frais",
    "aliases": [
      "kefir",
      "kephir",
      "lait fermente kefir",
      "boisson probiotique"
    ]
  },
  {
    "id": 9,
    "k": "fromage blanc nature 20 mg",
    "name": "Fromage blanc nature (20% MG)",
    "cat": "Produits laitiers frais",
    "aliases": [
      "fromage blanc",
      "fromage blanc demigras",
      "fromage blanc 20",
      "caillebotte"
    ]
  },
  {
    "id": 10,
    "k": "fromage blanc nature 0 mg",
    "name": "Fromage blanc nature 0% MG",
    "cat": "Produits laitiers frais",
    "aliases": [
      "fromage blanc maigre",
      "fromage blanc 0",
      "fromage blanc allege",
      "fromage blanc ecreme"
    ]
  },
  {
    "id": 11,
    "k": "fromage blanc nature 40 mg",
    "name": "Fromage blanc nature 40% MG",
    "cat": "Produits laitiers frais",
    "aliases": [
      "fromage blanc gras",
      "fromage blanc entier",
      "fromage blanc 40",
      "fromage blanc riche"
    ]
  },
  {
    "id": 12,
    "k": "petit suisse",
    "name": "Petit suisse",
    "cat": "Produits laitiers frais",
    "aliases": [
      "petits suisses",
      "gervais",
      "fromage frais enfant",
      "fromage frais petit pot"
    ]
  },
  {
    "id": 13,
    "k": "ricotta",
    "name": "Ricotta",
    "cat": "Produits laitiers frais",
    "aliases": [
      "ricotta fraiche",
      "brousse",
      "serac",
      "fromage de lactoserum"
    ]
  },
  {
    "id": 14,
    "k": "creme dessert flan",
    "name": "Crème dessert / flan",
    "cat": "Produits laitiers frais",
    "aliases": [
      "flan",
      "creme caramel",
      "creme chocolat",
      "creme vanille",
      "dessert lacte",
      "danette"
    ]
  },
  {
    "id": 15,
    "k": "faisselle",
    "name": "Faisselle",
    "cat": "Produits laitiers frais",
    "aliases": [
      "faisselle de vache",
      "fromage frais en faisselle",
      "caillebotte",
      "lait caille egoutte"
    ]
  },
  {
    "id": 16,
    "k": "camembert",
    "name": "Camembert",
    "cat": "Fromages",
    "aliases": [
      "camembert de normandie",
      "camembert au lait cru",
      "fromage a croute fleurie"
    ]
  },
  {
    "id": 17,
    "k": "brie coulommiers",
    "name": "Brie / Coulommiers",
    "cat": "Fromages",
    "aliases": [
      "brie",
      "brie de meaux",
      "brie de melun",
      "coulommiers",
      "fromage brie"
    ]
  },
  {
    "id": 18,
    "k": "munster",
    "name": "Munster",
    "cat": "Fromages",
    "aliases": [
      "munster gerome",
      "munster alsacien",
      "fromage alsacien",
      "munster au lait cru"
    ]
  },
  {
    "id": 19,
    "k": "reblochon",
    "name": "Reblochon",
    "cat": "Fromages",
    "aliases": [
      "reblochon de savoie",
      "fromage savoyard",
      "fromage a tartiflette",
      "reblochon fermier"
    ]
  },
  {
    "id": 20,
    "k": "epoisses fromage a croute lavee",
    "name": "Époisses / fromage à croûte lavée",
    "cat": "Fromages",
    "aliases": [
      "epoisses",
      "livarot",
      "maroilles",
      "pontleveque",
      "fromage fort",
      "fromage puant",
      "fromage croute lavee"
    ]
  },
  {
    "id": 21,
    "k": "fromage de chevre frais",
    "name": "Fromage de chèvre frais",
    "cat": "Fromages",
    "aliases": [
      "chevre frais",
      "fromage frais de chevre",
      "buchette fraiche",
      "chevre doux",
      "fromage caprin frais"
    ]
  },
  {
    "id": 22,
    "k": "fromage de chevre affine buche crottin",
    "name": "Fromage de chèvre affiné (bûche, crottin)",
    "cat": "Fromages",
    "aliases": [
      "crottin de chavignol",
      "buche de chevre",
      "saintemaure",
      "chevre affine",
      "fromage caprin",
      "picodon",
      "pouligny"
    ]
  },
  {
    "id": 23,
    "k": "fromage de brebis",
    "name": "Fromage de brebis",
    "cat": "Fromages",
    "aliases": [
      "ossauiraty",
      "pecorino",
      "manchego",
      "fromage brebis basque",
      "fromage ovin",
      "brebis pyrenees"
    ]
  },
  {
    "id": 24,
    "k": "emmental",
    "name": "Emmental",
    "cat": "Fromages",
    "aliases": [
      "emmental francais",
      "fromage rape",
      "gruyere rape",
      "fromage a trous",
      "emmenthal",
      "fromage fondu gratine"
    ]
  },
  {
    "id": 25,
    "k": "gruyere comte",
    "name": "Gruyère / Comté",
    "cat": "Fromages",
    "aliases": [
      "comte",
      "gruyere suisse",
      "beaufort",
      "fromage a pate dure",
      "fromage fondu",
      "fromage a gratiner"
    ]
  },
  {
    "id": 26,
    "k": "parmesan grana padano",
    "name": "Parmesan / Grana Padano",
    "cat": "Fromages",
    "aliases": [
      "parmesan",
      "parmigiano reggiano",
      "grana padano",
      "parmesan rape",
      "fromage italien dur"
    ]
  },
  {
    "id": 27,
    "k": "gouda",
    "name": "Gouda",
    "cat": "Fromages",
    "aliases": [
      "gouda hollandais",
      "gouda jeune",
      "gouda vieux",
      "fromage hollandais",
      "edam"
    ]
  },
  {
    "id": 28,
    "k": "cheddar",
    "name": "Cheddar",
    "cat": "Fromages",
    "aliases": [
      "cheddar anglais",
      "cheddar mature",
      "cheddar rape",
      "fromage anglais",
      "fromage burger"
    ]
  },
  {
    "id": 29,
    "k": "tomme fromage a pate pressee non cuite",
    "name": "Tomme / fromage à pâte pressée non cuite",
    "cat": "Fromages",
    "aliases": [
      "tomme de savoie",
      "tomme de vache",
      "saintnectaire",
      "cantal",
      "laguiole",
      "fromage montagnard"
    ]
  },
  {
    "id": 30,
    "k": "roquefort bleu",
    "name": "Roquefort / Bleu",
    "cat": "Fromages",
    "aliases": [
      "roquefort",
      "bleu dauvergne",
      "bleu de gex",
      "fourme dambert",
      "gorgonzola",
      "fromage bleu",
      "bleu persille"
    ]
  },
  {
    "id": 31,
    "k": "feta",
    "name": "Feta",
    "cat": "Fromages",
    "aliases": [
      "feta grecque",
      "fromage blanc grec",
      "fromage de brebis grec",
      "feta aop",
      "fromage en saumure"
    ]
  },
  {
    "id": 32,
    "k": "mozzarella",
    "name": "Mozzarella",
    "cat": "Fromages",
    "aliases": [
      "mozzarella di bufala",
      "mozzarella vache",
      "mozzarella pizza",
      "fromage file",
      "burrata"
    ]
  },
  {
    "id": 33,
    "k": "fromage fondu a tartiner type kiri",
    "name": "Fromage fondu / à tartiner (type Kiri)",
    "cat": "Fromages",
    "aliases": [
      "fromage fondu",
      "vache qui rit",
      "kiri",
      "fromage a tartiner",
      "creme de gruyere",
      "portion fondue"
    ]
  },
  {
    "id": 34,
    "k": "mascarpone",
    "name": "Mascarpone",
    "cat": "Fromages",
    "aliases": [
      "mascarpone italien",
      "creme mascarpone",
      "fromage a tiramisu",
      "fromage cremeux italien"
    ]
  },
  {
    "id": 35,
    "k": "philadelphia fromage frais a tartiner",
    "name": "Philadelphia / fromage frais à tartiner",
    "cat": "Fromages",
    "aliases": [
      "philadelphia",
      "cream cheese",
      "fromage frais tartiner",
      "fromage frais cremeux",
      "st moret"
    ]
  },
  {
    "id": 36,
    "k": "lait entier",
    "name": "Lait entier",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "lait de vache entier",
      "lait frais entier",
      "lait 35",
      "lait riche en matieres grasses"
    ]
  },
  {
    "id": 37,
    "k": "lait demiecreme",
    "name": "Lait demi-écrémé",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "lait",
      "lait de vache",
      "lait frais",
      "lait 15",
      "lait demi"
    ]
  },
  {
    "id": 38,
    "k": "lait ecreme",
    "name": "Lait écrémé",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "lait maigre",
      "lait 0",
      "lait allege",
      "lait ecreme frais"
    ]
  },
  {
    "id": 39,
    "k": "lait en poudre",
    "name": "Lait en poudre",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "lait deshydrate",
      "poudre de lait",
      "lait en poudre entier",
      "lait instantane"
    ]
  },
  {
    "id": 40,
    "k": "lait de soja",
    "name": "Lait de soja",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "boisson soja",
      "soja drink",
      "boisson au soja",
      "lait vegetal soja"
    ]
  },
  {
    "id": 41,
    "k": "lait davoine",
    "name": "Lait d'avoine",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "boisson avoine",
      "oat milk",
      "boisson a lavoine",
      "lait vegetal avoine",
      "oat drink"
    ]
  },
  {
    "id": 42,
    "k": "lait damande",
    "name": "Lait d'amande",
    "cat": "Laits & boissons végétales",
    "aliases": [
      "boisson amande",
      "almond milk",
      "boisson aux amandes",
      "lait vegetal amande"
    ]
  },
  {
    "id": 43,
    "k": "creme fraiche epaisse",
    "name": "Crème fraîche épaisse",
    "cat": "Crèmes",
    "aliases": [
      "creme epaisse",
      "creme fraiche",
      "creme entiere epaisse",
      "creme normande",
      "creme acidulee"
    ]
  },
  {
    "id": 44,
    "k": "creme fraiche liquide fleurette",
    "name": "Crème fraîche liquide (fleurette)",
    "cat": "Crèmes",
    "aliases": [
      "creme liquide",
      "creme fleurette",
      "creme entiere liquide",
      "creme a fouetter",
      "creme uht",
      "heavy cream"
    ]
  },
  {
    "id": 45,
    "k": "creme legere",
    "name": "Crème légère",
    "cat": "Crèmes",
    "aliases": [
      "creme allegee",
      "creme 15",
      "creme semiepaisse allegee",
      "creme legere epaisse"
    ]
  },
  {
    "id": 46,
    "k": "creme de coco",
    "name": "Crème de coco",
    "cat": "Crèmes",
    "aliases": [
      "creme coco",
      "coconut cream",
      "creme noix de coco",
      "creme de noix de coco"
    ]
  },
  {
    "id": 47,
    "k": "boeuf hache",
    "name": "Bœuf haché",
    "cat": "Viandes",
    "aliases": [
      "viande hachee",
      "steak hache",
      "hachis de boeuf",
      "boeuf hache 5",
      "boeuf hache 15",
      "boeuf hache 20",
      "mince beef",
      "ground beef"
    ]
  },
  {
    "id": 48,
    "k": "steak de boeuf",
    "name": "Steak de bœuf",
    "cat": "Viandes",
    "aliases": [
      "bavette",
      "rumsteak",
      "fauxfilet",
      "aloyau",
      "filet de boeuf",
      "bifteck",
      "tournedos"
    ]
  },
  {
    "id": 49,
    "k": "roti de boeuf",
    "name": "Rôti de bœuf",
    "cat": "Viandes",
    "aliases": [
      "rosbif",
      "roti boeuf",
      "piece de boeuf rotie",
      "noix de boeuf",
      "tende de tranche"
    ]
  },
  {
    "id": 50,
    "k": "entrecote cote de boeuf",
    "name": "Entrecôte / côte de bœuf",
    "cat": "Viandes",
    "aliases": [
      "entrecote",
      "cote de boeuf",
      "rib steak",
      "ribeye",
      "cote a los"
    ]
  },
  {
    "id": 51,
    "k": "poulet blanc filet",
    "name": "Poulet (blanc / filet)",
    "cat": "Viandes",
    "aliases": [
      "blanc de poulet",
      "filet de poulet",
      "escalope de poulet",
      "poitrine de poulet",
      "chicken breast"
    ]
  },
  {
    "id": 52,
    "k": "poulet cuisse pilon",
    "name": "Poulet (cuisse / pilon)",
    "cat": "Viandes",
    "aliases": [
      "cuisse de poulet",
      "pilon de poulet",
      "haut de cuisse",
      "chicken thigh",
      "chicken drumstick"
    ]
  },
  {
    "id": 53,
    "k": "poulet entier",
    "name": "Poulet entier",
    "cat": "Viandes",
    "aliases": [
      "poulet roti",
      "poulet fermier",
      "volaille entiere",
      "poulet de chair",
      "coquelet"
    ]
  },
  {
    "id": 54,
    "k": "dinde escalope hache",
    "name": "Dinde (escalope / haché)",
    "cat": "Viandes",
    "aliases": [
      "escalope de dinde",
      "blanc de dinde",
      "dinde hachee",
      "filet de dinde",
      "turkey"
    ]
  },
  {
    "id": 55,
    "k": "porc cote filet",
    "name": "Porc (côte / filet)",
    "cat": "Viandes",
    "aliases": [
      "cote de porc",
      "filet de porc",
      "longe de porc",
      "cotelette de porc",
      "porc maigre"
    ]
  },
  {
    "id": 56,
    "k": "porc roti epaule",
    "name": "Porc (rôti / épaule)",
    "cat": "Viandes",
    "aliases": [
      "roti de porc",
      "epaule de porc",
      "palette de porc",
      "porc roti",
      "cochon roti"
    ]
  },
  {
    "id": 57,
    "k": "veau escalope cote",
    "name": "Veau (escalope / côte)",
    "cat": "Viandes",
    "aliases": [
      "escalope de veau",
      "cote de veau",
      "noix de veau",
      "filet de veau",
      "piccata"
    ]
  },
  {
    "id": 58,
    "k": "agneau cotelette gigot",
    "name": "Agneau (côtelette / gigot)",
    "cat": "Viandes",
    "aliases": [
      "gigot dagneau",
      "cotelette dagneau",
      "carre dagneau",
      "epaule dagneau",
      "agneau hache",
      "selle dagneau"
    ]
  },
  {
    "id": 59,
    "k": "canard magret",
    "name": "Canard (magret)",
    "cat": "Viandes",
    "aliases": [
      "magret de canard",
      "filet de canard",
      "magret seche",
      "magret fume"
    ]
  },
  {
    "id": 60,
    "k": "canard confit",
    "name": "Canard (confit)",
    "cat": "Viandes",
    "aliases": [
      "confit de canard",
      "cuisse de canard confite",
      "cuisse confite"
    ]
  },
  {
    "id": 61,
    "k": "lapin",
    "name": "Lapin",
    "cat": "Viandes",
    "aliases": [
      "lapin de garenne",
      "lapin fermier",
      "cuisse de lapin",
      "rable de lapin",
      "lapin en morceaux"
    ]
  },
  {
    "id": 62,
    "k": "foie de volaille",
    "name": "Foie de volaille",
    "cat": "Viandes",
    "aliases": [
      "foie de poulet",
      "foie de canard",
      "foie volaille",
      "abats de volaille"
    ]
  },
  {
    "id": 63,
    "k": "foie de veau boeuf",
    "name": "Foie de veau / bœuf",
    "cat": "Viandes",
    "aliases": [
      "foie de veau",
      "foie de boeuf",
      "foie de genisse",
      "foie gras de veau"
    ]
  },
  {
    "id": 64,
    "k": "lardons",
    "name": "Lardons",
    "cat": "Viandes",
    "aliases": [
      "lardons fumes",
      "lardons nature",
      "poitrine fumee en des",
      "bacon en des",
      "lardons allumettes"
    ]
  },
  {
    "id": 65,
    "k": "abats divers",
    "name": "Abats divers",
    "cat": "Viandes",
    "aliases": [
      "rognons",
      "ris de veau",
      "langue de boeuf",
      "tripes",
      "coeur de boeuf",
      "cervelle",
      "amourettes"
    ]
  },
  {
    "id": 66,
    "k": "jambon blanc cuit",
    "name": "Jambon blanc cuit",
    "cat": "Charcuteries",
    "aliases": [
      "jambon cuit",
      "jambon de paris",
      "jambon superieur",
      "jambon degraisse",
      "jambon tranche"
    ]
  },
  {
    "id": 67,
    "k": "jambon cru sec",
    "name": "Jambon cru / sec",
    "cat": "Charcuteries",
    "aliases": [
      "jambon cru",
      "serrano",
      "prosciutto",
      "jambon de bayonne",
      "jambon iberique",
      "jambon pata negra",
      "jambon de parme",
      "bresaola"
    ]
  },
  {
    "id": 68,
    "k": "bacon poitrine fumee",
    "name": "Bacon / poitrine fumée",
    "cat": "Charcuteries",
    "aliases": [
      "bacon",
      "poitrine fumee",
      "ventreche",
      "lard fume",
      "pancetta"
    ]
  },
  {
    "id": 69,
    "k": "saucisson sec",
    "name": "Saucisson sec",
    "cat": "Charcuteries",
    "aliases": [
      "saucisson",
      "rosette",
      "jesus",
      "saucisson darles",
      "saucisse seche",
      "fuet"
    ]
  },
  {
    "id": 70,
    "k": "chorizo",
    "name": "Chorizo",
    "cat": "Charcuteries",
    "aliases": [
      "chorizo fort",
      "chorizo doux",
      "chorizo espagnol",
      "chorizo piquant",
      "txistorra"
    ]
  },
  {
    "id": 71,
    "k": "salami pepperoni",
    "name": "Salami / Pepperoni",
    "cat": "Charcuteries",
    "aliases": [
      "salami",
      "pepperoni",
      "salame",
      "salami italien",
      "salami hongrois"
    ]
  },
  {
    "id": 72,
    "k": "merguez",
    "name": "Merguez",
    "cat": "Charcuteries",
    "aliases": [
      "merguez dagneau",
      "merguez boeuf",
      "saucisse merguez",
      "saucisse epicee"
    ]
  },
  {
    "id": 73,
    "k": "chipolata saucisse fraiche",
    "name": "Chipolata / saucisse fraîche",
    "cat": "Charcuteries",
    "aliases": [
      "chipolata",
      "saucisse fraiche",
      "saucisse de toulouse",
      "crepinette",
      "saucisse porc"
    ]
  },
  {
    "id": 74,
    "k": "saucisse de francfort",
    "name": "Saucisse de Francfort",
    "cat": "Charcuteries",
    "aliases": [
      "knack",
      "saucisse knack",
      "hotdog",
      "frankfurter",
      "saucisse viennoise",
      "wiener"
    ]
  },
  {
    "id": 75,
    "k": "pate de campagne",
    "name": "Pâté de campagne",
    "cat": "Charcuteries",
    "aliases": [
      "pate",
      "terrine de campagne",
      "terrine maison",
      "pate maison",
      "pate rustique"
    ]
  },
  {
    "id": 76,
    "k": "pate de foie",
    "name": "Pâté de foie",
    "cat": "Charcuteries",
    "aliases": [
      "pate de foie de porc",
      "pate de foie gras",
      "mousse de foie",
      "foie gras"
    ]
  },
  {
    "id": 77,
    "k": "rillettes",
    "name": "Rillettes",
    "cat": "Charcuteries",
    "aliases": [
      "rillettes de porc",
      "rillettes du mans",
      "rillettes de canard",
      "rillettes de saumon",
      "rillettes maison"
    ]
  },
  {
    "id": 78,
    "k": "boudin noir",
    "name": "Boudin noir",
    "cat": "Charcuteries",
    "aliases": [
      "boudin",
      "black pudding",
      "morcilla",
      "boudin antillais"
    ]
  },
  {
    "id": 79,
    "k": "mortadelle",
    "name": "Mortadelle",
    "cat": "Charcuteries",
    "aliases": [
      "mortadella",
      "mortadelle italienne",
      "bologna",
      "saucisson cuit italien"
    ]
  },
  {
    "id": 80,
    "k": "saumon filet",
    "name": "Saumon (filet)",
    "cat": "Poissons",
    "aliases": [
      "filet de saumon",
      "saumon atlantique",
      "saumon frais",
      "pave de saumon",
      "saumon delevage",
      "darne de saumon"
    ]
  },
  {
    "id": 81,
    "k": "saumon fume",
    "name": "Saumon fumé",
    "cat": "Poissons",
    "aliases": [
      "saumon fume norvegien",
      "saumon fume ecossais",
      "saumon froid fume",
      "tranche de saumon fume"
    ]
  },
  {
    "id": 82,
    "k": "thon conserve au naturel",
    "name": "Thon (conserve au naturel)",
    "cat": "Poissons",
    "aliases": [
      "thon nature",
      "thon en boite",
      "thon a leau",
      "thon au naturel",
      "conserve de thon"
    ]
  },
  {
    "id": 83,
    "k": "thon conserve a lhuile",
    "name": "Thon (conserve à l'huile)",
    "cat": "Poissons",
    "aliases": [
      "thon a lhuile",
      "thon huile dolive",
      "thon en boite a lhuile",
      "thon micuit"
    ]
  },
  {
    "id": 84,
    "k": "cabillaud morue",
    "name": "Cabillaud / Morue",
    "cat": "Poissons",
    "aliases": [
      "cabillaud",
      "morue fraiche",
      "morue salee",
      "dos de cabillaud",
      "filet de cabillaud",
      "brandade",
      "cod"
    ]
  },
  {
    "id": 85,
    "k": "lieu noir",
    "name": "Lieu noir",
    "cat": "Poissons",
    "aliases": [
      "filet de lieu noir",
      "lieu",
      "coalfish",
      "colin noir",
      "lieu jaune"
    ]
  },
  {
    "id": 86,
    "k": "dorade daurade",
    "name": "Dorade / Daurade",
    "cat": "Poissons",
    "aliases": [
      "dorade royale",
      "daurade",
      "dorade grise",
      "sparide",
      "sea bream"
    ]
  },
  {
    "id": 87,
    "k": "bar loup",
    "name": "Bar / Loup",
    "cat": "Poissons",
    "aliases": [
      "bar",
      "loup de mer",
      "bar de ligne",
      "sea bass",
      "loup mediterraneen"
    ]
  },
  {
    "id": 88,
    "k": "maquereau filet",
    "name": "Maquereau (filet)",
    "cat": "Poissons",
    "aliases": [
      "maquereau",
      "filet de maquereau",
      "maquereau atlantique",
      "maquereau frais",
      "maquereau de ligne"
    ]
  },
  {
    "id": 89,
    "k": "maquereau fume",
    "name": "Maquereau fumé",
    "cat": "Poissons",
    "aliases": [
      "maquereau fume entier",
      "filet de maquereau fume",
      "maquereau poivre fume"
    ]
  },
  {
    "id": 90,
    "k": "sardines conserve",
    "name": "Sardines (conserve)",
    "cat": "Poissons",
    "aliases": [
      "sardines en boite",
      "sardines a lhuile",
      "sardines au naturel",
      "conserve de sardines"
    ]
  },
  {
    "id": 91,
    "k": "sardines fraiches",
    "name": "Sardines fraîches",
    "cat": "Poissons",
    "aliases": [
      "sardines",
      "petites sardines",
      "sardine de mediterranee",
      "sardine atlantique"
    ]
  },
  {
    "id": 92,
    "k": "hareng",
    "name": "Hareng",
    "cat": "Poissons",
    "aliases": [
      "hareng fume",
      "hareng saur",
      "hareng marine",
      "rollmops",
      "kipper",
      "bouffi"
    ]
  },
  {
    "id": 93,
    "k": "sole",
    "name": "Sole",
    "cat": "Poissons",
    "aliases": [
      "sole meuniere",
      "filet de sole",
      "sole commune",
      "dover sole"
    ]
  },
  {
    "id": 94,
    "k": "merlan colin",
    "name": "Merlan / Colin",
    "cat": "Poissons",
    "aliases": [
      "merlan",
      "colin",
      "filet de merlan",
      "merlu",
      "whiting",
      "hake"
    ]
  },
  {
    "id": 95,
    "k": "truite",
    "name": "Truite",
    "cat": "Poissons",
    "aliases": [
      "truite arcenciel",
      "truite saumonee",
      "truite fumee",
      "filet de truite"
    ]
  },
  {
    "id": 96,
    "k": "tilapia",
    "name": "Tilapia",
    "cat": "Poissons",
    "aliases": [
      "filet de tilapia",
      "tilapia delevage",
      "perche du nil"
    ]
  },
  {
    "id": 97,
    "k": "anchois",
    "name": "Anchois",
    "cat": "Poissons",
    "aliases": [
      "anchois marines",
      "anchois a lhuile",
      "filets danchois",
      "pate danchois",
      "anchoiade"
    ]
  },
  {
    "id": 98,
    "k": "filets panes",
    "name": "Filets panés",
    "cat": "Poissons",
    "aliases": [
      "poisson pane",
      "fish fingers",
      "goujonnettes",
      "batonnets de poisson",
      "fish sticks"
    ]
  },
  {
    "id": 99,
    "k": "crevettes",
    "name": "Crevettes",
    "cat": "Fruits de mer",
    "aliases": [
      "crevettes roses",
      "crevettes grises",
      "gambas",
      "bouquet",
      "crevette decortiquee",
      "shrimp",
      "prawn"
    ]
  },
  {
    "id": 100,
    "k": "moules",
    "name": "Moules",
    "cat": "Fruits de mer",
    "aliases": [
      "moules de bouchot",
      "moules marinieres",
      "moule de zelande",
      "bivalve",
      "mussel"
    ]
  },
  {
    "id": 101,
    "k": "coquilles saintjacques",
    "name": "Coquilles Saint-Jacques",
    "cat": "Fruits de mer",
    "aliases": [
      "saintjacques",
      "noix de saintjacques",
      "petoncle",
      "coquille",
      "scallop"
    ]
  },
  {
    "id": 102,
    "k": "calamars encornets",
    "name": "Calamars / Encornets",
    "cat": "Fruits de mer",
    "aliases": [
      "calamar",
      "encornet",
      "squid",
      "anneaux de calamar",
      "tentacules de calamar",
      "chipirons"
    ]
  },
  {
    "id": 103,
    "k": "crabe",
    "name": "Crabe",
    "cat": "Fruits de mer",
    "aliases": [
      "tourteau",
      "araignee de mer",
      "crabe des neiges",
      "chair de crabe",
      "surimi crabe"
    ]
  },
  {
    "id": 104,
    "k": "huitres",
    "name": "Huîtres",
    "cat": "Fruits de mer",
    "aliases": [
      "huitre creuse",
      "huitre plate",
      "ostreiculture",
      "oyster",
      "huitre de marennes"
    ]
  },
  {
    "id": 105,
    "k": "coques palourdes",
    "name": "Coques / Palourdes",
    "cat": "Fruits de mer",
    "aliases": [
      "coques",
      "palourdes",
      "clams",
      "vongole",
      "clovisses",
      "praires"
    ]
  },
  {
    "id": 106,
    "k": "homard langouste",
    "name": "Homard / Langouste",
    "cat": "Fruits de mer",
    "aliases": [
      "homard breton",
      "langouste",
      "langoustine",
      "lobster",
      "queue de langouste"
    ]
  },
  {
    "id": 107,
    "k": "oeuf de poule",
    "name": "Œuf de poule",
    "cat": "Œufs",
    "aliases": [
      "oeuf",
      "oeuf",
      "oeuf entier",
      "oeuf frais",
      "oeuf de plein air",
      "oeuf bio",
      "oeuf coque",
      "oeuf dur"
    ]
  },
  {
    "id": 108,
    "k": "jaune doeuf",
    "name": "Jaune d'œuf",
    "cat": "Œufs",
    "aliases": [
      "jaune doeuf",
      "jaune",
      "yolk",
      "jaune doeuf frais"
    ]
  },
  {
    "id": 109,
    "k": "blanc doeuf",
    "name": "Blanc d'œuf",
    "cat": "Œufs",
    "aliases": [
      "blanc doeuf",
      "blanc",
      "albumen",
      "egg white",
      "blanc doeuf frais"
    ]
  },
  {
    "id": 110,
    "k": "tomate",
    "name": "Tomate",
    "cat": "Légumes",
    "aliases": [
      "tomate ronde",
      "tomate grappe",
      "tomate cotelee",
      "tomate allongee",
      "tomate roma",
      "tomates fraiches"
    ]
  },
  {
    "id": 111,
    "k": "tomate cerise",
    "name": "Tomate cerise",
    "cat": "Légumes",
    "aliases": [
      "tomates cerises",
      "cherry tomato",
      "tomate cocktail",
      "tomate raisin",
      "mini tomate"
    ]
  },
  {
    "id": 112,
    "k": "tomate pelee conserve",
    "name": "Tomate pelée (conserve)",
    "cat": "Légumes",
    "aliases": [
      "tomates pelees",
      "tomates concassees",
      "tomates en boite",
      "pulpe de tomate",
      "tomates entieres pelees"
    ]
  },
  {
    "id": 113,
    "k": "concombre",
    "name": "Concombre",
    "cat": "Légumes",
    "aliases": [
      "concombre long",
      "concombre mini",
      "cornichon frais",
      "cucurbitacee"
    ]
  },
  {
    "id": 114,
    "k": "courgette",
    "name": "Courgette",
    "cat": "Légumes",
    "aliases": [
      "courgette verte",
      "courgette jaune",
      "zucchini",
      "courgette ronde",
      "baby courgette"
    ]
  },
  {
    "id": 115,
    "k": "aubergine",
    "name": "Aubergine",
    "cat": "Légumes",
    "aliases": [
      "aubergine violette",
      "aubergine blanche",
      "eggplant",
      "brinjal",
      "melanzane"
    ]
  },
  {
    "id": 116,
    "k": "poivron rouge",
    "name": "Poivron rouge",
    "cat": "Légumes",
    "aliases": [
      "poivron rouge mur",
      "red pepper",
      "pimiento rojo",
      "capsicum rouge"
    ]
  },
  {
    "id": 117,
    "k": "poivron vert",
    "name": "Poivron vert",
    "cat": "Légumes",
    "aliases": [
      "poivron vert",
      "green pepper",
      "pimiento verde",
      "capsicum vert"
    ]
  },
  {
    "id": 118,
    "k": "poivron jaune",
    "name": "Poivron jaune",
    "cat": "Légumes",
    "aliases": [
      "poivron jaune",
      "yellow pepper",
      "capsicum jaune"
    ]
  },
  {
    "id": 119,
    "k": "carotte",
    "name": "Carotte",
    "cat": "Légumes",
    "aliases": [
      "carotte orange",
      "carotte de sable",
      "carotte fane",
      "carotte botte",
      "carottes rapees"
    ]
  },
  {
    "id": 120,
    "k": "brocoli",
    "name": "Brocoli",
    "cat": "Légumes",
    "aliases": [
      "brocolis",
      "tete de brocoli",
      "brocoli vert",
      "broccoli",
      "fleurettes de brocoli"
    ]
  },
  {
    "id": 121,
    "k": "choufleur",
    "name": "Chou-fleur",
    "cat": "Légumes",
    "aliases": [
      "choufleur",
      "cauliflower",
      "fleurettes de choufleur",
      "tete de choufleur",
      "choufleur blanc"
    ]
  },
  {
    "id": 122,
    "k": "chou blanc",
    "name": "Chou blanc",
    "cat": "Légumes",
    "aliases": [
      "chou cabus",
      "chou pomme blanc",
      "white cabbage",
      "chou en chiffonnade"
    ]
  },
  {
    "id": 123,
    "k": "chou rouge",
    "name": "Chou rouge",
    "cat": "Légumes",
    "aliases": [
      "chou rouge pomme",
      "red cabbage",
      "chou violet",
      "chou lactofermente rouge"
    ]
  },
  {
    "id": 124,
    "k": "chou de bruxelles",
    "name": "Chou de Bruxelles",
    "cat": "Légumes",
    "aliases": [
      "choux de bruxelles",
      "brussels sprouts",
      "minichoux",
      "chou de bruxelles surgele"
    ]
  },
  {
    "id": 125,
    "k": "epinards",
    "name": "Épinards",
    "cat": "Légumes",
    "aliases": [
      "epinards frais",
      "epinards en branches",
      "epinards surgeles",
      "pousses depinard",
      "spinach",
      "feuilles depinard"
    ]
  },
  {
    "id": 126,
    "k": "salade verte laitue",
    "name": "Salade verte (laitue)",
    "cat": "Légumes",
    "aliases": [
      "laitue",
      "salade",
      "salade verte",
      "feuille de chene",
      "batavia",
      "iceberg",
      "romaine",
      "sucrine"
    ]
  },
  {
    "id": 127,
    "k": "roquette",
    "name": "Roquette",
    "cat": "Légumes",
    "aliases": [
      "rucola",
      "arugula",
      "salade roquette",
      "roquette sauvage",
      "eruca"
    ]
  },
  {
    "id": 128,
    "k": "mache",
    "name": "Mâche",
    "cat": "Légumes",
    "aliases": [
      "salade mache",
      "doucette",
      "valerianelle",
      "lambs lettuce"
    ]
  },
  {
    "id": 129,
    "k": "endive",
    "name": "Endive",
    "cat": "Légumes",
    "aliases": [
      "chicon",
      "witloof",
      "endive belge",
      "chicoree witloof",
      "belgian endive"
    ]
  },
  {
    "id": 130,
    "k": "fenouil",
    "name": "Fenouil",
    "cat": "Légumes",
    "aliases": [
      "bulbe de fenouil",
      "fenouil florence",
      "aneth doux",
      "finocchio",
      "fennel"
    ]
  },
  {
    "id": 131,
    "k": "celeri branche",
    "name": "Céleri branche",
    "cat": "Légumes",
    "aliases": [
      "celeri",
      "branche de celeri",
      "celery",
      "celeri a cotes",
      "celeri vert"
    ]
  },
  {
    "id": 132,
    "k": "celeri rave",
    "name": "Céleri rave",
    "cat": "Légumes",
    "aliases": [
      "celerirave",
      "celeriac",
      "boule de celeri",
      "celeri tubereux",
      "remoulade"
    ]
  },
  {
    "id": 133,
    "k": "poireau",
    "name": "Poireau",
    "cat": "Légumes",
    "aliases": [
      "poireaux",
      "blanc de poireau",
      "vert de poireau",
      "leek",
      "poireau de gennevilliers"
    ]
  },
  {
    "id": 134,
    "k": "oignon",
    "name": "Oignon",
    "cat": "Légumes",
    "aliases": [
      "oignon jaune",
      "oignon blanc",
      "oignon de pays",
      "oignon hache",
      "oignon emince",
      "oignon doux des cevennes"
    ]
  },
  {
    "id": 135,
    "k": "oignon rouge",
    "name": "Oignon rouge",
    "cat": "Légumes",
    "aliases": [
      "oignon violet",
      "oignon rouge de toulouges",
      "red onion",
      "oignon cru rouge"
    ]
  },
  {
    "id": 136,
    "k": "echalote",
    "name": "Échalote",
    "cat": "Légumes",
    "aliases": [
      "echalote grise",
      "echalote de jersey",
      "shallot",
      "echalote francaise",
      "ciboule"
    ]
  },
  {
    "id": 137,
    "k": "ail",
    "name": "Ail",
    "cat": "Légumes",
    "aliases": [
      "gousse dail",
      "ail blanc",
      "ail rose",
      "ail violet",
      "ail des ours",
      "ail hache",
      "ail en poudre",
      "garlic"
    ]
  },
  {
    "id": 138,
    "k": "champignon de paris",
    "name": "Champignon de Paris",
    "cat": "Légumes",
    "aliases": [
      "champignon blanc",
      "button mushroom",
      "champignon emince",
      "champignon de couche",
      "agaric"
    ]
  },
  {
    "id": 139,
    "k": "champignon varietes",
    "name": "Champignon (variétés)",
    "cat": "Légumes",
    "aliases": [
      "shiitake",
      "pleurote",
      "girolle",
      "chanterelle",
      "cepe",
      "porcini",
      "morille",
      "champignons des bois",
      "champignons seches",
      "champignons forestiers"
    ]
  },
  {
    "id": 140,
    "k": "asperge",
    "name": "Asperge",
    "cat": "Légumes",
    "aliases": [
      "asperge blanche",
      "asperge verte",
      "asperge violette",
      "pointe dasperge",
      "asparagus"
    ]
  },
  {
    "id": 141,
    "k": "haricot vert",
    "name": "Haricot vert",
    "cat": "Légumes",
    "aliases": [
      "haricots verts",
      "haricot extrafin",
      "bobby beans",
      "green beans",
      "haricot mangetout",
      "haricot plat"
    ]
  },
  {
    "id": 142,
    "k": "petit pois",
    "name": "Petit pois",
    "cat": "Légumes",
    "aliases": [
      "petits pois",
      "pois",
      "pois frais",
      "pois surgeles",
      "pois de senteur",
      "garden peas"
    ]
  },
  {
    "id": 143,
    "k": "mais grain",
    "name": "Maïs (grain)",
    "cat": "Légumes",
    "aliases": [
      "mais doux",
      "grains de mais",
      "mais en boite",
      "corn",
      "mais surgele",
      "mais cuit"
    ]
  },
  {
    "id": 144,
    "k": "artichaut",
    "name": "Artichaut",
    "cat": "Légumes",
    "aliases": [
      "fond dartichaut",
      "coeur dartichaut",
      "artichaut breton",
      "artichaut violet",
      "artichoke"
    ]
  },
  {
    "id": 145,
    "k": "betterave rouge",
    "name": "Betterave rouge",
    "cat": "Légumes",
    "aliases": [
      "betterave",
      "betterave cuite",
      "betteraves rouges",
      "beet",
      "beet root",
      "betterave chioggia"
    ]
  },
  {
    "id": 146,
    "k": "radis",
    "name": "Radis",
    "cat": "Légumes",
    "aliases": [
      "radis rose",
      "radis rouge",
      "radis blanc",
      "radis noir",
      "daikon",
      "raphanus"
    ]
  },
  {
    "id": 147,
    "k": "navet",
    "name": "Navet",
    "cat": "Légumes",
    "aliases": [
      "navet blanc",
      "navet de nancy",
      "turnip",
      "navet long",
      "navet rond"
    ]
  },
  {
    "id": 148,
    "k": "panais",
    "name": "Panais",
    "cat": "Légumes",
    "aliases": [
      "panais blanc",
      "parsnip",
      "racine de panais"
    ]
  },
  {
    "id": 149,
    "k": "rhubarbe",
    "name": "Rhubarbe",
    "cat": "Légumes",
    "aliases": [
      "tige de rhubarbe",
      "rhubarbe fraiche",
      "rhubarbe a confiture",
      "rhubarb"
    ]
  },
  {
    "id": 150,
    "k": "blette bette a carde",
    "name": "Blette / Bette à carde",
    "cat": "Légumes",
    "aliases": [
      "blettes",
      "bettes",
      "cotes de blettes",
      "chard",
      "bette a carde",
      "swiss chard"
    ]
  },
  {
    "id": 151,
    "k": "potiron courge butternut",
    "name": "Potiron / Courge butternut",
    "cat": "Légumes",
    "aliases": [
      "butternut",
      "potiron",
      "courge",
      "pumpkin",
      "squash",
      "courge musquee",
      "giraumon",
      "jack be little"
    ]
  },
  {
    "id": 152,
    "k": "potimarron",
    "name": "Potimarron",
    "cat": "Légumes",
    "aliases": [
      "potimarron rouge",
      "courge hokkaido",
      "red kuri squash",
      "courge japonaise"
    ]
  },
  {
    "id": 153,
    "k": "avocat",
    "name": "Avocat",
    "cat": "Légumes",
    "aliases": [
      "avocat hass",
      "avocat florida",
      "avocat mur",
      "avocado",
      "avocat a point",
      "guacamole"
    ]
  },
  {
    "id": 154,
    "k": "pak choi",
    "name": "Pak choï",
    "cat": "Légumes",
    "aliases": [
      "bok choy",
      "pak choi",
      "chou chinois",
      "bette chinoise",
      "chou de shanghai"
    ]
  },
  {
    "id": 155,
    "k": "gingembre frais",
    "name": "Gingembre frais",
    "cat": "Légumes",
    "aliases": [
      "racine de gingembre",
      "gingembre",
      "ginger",
      "gingembre rape",
      "rhizome de gingembre"
    ]
  },
  {
    "id": 156,
    "k": "piment frais",
    "name": "Piment frais",
    "cat": "Légumes",
    "aliases": [
      "piment rouge",
      "piment vert",
      "piment oiseau",
      "chili frais",
      "jalapeno",
      "serrano",
      "piment fort"
    ]
  },
  {
    "id": 157,
    "k": "olives",
    "name": "Olives",
    "cat": "Légumes",
    "aliases": [
      "olives noires",
      "olives vertes",
      "olives kalamata",
      "olives denoyautees",
      "tapenade"
    ]
  },
  {
    "id": 158,
    "k": "cornichon",
    "name": "Cornichon",
    "cat": "Légumes",
    "aliases": [
      "cornichons au vinaigre",
      "petit cornichon",
      "gherkin",
      "cornichon malossol",
      "pickle"
    ]
  },
  {
    "id": 159,
    "k": "capres",
    "name": "Câpres",
    "cat": "Légumes",
    "aliases": [
      "capres au vinaigre",
      "capres en saumure",
      "caprons",
      "capers"
    ]
  },
  {
    "id": 160,
    "k": "coeur de palmier",
    "name": "Cœur de palmier",
    "cat": "Légumes",
    "aliases": [
      "coeurs de palmier",
      "palmito",
      "heart of palm",
      "palm heart"
    ]
  },
  {
    "id": 161,
    "k": "broccolini romanesco",
    "name": "Broccolini / Romanesco",
    "cat": "Légumes",
    "aliases": [
      "broccolini",
      "romanesco",
      "chou romanesco",
      "brocoli tige",
      "tenderstem",
      "choufleur romanesco"
    ]
  },
  {
    "id": 162,
    "k": "pomme",
    "name": "Pomme",
    "cat": "Fruits",
    "aliases": [
      "pomme golden",
      "pomme granny smith",
      "pomme fuji",
      "pomme pink lady",
      "pomme gala",
      "pomme cox",
      "pomme de terre sucree"
    ]
  },
  {
    "id": 163,
    "k": "poire",
    "name": "Poire",
    "cat": "Fruits",
    "aliases": [
      "poire william",
      "poire conference",
      "poire bosc",
      "poire comice",
      "poire bartlett"
    ]
  },
  {
    "id": 164,
    "k": "banane",
    "name": "Banane",
    "cat": "Fruits",
    "aliases": [
      "banane jaune",
      "banane mure",
      "banana",
      "banane cavendish",
      "banane des antilles"
    ]
  },
  {
    "id": 165,
    "k": "orange",
    "name": "Orange",
    "cat": "Fruits",
    "aliases": [
      "orange navel",
      "orange sanguine",
      "orange valencia",
      "jus dorange",
      "oranges fraiches"
    ]
  },
  {
    "id": 166,
    "k": "citron",
    "name": "Citron",
    "cat": "Fruits",
    "aliases": [
      "citron jaune",
      "citron de menton",
      "lemon",
      "jus de citron",
      "zeste de citron",
      "citron non traite"
    ]
  },
  {
    "id": 167,
    "k": "citron vert",
    "name": "Citron vert",
    "cat": "Fruits",
    "aliases": [
      "lime",
      "citron vert tahiti",
      "jus de citron vert",
      "zeste de citron vert",
      "kaffir lime"
    ]
  },
  {
    "id": 168,
    "k": "pamplemousse",
    "name": "Pamplemousse",
    "cat": "Fruits",
    "aliases": [
      "pomelo",
      "grapefruit",
      "pamplemousse rose",
      "pamplemousse jaune",
      "pomelo"
    ]
  },
  {
    "id": 169,
    "k": "mandarine clementine",
    "name": "Mandarine / Clémentine",
    "cat": "Fruits",
    "aliases": [
      "clementine",
      "mandarine",
      "tangerine",
      "clementine de corse",
      "satsuma"
    ]
  },
  {
    "id": 170,
    "k": "raisin blanc",
    "name": "Raisin blanc",
    "cat": "Fruits",
    "aliases": [
      "raisin vert",
      "raisin muscat blanc",
      "raisin chasselas",
      "grapes"
    ]
  },
  {
    "id": 171,
    "k": "raisin noir",
    "name": "Raisin noir",
    "cat": "Fruits",
    "aliases": [
      "raisin rouge",
      "raisin muscat noir",
      "raisin cardinal",
      "red grapes"
    ]
  },
  {
    "id": 172,
    "k": "fraise",
    "name": "Fraise",
    "cat": "Fruits",
    "aliases": [
      "fraises",
      "fraise gariguette",
      "fraise mara des bois",
      "fraise charlotte",
      "strawberry",
      "fraise de plein champ"
    ]
  },
  {
    "id": 173,
    "k": "framboise",
    "name": "Framboise",
    "cat": "Fruits",
    "aliases": [
      "framboises",
      "framboise fraiche",
      "raspberry",
      "framboise surgelee"
    ]
  },
  {
    "id": 174,
    "k": "myrtille",
    "name": "Myrtille",
    "cat": "Fruits",
    "aliases": [
      "myrtilles",
      "blueberry",
      "airelle noire",
      "bilberry",
      "myrtille sauvage"
    ]
  },
  {
    "id": 175,
    "k": "cerise",
    "name": "Cerise",
    "cat": "Fruits",
    "aliases": [
      "cerises",
      "bigarreau",
      "griotte",
      "cerise noire",
      "cherry",
      "cerise fraiche"
    ]
  },
  {
    "id": 176,
    "k": "peche nectarine",
    "name": "Pêche / Nectarine",
    "cat": "Fruits",
    "aliases": [
      "peche",
      "nectarine",
      "brugnon",
      "peche blanche",
      "peche jaune",
      "peach"
    ]
  },
  {
    "id": 177,
    "k": "abricot",
    "name": "Abricot",
    "cat": "Fruits",
    "aliases": [
      "abricots",
      "abricot bergeron",
      "apricot",
      "abricot frais"
    ]
  },
  {
    "id": 178,
    "k": "prune",
    "name": "Prune",
    "cat": "Fruits",
    "aliases": [
      "prunes",
      "quetsche",
      "mirabelle",
      "reineclaude",
      "plum",
      "prune dagen"
    ]
  },
  {
    "id": 179,
    "k": "figue",
    "name": "Figue",
    "cat": "Fruits",
    "aliases": [
      "figues fraiches",
      "figue violette",
      "figue blanche",
      "fig",
      "figue de barbarie"
    ]
  },
  {
    "id": 180,
    "k": "kiwi",
    "name": "Kiwi",
    "cat": "Fruits",
    "aliases": [
      "kiwi vert",
      "kiwi jaune",
      "kiwi gold",
      "actinidia",
      "zespri"
    ]
  },
  {
    "id": 181,
    "k": "mangue",
    "name": "Mangue",
    "cat": "Fruits",
    "aliases": [
      "mangue fraiche",
      "mangue ataulfo",
      "mangue alphonso",
      "mango",
      "mangue tommy"
    ]
  },
  {
    "id": 182,
    "k": "ananas",
    "name": "Ananas",
    "cat": "Fruits",
    "aliases": [
      "ananas frais",
      "ananas en conserve",
      "ananas victoria",
      "pineapple",
      "ananas tranche"
    ]
  },
  {
    "id": 183,
    "k": "pasteque",
    "name": "Pastèque",
    "cat": "Fruits",
    "aliases": [
      "pasteque rouge",
      "melon deau",
      "watermelon",
      "pasteque sans pepins"
    ]
  },
  {
    "id": 184,
    "k": "melon",
    "name": "Melon",
    "cat": "Fruits",
    "aliases": [
      "melon charentais",
      "melon jaune",
      "melon brode",
      "cantaloupe",
      "honeydew",
      "gallia"
    ]
  },
  {
    "id": 185,
    "k": "noix de coco",
    "name": "Noix de coco",
    "cat": "Fruits",
    "aliases": [
      "noix de coco fraiche",
      "chair de coco",
      "coco rapee",
      "coconut",
      "noix de coco sechee"
    ]
  },
  {
    "id": 186,
    "k": "fruit de la passion",
    "name": "Fruit de la passion",
    "cat": "Fruits",
    "aliases": [
      "maracuja",
      "passion fruit",
      "grenadille",
      "fruit passion",
      "pulpe de passion"
    ]
  },
  {
    "id": 187,
    "k": "litchi",
    "name": "Litchi",
    "cat": "Fruits",
    "aliases": [
      "lychee",
      "litchis",
      "letchi",
      "lichi"
    ]
  },
  {
    "id": 188,
    "k": "grenade",
    "name": "Grenade",
    "cat": "Fruits",
    "aliases": [
      "grenade rouge",
      "arilles de grenade",
      "pomegranate",
      "grains de grenade"
    ]
  },
  {
    "id": 189,
    "k": "papaye",
    "name": "Papaye",
    "cat": "Fruits",
    "aliases": [
      "papaye fraiche",
      "papaye verte",
      "pawpaw",
      "papaye tropicale"
    ]
  },
  {
    "id": 190,
    "k": "datte",
    "name": "Datte",
    "cat": "Fruits",
    "aliases": [
      "dattes fraiches",
      "dattes medjool",
      "dattes deglet nour",
      "date fruit"
    ]
  },
  {
    "id": 191,
    "k": "pruneaux",
    "name": "Pruneaux",
    "cat": "Fruits",
    "aliases": [
      "pruneau dagen",
      "pruneaux secs",
      "prune sechee",
      "dried plum"
    ]
  },
  {
    "id": 192,
    "k": "raisins secs",
    "name": "Raisins secs",
    "cat": "Fruits",
    "aliases": [
      "raisins de corinthe",
      "sultanes",
      "sultanines",
      "raisins dores",
      "dried grapes",
      "currants"
    ]
  },
  {
    "id": 193,
    "k": "abricots secs",
    "name": "Abricots secs",
    "cat": "Fruits",
    "aliases": [
      "abricot deshydrate",
      "abricot seche",
      "dried apricots",
      "abricots moelleux"
    ]
  },
  {
    "id": 194,
    "k": "figues sechees",
    "name": "Figues séchées",
    "cat": "Fruits",
    "aliases": [
      "figue seche",
      "figues deshydratees",
      "dried figs"
    ]
  },
  {
    "id": 195,
    "k": "cranberry airelle",
    "name": "Cranberry / Airelle",
    "cat": "Fruits",
    "aliases": [
      "cranberry",
      "airelle rouge",
      "canneberge",
      "cranberries sechees",
      "airelle americaine"
    ]
  },
  {
    "id": 196,
    "k": "mure",
    "name": "Mûre",
    "cat": "Fruits",
    "aliases": [
      "mures sauvages",
      "mure de ronce",
      "blackberry",
      "mure de bourgogne"
    ]
  },
  {
    "id": 197,
    "k": "groseille",
    "name": "Groseille",
    "cat": "Fruits",
    "aliases": [
      "groseille rouge",
      "groseille a maquereau",
      "cassis",
      "redcurrant",
      "blackcurrant"
    ]
  },
  {
    "id": 198,
    "k": "banane plantain",
    "name": "Banane plantain",
    "cat": "Fruits",
    "aliases": [
      "plantain",
      "banane a cuire",
      "banane verte",
      "alloco",
      "tostones"
    ]
  },
  {
    "id": 199,
    "k": "lentilles vertes",
    "name": "Lentilles vertes",
    "cat": "Légumineuses",
    "aliases": [
      "lentilles",
      "lentilles du puy",
      "lentilles blondes",
      "lentilles beluga",
      "green lentils"
    ]
  },
  {
    "id": 200,
    "k": "lentilles corail",
    "name": "Lentilles corail",
    "cat": "Légumineuses",
    "aliases": [
      "lentilles rouges",
      "red lentils",
      "lentilles oranges",
      "masoor dal"
    ]
  },
  {
    "id": 201,
    "k": "pois chiches",
    "name": "Pois chiches",
    "cat": "Légumineuses",
    "aliases": [
      "chickpeas",
      "garbanzo",
      "pois chiche en boite",
      "houmous",
      "ceci",
      "pois chiches cuits"
    ]
  },
  {
    "id": 202,
    "k": "haricots blancs",
    "name": "Haricots blancs",
    "cat": "Légumineuses",
    "aliases": [
      "haricots cocos",
      "lingots",
      "navy beans",
      "white beans",
      "haricots tarbais",
      "flageolets"
    ]
  },
  {
    "id": 203,
    "k": "haricots rouges",
    "name": "Haricots rouges",
    "cat": "Légumineuses",
    "aliases": [
      "red kidney beans",
      "haricots rouges en boite",
      "kidney beans",
      "haricots a la mexicaine"
    ]
  },
  {
    "id": 204,
    "k": "haricots noirs",
    "name": "Haricots noirs",
    "cat": "Légumineuses",
    "aliases": [
      "black beans",
      "haricots noirs mexicains",
      "frijoles negros",
      "turtle beans"
    ]
  },
  {
    "id": 205,
    "k": "pois casses",
    "name": "Pois cassés",
    "cat": "Légumineuses",
    "aliases": [
      "pois casses jaunes",
      "pois casses verts",
      "split peas",
      "puree de pois"
    ]
  },
  {
    "id": 206,
    "k": "feves",
    "name": "Fèves",
    "cat": "Légumineuses",
    "aliases": [
      "feves fraiches",
      "feves seches",
      "broad beans",
      "feve de marais",
      "ful medames"
    ]
  },
  {
    "id": 207,
    "k": "edamame soja vert",
    "name": "Edamame / Soja vert",
    "cat": "Légumineuses",
    "aliases": [
      "edamame",
      "soja vert",
      "feve de soja",
      "green soybeans",
      "mukimame"
    ]
  },
  {
    "id": 208,
    "k": "pomme de terre",
    "name": "Pomme de terre",
    "cat": "Tubercules",
    "aliases": [
      "patate",
      "pommes de terre",
      "charlotte",
      "bintje",
      "ratte",
      "agata",
      "potato",
      "spud",
      "vapeur",
      "puree",
      "frites"
    ]
  },
  {
    "id": 209,
    "k": "patate douce",
    "name": "Patate douce",
    "cat": "Tubercules",
    "aliases": [
      "sweet potato",
      "patate douce orange",
      "patate douce violette",
      "batata",
      "camote"
    ]
  },
  {
    "id": 210,
    "k": "manioc",
    "name": "Manioc",
    "cat": "Tubercules",
    "aliases": [
      "cassava",
      "yuca",
      "tapioca",
      "farine de manioc",
      "racine de manioc"
    ]
  },
  {
    "id": 211,
    "k": "topinambour",
    "name": "Topinambour",
    "cat": "Tubercules",
    "aliases": [
      "jerusalem artichoke",
      "artichaut de jerusalem",
      "soleil vivace",
      "poire de terre"
    ]
  },
  {
    "id": 212,
    "k": "igname",
    "name": "Igname",
    "cat": "Tubercules",
    "aliases": [
      "yam",
      "igname blanc",
      "igname violet",
      "tubercule africain"
    ]
  },
  {
    "id": 213,
    "k": "pates blanches",
    "name": "Pâtes blanches",
    "cat": "Féculents & céréales",
    "aliases": [
      "spaghetti",
      "penne",
      "tagliatelles",
      "fusilli",
      "farfalle",
      "rigatoni",
      "macaroni",
      "linguine",
      "fettuccine",
      "pates",
      "vermicelles",
      "capellini",
      "orecchiette",
      "conchiglie"
    ]
  },
  {
    "id": 214,
    "k": "pates completes",
    "name": "Pâtes complètes",
    "cat": "Féculents & céréales",
    "aliases": [
      "pates de ble complet",
      "spaghetti complets",
      "penne completes",
      "whole wheat pasta",
      "pates integrales"
    ]
  },
  {
    "id": 215,
    "k": "pates aux oeufs",
    "name": "Pâtes aux œufs",
    "cat": "Féculents & céréales",
    "aliases": [
      "tagliatelles aux oeufs",
      "pappardelle",
      "pates fraiches",
      "egg pasta",
      "pates jaunes"
    ]
  },
  {
    "id": 216,
    "k": "pates sans gluten",
    "name": "Pâtes sans gluten",
    "cat": "Féculents & céréales",
    "aliases": [
      "pates de riz",
      "pates de mais",
      "pates gluten free",
      "pasta sans gluten",
      "pates coeliaques"
    ]
  },
  {
    "id": 217,
    "k": "riz blanc",
    "name": "Riz blanc",
    "cat": "Féculents & céréales",
    "aliases": [
      "riz",
      "riz long grain",
      "riz a grains longs",
      "riz cuit",
      "white rice",
      "riz etuve"
    ]
  },
  {
    "id": 218,
    "k": "riz complet",
    "name": "Riz complet",
    "cat": "Féculents & céréales",
    "aliases": [
      "riz brun",
      "brown rice",
      "riz integral",
      "riz semicomplet",
      "whole grain rice"
    ]
  },
  {
    "id": 219,
    "k": "riz basmati",
    "name": "Riz basmati",
    "cat": "Féculents & céréales",
    "aliases": [
      "basmati",
      "riz indien",
      "riz parfume",
      "basmati blanc",
      "riz a curry"
    ]
  },
  {
    "id": 220,
    "k": "riz risotto arborio",
    "name": "Riz risotto (Arborio)",
    "cat": "Féculents & céréales",
    "aliases": [
      "arborio",
      "carnaroli",
      "vialone nano",
      "riz a risotto",
      "riz italien"
    ]
  },
  {
    "id": 221,
    "k": "semoule couscous",
    "name": "Semoule / Couscous",
    "cat": "Féculents & céréales",
    "aliases": [
      "couscous",
      "semoule de ble",
      "semoule fine",
      "semoule moyenne",
      "semoule grosse",
      "couscous precuit"
    ]
  },
  {
    "id": 222,
    "k": "quinoa",
    "name": "Quinoa",
    "cat": "Féculents & céréales",
    "aliases": [
      "quinoa blanc",
      "quinoa rouge",
      "quinoa noir",
      "quinoa tricolore",
      "quinoa cuit"
    ]
  },
  {
    "id": 223,
    "k": "polenta",
    "name": "Polenta",
    "cat": "Féculents & céréales",
    "aliases": [
      "polenta instantanee",
      "farine de mais jaune",
      "polenta precuite",
      "polenta italienne",
      "cornmeal"
    ]
  },
  {
    "id": 224,
    "k": "boulgour ble",
    "name": "Boulgour / Blé",
    "cat": "Féculents & céréales",
    "aliases": [
      "boulgour",
      "bulgur",
      "ble concasse",
      "ble dur",
      "taboule",
      "freekeh",
      "epeautre"
    ]
  },
  {
    "id": 225,
    "k": "sarrasin",
    "name": "Sarrasin",
    "cat": "Féculents & céréales",
    "aliases": [
      "sarrasin decortique",
      "ble noir",
      "kasha",
      "buckwheat",
      "gruau de sarrasin"
    ]
  },
  {
    "id": 226,
    "k": "flocons davoine",
    "name": "Flocons d'avoine",
    "cat": "Féculents & céréales",
    "aliases": [
      "avoine",
      "rolled oats",
      "oats",
      "porridge",
      "muesli base",
      "flocons fins",
      "flocons epais",
      "gruau davoine"
    ]
  },
  {
    "id": 227,
    "k": "orge orge perle",
    "name": "Orge / Orge perlé",
    "cat": "Féculents & céréales",
    "aliases": [
      "orge perle",
      "orge monde",
      "pearl barley",
      "barley",
      "orge cuit"
    ]
  },
  {
    "id": 228,
    "k": "millet",
    "name": "Millet",
    "cat": "Féculents & céréales",
    "aliases": [
      "millet decortique",
      "millet jaune",
      "millet blanc",
      "cereale millet"
    ]
  },
  {
    "id": 229,
    "k": "pain blanc baguette campagne",
    "name": "Pain blanc (baguette / campagne)",
    "cat": "Pains & biscottes",
    "aliases": [
      "baguette",
      "pain de campagne",
      "pain blanc",
      "pain ordinaire",
      "pain tradition",
      "ficelle",
      "pain boulanger"
    ]
  },
  {
    "id": 230,
    "k": "pain de mie blanc",
    "name": "Pain de mie blanc",
    "cat": "Pains & biscottes",
    "aliases": [
      "pain de mie",
      "sandwich bread",
      "pain americain",
      "pain toast",
      "pain en tranches"
    ]
  },
  {
    "id": 231,
    "k": "pain complet aux cereales",
    "name": "Pain complet / aux céréales",
    "cat": "Pains & biscottes",
    "aliases": [
      "pain complet",
      "pain aux cereales",
      "pain de ble complet",
      "pain multicereales",
      "wholemeal bread",
      "pain integral"
    ]
  },
  {
    "id": 232,
    "k": "pain de seigle",
    "name": "Pain de seigle",
    "cat": "Pains & biscottes",
    "aliases": [
      "pain au seigle",
      "rye bread",
      "pumpernickel",
      "pain nordique",
      "knackebrod"
    ]
  },
  {
    "id": 233,
    "k": "pain sans gluten",
    "name": "Pain sans gluten",
    "cat": "Pains & biscottes",
    "aliases": [
      "pain gluten free",
      "pain coeliaques",
      "pain de riz",
      "pain sans gluten tranche"
    ]
  },
  {
    "id": 234,
    "k": "pain pita naan",
    "name": "Pain pita / naan",
    "cat": "Pains & biscottes",
    "aliases": [
      "pita",
      "naan",
      "pain libanais",
      "pain plat",
      "flatbread",
      "tortilla de ble",
      "wrap",
      "lavash"
    ]
  },
  {
    "id": 235,
    "k": "biscottes",
    "name": "Biscottes",
    "cat": "Pains & biscottes",
    "aliases": [
      "biscotte complete",
      "tartine grillee",
      "zwiebach",
      "toast grille"
    ]
  },
  {
    "id": 236,
    "k": "crackers pain craquant",
    "name": "Crackers / Pain craquant",
    "cat": "Pains & biscottes",
    "aliases": [
      "crackers",
      "pain craquant",
      "crispbread",
      "galette de riz",
      "wasa",
      "ryvita"
    ]
  },
  {
    "id": 237,
    "k": "chapelure panure",
    "name": "Chapelure / Panure",
    "cat": "Pains & biscottes",
    "aliases": [
      "chapelure",
      "panure",
      "breadcrumbs",
      "panko",
      "chapelure maison",
      "croutons"
    ]
  },
  {
    "id": 238,
    "k": "beurre doux",
    "name": "Beurre doux",
    "cat": "Matières grasses",
    "aliases": [
      "beurre",
      "beurre de cuisine",
      "beurre de qualite",
      "sweet butter",
      "beurre frais",
      "beurre fondu",
      "noix de beurre"
    ]
  },
  {
    "id": 239,
    "k": "beurre demisel",
    "name": "Beurre demi-sel",
    "cat": "Matières grasses",
    "aliases": [
      "beurre sale",
      "beurre breton",
      "beurre de baratte",
      "salted butter"
    ]
  },
  {
    "id": 240,
    "k": "beurre allege",
    "name": "Beurre allégé",
    "cat": "Matières grasses",
    "aliases": [
      "beurre leger",
      "beurre light",
      "beurre 41",
      "beurre reduit en graisses"
    ]
  },
  {
    "id": 241,
    "k": "ghee",
    "name": "Ghee",
    "cat": "Matières grasses",
    "aliases": [
      "beurre clarifie",
      "ghee indien",
      "beurre purifie",
      "clarified butter",
      "samn"
    ]
  },
  {
    "id": 242,
    "k": "margarine",
    "name": "Margarine",
    "cat": "Matières grasses",
    "aliases": [
      "margarine vegetale",
      "matiere grasse vegetale",
      "flora",
      "margarine allegee"
    ]
  },
  {
    "id": 243,
    "k": "huile dolive",
    "name": "Huile d'olive",
    "cat": "Matières grasses",
    "aliases": [
      "huile dolive vierge",
      "huile dolive extra vierge",
      "evoo",
      "huile olive",
      "olive oil"
    ]
  },
  {
    "id": 244,
    "k": "huile de tournesol",
    "name": "Huile de tournesol",
    "cat": "Matières grasses",
    "aliases": [
      "huile vegetale",
      "huile neutre",
      "sunflower oil",
      "huile de friture"
    ]
  },
  {
    "id": 245,
    "k": "huile de colza",
    "name": "Huile de colza",
    "cat": "Matières grasses",
    "aliases": [
      "huile de colza",
      "rapeseed oil",
      "canola oil",
      "huile colza vierge"
    ]
  },
  {
    "id": 246,
    "k": "huile de noix",
    "name": "Huile de noix",
    "cat": "Matières grasses",
    "aliases": [
      "huile de noix vierge",
      "walnut oil",
      "huile de noix premiere pression"
    ]
  },
  {
    "id": 247,
    "k": "huile de coco",
    "name": "Huile de coco",
    "cat": "Matières grasses",
    "aliases": [
      "huile de noix de coco",
      "coconut oil",
      "huile coco vierge",
      "huile de coprah"
    ]
  },
  {
    "id": 248,
    "k": "saindoux",
    "name": "Saindoux",
    "cat": "Matières grasses",
    "aliases": [
      "graisse de porc",
      "lard",
      "lard fondu",
      "graisse de canard",
      "schmaltz"
    ]
  },
  {
    "id": 249,
    "k": "amandes",
    "name": "Amandes",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "amande entiere",
      "amande effilee",
      "amande en poudre",
      "poudre damande",
      "almonds",
      "amande grillee"
    ]
  },
  {
    "id": 250,
    "k": "noisettes",
    "name": "Noisettes",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "noisette entiere",
      "noisette grillee",
      "hazelnuts",
      "praline noisette",
      "poudre de noisette"
    ]
  },
  {
    "id": 251,
    "k": "noix",
    "name": "Noix",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "noix de grenoble",
      "cerneaux de noix",
      "walnuts",
      "noix fraiche",
      "noix seche"
    ]
  },
  {
    "id": 252,
    "k": "noix de cajou",
    "name": "Noix de cajou",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "cajou",
      "anacarde",
      "cashew",
      "noix cajou grillee",
      "cashew nuts"
    ]
  },
  {
    "id": 253,
    "k": "pistaches",
    "name": "Pistaches",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "pistache",
      "pistache diran",
      "pistache decortiquee",
      "pistaches salees",
      "pistachios"
    ]
  },
  {
    "id": 254,
    "k": "cacahuetes arachides",
    "name": "Cacahuètes / Arachides",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "cacahuete",
      "arachide",
      "peanuts",
      "cacahuetes grillees",
      "cacahuetes salees"
    ]
  },
  {
    "id": 255,
    "k": "noix de macadamia",
    "name": "Noix de macadamia",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "macadamia",
      "noix hawaienne",
      "macadamia nuts"
    ]
  },
  {
    "id": 256,
    "k": "noix du bresil",
    "name": "Noix du Brésil",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "noix du bresil",
      "brazil nuts",
      "bertholletia",
      "noix damazonie"
    ]
  },
  {
    "id": 257,
    "k": "pignons de pin",
    "name": "Pignons de pin",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "pignons",
      "pine nuts",
      "pinones",
      "pignoli"
    ]
  },
  {
    "id": 258,
    "k": "graines de sesame",
    "name": "Graines de sésame",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "sesame",
      "graines de sesame blanc",
      "sesame noir",
      "sesame seeds",
      "sesame grille"
    ]
  },
  {
    "id": 259,
    "k": "graines de tournesol",
    "name": "Graines de tournesol",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "tournesol",
      "graines de soleil",
      "sunflower seeds",
      "pepitas de tournesol"
    ]
  },
  {
    "id": 260,
    "k": "graines de courge",
    "name": "Graines de courge",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "pepitas",
      "graines de potiron",
      "pumpkin seeds",
      "graines vertes",
      "kurbiskerne"
    ]
  },
  {
    "id": 261,
    "k": "graines de lin",
    "name": "Graines de lin",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "lin dore",
      "lin brun",
      "flaxseed",
      "graines de lin moulues",
      "linseed"
    ]
  },
  {
    "id": 262,
    "k": "graines de chia",
    "name": "Graines de chia",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "chia",
      "graines de chia blanc",
      "chia seeds",
      "chia noir"
    ]
  },
  {
    "id": 263,
    "k": "graines de pavot",
    "name": "Graines de pavot",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "pavot",
      "graines de coquelicot",
      "poppy seeds",
      "mohn"
    ]
  },
  {
    "id": 264,
    "k": "noix de pecan",
    "name": "Noix de pécan",
    "cat": "Fruits à coque & graines",
    "aliases": [
      "pecan",
      "pacane",
      "pecan nuts",
      "noix pecan",
      "cerneaux de pecan"
    ]
  },
  {
    "id": 265,
    "k": "sel",
    "name": "Sel",
    "cat": "Épices & herbes",
    "aliases": [
      "sel fin",
      "sel de mer",
      "sel de guerande",
      "fleur de sel",
      "sel rose",
      "sel de table",
      "salt"
    ]
  },
  {
    "id": 266,
    "k": "poivre noir",
    "name": "Poivre noir",
    "cat": "Épices & herbes",
    "aliases": [
      "poivre",
      "poivre moulu",
      "poivre concasse",
      "black pepper",
      "poivre de kampot",
      "mignonette"
    ]
  },
  {
    "id": 267,
    "k": "paprika",
    "name": "Paprika",
    "cat": "Épices & herbes",
    "aliases": [
      "paprika doux",
      "paprika fume",
      "paprika fort",
      "pimenton",
      "sweet paprika"
    ]
  },
  {
    "id": 268,
    "k": "cumin",
    "name": "Cumin",
    "cat": "Épices & herbes",
    "aliases": [
      "cumin en poudre",
      "cumin moulu",
      "cumin seeds",
      "graines de cumin",
      "comino"
    ]
  },
  {
    "id": 269,
    "k": "coriandre poudre",
    "name": "Coriandre (poudre)",
    "cat": "Épices & herbes",
    "aliases": [
      "coriandre moulue",
      "coriandre en poudre",
      "graines de coriandre",
      "coriander powder"
    ]
  },
  {
    "id": 270,
    "k": "curry colombo",
    "name": "Curry / Colombo",
    "cat": "Épices & herbes",
    "aliases": [
      "curry en poudre",
      "poudre de curry",
      "masala",
      "garam masala",
      "colombo",
      "madras curry",
      "curry mild",
      "curry fort"
    ]
  },
  {
    "id": 271,
    "k": "curcuma",
    "name": "Curcuma",
    "cat": "Épices & herbes",
    "aliases": [
      "curcuma en poudre",
      "safran des indes",
      "turmeric",
      "kurkuma"
    ]
  },
  {
    "id": 272,
    "k": "cannelle",
    "name": "Cannelle",
    "cat": "Épices & herbes",
    "aliases": [
      "cannelle en poudre",
      "baton de cannelle",
      "cannelle de ceylan",
      "cinnamon",
      "cassia"
    ]
  },
  {
    "id": 273,
    "k": "noix de muscade",
    "name": "Noix de muscade",
    "cat": "Épices & herbes",
    "aliases": [
      "muscade",
      "muscade rapee",
      "nutmeg",
      "noix de muscade entiere"
    ]
  },
  {
    "id": 274,
    "k": "piment en poudre cayenne",
    "name": "Piment en poudre / Cayenne",
    "cat": "Épices & herbes",
    "aliases": [
      "piment de cayenne",
      "chili powder",
      "piment fort",
      "piment despelette",
      "piment rouge moulu",
      "cayenne pepper"
    ]
  },
  {
    "id": 275,
    "k": "thym",
    "name": "Thym",
    "cat": "Épices & herbes",
    "aliases": [
      "thym seche",
      "branche de thym",
      "thym frais",
      "thyme",
      "serpolet"
    ]
  },
  {
    "id": 276,
    "k": "romarin",
    "name": "Romarin",
    "cat": "Épices & herbes",
    "aliases": [
      "romarin frais",
      "branche de romarin",
      "romarin seche",
      "rosemary",
      "rosmarin"
    ]
  },
  {
    "id": 277,
    "k": "laurier",
    "name": "Laurier",
    "cat": "Épices & herbes",
    "aliases": [
      "feuille de laurier",
      "laurier sauce",
      "bay leaf",
      "laurier seche"
    ]
  },
  {
    "id": 278,
    "k": "basilic",
    "name": "Basilic",
    "cat": "Épices & herbes",
    "aliases": [
      "basilic frais",
      "basilic grand vert",
      "feuilles de basilic",
      "basilic seche",
      "basil",
      "basilic thai"
    ]
  },
  {
    "id": 279,
    "k": "persil",
    "name": "Persil",
    "cat": "Épices & herbes",
    "aliases": [
      "persil plat",
      "persil frise",
      "persil frais",
      "persil hache",
      "parsley",
      "persil seche"
    ]
  },
  {
    "id": 280,
    "k": "ciboulette",
    "name": "Ciboulette",
    "cat": "Épices & herbes",
    "aliases": [
      "ciboulette fraiche",
      "brins de ciboulette",
      "chives",
      "civette",
      "ciboulette ciselee"
    ]
  },
  {
    "id": 281,
    "k": "origan",
    "name": "Origan",
    "cat": "Épices & herbes",
    "aliases": [
      "origan seche",
      "origan frais",
      "origanum",
      "marjolaine sauvage",
      "oregano"
    ]
  },
  {
    "id": 282,
    "k": "menthe",
    "name": "Menthe",
    "cat": "Épices & herbes",
    "aliases": [
      "menthe fraiche",
      "feuilles de menthe",
      "menthe poivree",
      "menthe verte",
      "mint",
      "menthe sechee",
      "menthe marocaine"
    ]
  },
  {
    "id": 283,
    "k": "estragon",
    "name": "Estragon",
    "cat": "Épices & herbes",
    "aliases": [
      "estragon frais",
      "estragon francais",
      "tarragon",
      "estragon seche"
    ]
  },
  {
    "id": 284,
    "k": "sauge",
    "name": "Sauge",
    "cat": "Épices & herbes",
    "aliases": [
      "sauge fraiche",
      "feuille de sauge",
      "sauge sechee",
      "sage",
      "salvia"
    ]
  },
  {
    "id": 285,
    "k": "aneth",
    "name": "Aneth",
    "cat": "Épices & herbes",
    "aliases": [
      "aneth frais",
      "dill",
      "fenouil batard",
      "aneth seche",
      "brins daneth"
    ]
  },
  {
    "id": 286,
    "k": "cerfeuil",
    "name": "Cerfeuil",
    "cat": "Épices & herbes",
    "aliases": [
      "cerfeuil frais",
      "cerfeuil hache",
      "chervil",
      "cerfeuil seche"
    ]
  },
  {
    "id": 287,
    "k": "herbes de provence",
    "name": "Herbes de Provence",
    "cat": "Épices & herbes",
    "aliases": [
      "melange herbes de provence",
      "herbes provencales",
      "bouquet garni",
      "fines herbes"
    ]
  },
  {
    "id": 288,
    "k": "ras el hanout",
    "name": "Ras el Hanout",
    "cat": "Épices & herbes",
    "aliases": [
      "raselhanout",
      "epices marocaines",
      "melange maghrebin",
      "epices orientales"
    ]
  },
  {
    "id": 289,
    "k": "quatre epices",
    "name": "Quatre épices",
    "cat": "Épices & herbes",
    "aliases": [
      "quatreepices",
      "melange quatre epices",
      "epices charcuterie",
      "allspice blend"
    ]
  },
  {
    "id": 290,
    "k": "cardamome",
    "name": "Cardamome",
    "cat": "Épices & herbes",
    "aliases": [
      "cardamome verte",
      "cardamome noire",
      "cardamom",
      "cardamome en poudre",
      "gousses de cardamome",
      "elachi"
    ]
  },
  {
    "id": 291,
    "k": "farine de ble t45 t55",
    "name": "Farine de blé (T45 / T55)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "farine",
      "farine blanche",
      "farine de ble",
      "farine t55",
      "farine t45",
      "farine patissiere",
      "allpurpose flour"
    ]
  },
  {
    "id": 292,
    "k": "farine complete t110 t150",
    "name": "Farine complète (T110 / T150)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "farine integrale",
      "farine de ble complet",
      "whole wheat flour",
      "farine t110",
      "farine t150",
      "farine brune"
    ]
  },
  {
    "id": 293,
    "k": "farine de mais",
    "name": "Farine de maïs",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "masa harina",
      "farine de polenta",
      "cornflour",
      "maizena jaune",
      "farine de mais jaune"
    ]
  },
  {
    "id": 294,
    "k": "fecule de mais maizena",
    "name": "Fécule de maïs / Maïzena",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "maizena",
      "fecule",
      "fecule de mais",
      "cornstarch",
      "amidon de mais",
      "epaississant"
    ]
  },
  {
    "id": 295,
    "k": "farine de riz",
    "name": "Farine de riz",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "farine de riz blanc",
      "rice flour",
      "farine de riz complet",
      "amidon de riz"
    ]
  },
  {
    "id": 296,
    "k": "levure chimique",
    "name": "Levure chimique",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "levure",
      "baking powder",
      "poudre levante",
      "levure alsacienne",
      "sachet de levure"
    ]
  },
  {
    "id": 297,
    "k": "levure de boulanger",
    "name": "Levure de boulanger",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "levure fraiche",
      "levure boulangere",
      "levure seche",
      "instant yeast",
      "dry yeast",
      "sachet levure boulanger"
    ]
  },
  {
    "id": 298,
    "k": "bicarbonate de soude",
    "name": "Bicarbonate de soude",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "bicarbonate",
      "baking soda",
      "bicarbonate alimentaire",
      "carbonate de sodium"
    ]
  },
  {
    "id": 299,
    "k": "cacao en poudre",
    "name": "Cacao en poudre",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "cacao non sucre",
      "poudre de cacao",
      "chocolat en poudre",
      "cocoa powder",
      "cacao amer",
      "van houten"
    ]
  },
  {
    "id": 300,
    "k": "vanille extrait gousse",
    "name": "Vanille (extrait / gousse)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "gousse de vanille",
      "extrait de vanille",
      "vanille bourbon",
      "vanilline",
      "arome vanille",
      "vanilla extract"
    ]
  },
  {
    "id": 301,
    "k": "gelatine",
    "name": "Gélatine",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "feuille de gelatine",
      "gelatine en poudre",
      "gelatine",
      "colle de poisson",
      "feuilles dor"
    ]
  },
  {
    "id": 302,
    "k": "agaragar",
    "name": "Agar-agar",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "agar",
      "gelifiant vegetal",
      "agaragar en poudre",
      "kanten",
      "gelatine vegane"
    ]
  },
  {
    "id": 303,
    "k": "lait de coco conserve",
    "name": "Lait de coco (conserve)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "lait de coco",
      "coconut milk",
      "lait de noix de coco",
      "lait de coco entier",
      "lait coco leger"
    ]
  },
  {
    "id": 304,
    "k": "tahini puree de sesame",
    "name": "Tahini / Purée de sésame",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "tahini",
      "puree de sesame",
      "tahin",
      "tahine",
      "pate de sesame",
      "sesame paste"
    ]
  },
  {
    "id": 305,
    "k": "miso",
    "name": "Miso",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "miso blanc",
      "miso rouge",
      "shiro miso",
      "pate miso",
      "miso paste",
      "hatcho miso"
    ]
  },
  {
    "id": 306,
    "k": "mayonnaise",
    "name": "Mayonnaise",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "mayo",
      "mayonnaise maison",
      "mayonnaise allegee",
      "aioli",
      "sauce mayo"
    ]
  },
  {
    "id": 307,
    "k": "moutarde",
    "name": "Moutarde",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "moutarde de dijon",
      "moutarde a lancienne",
      "moutarde forte",
      "mustard",
      "moutarde douce",
      "moutarde miforte"
    ]
  },
  {
    "id": 308,
    "k": "ketchup",
    "name": "Ketchup",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "ketchup tomate",
      "sauce ketchup",
      "tomato ketchup",
      "catsup",
      "sauce tomate sucree"
    ]
  },
  {
    "id": 309,
    "k": "sauce soja",
    "name": "Sauce soja",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "soja",
      "shoyu",
      "tamari",
      "sauce soya",
      "soy sauce",
      "sauce soja salee",
      "soja sans gluten"
    ]
  },
  {
    "id": 310,
    "k": "vinaigre blanc",
    "name": "Vinaigre blanc",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "vinaigre dalcool",
      "vinaigre cristal",
      "white vinegar",
      "vinaigre de vin blanc",
      "vinaigre de cidre"
    ]
  },
  {
    "id": 311,
    "k": "vinaigre balsamique",
    "name": "Vinaigre balsamique",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "balsamique",
      "vinaigre de modene",
      "balsamic vinegar",
      "condiment balsamique",
      "creme balsamique"
    ]
  },
  {
    "id": 312,
    "k": "sauce tomate conserve",
    "name": "Sauce tomate (conserve)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "sauce tomate",
      "coulis de tomate",
      "passata",
      "sugo",
      "salsa di pomodoro",
      "sauce bolognaise de base"
    ]
  },
  {
    "id": 313,
    "k": "concentre de tomate",
    "name": "Concentré de tomate",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "concentre tomate",
      "double concentre",
      "tomato paste",
      "puree de tomate concentree",
      "extrait de tomate"
    ]
  },
  {
    "id": 314,
    "k": "bouillon cube fond",
    "name": "Bouillon (cube / fond)",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "bouillon cube",
      "fond de veau",
      "fond de volaille",
      "stock cube",
      "bouillon de legumes",
      "bouillon de boeuf",
      "dashi",
      "broth"
    ]
  },
  {
    "id": 315,
    "k": "huile de sesame",
    "name": "Huile de sésame",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "huile de sesame grille",
      "sesame oil",
      "huile sesame toaste",
      "huile de sesame asiatique"
    ]
  },
  {
    "id": 316,
    "k": "sauce worcestershire",
    "name": "Sauce Worcestershire",
    "cat": "Ingrédients de base & condiments",
    "aliases": [
      "worcestershire",
      "sauce anglaise",
      "lea perrins",
      "worcester sauce"
    ]
  },
  {
    "id": 317,
    "k": "sucre blanc",
    "name": "Sucre blanc",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "sucre",
      "sucre semoule",
      "sucre cristallise",
      "sucre en poudre",
      "white sugar",
      "sucre de table"
    ]
  },
  {
    "id": 318,
    "k": "sucre roux cassonade",
    "name": "Sucre roux / Cassonade",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "cassonade",
      "sucre roux",
      "vergeoise",
      "brown sugar",
      "raw sugar",
      "sucre de canne"
    ]
  },
  {
    "id": 319,
    "k": "sucre glace",
    "name": "Sucre glace",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "sucre impalpable",
      "sucre en poudre fine",
      "powdered sugar",
      "icing sugar",
      "sucre a glacer"
    ]
  },
  {
    "id": 320,
    "k": "sirop derable",
    "name": "Sirop d'érable",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "maple syrup",
      "sirop derable pur",
      "sirop erable grade a",
      "sirop derable canadien"
    ]
  },
  {
    "id": 321,
    "k": "miel",
    "name": "Miel",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "miel toutes fleurs",
      "miel dacacia",
      "miel de lavande",
      "honey",
      "miel liquide",
      "miel cremeux"
    ]
  },
  {
    "id": 322,
    "k": "confiture generique",
    "name": "Confiture (générique)",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "confiture de fraises",
      "confiture dabricots",
      "marmelade",
      "jam",
      "gelee de fruits",
      "confiture maison"
    ]
  },
  {
    "id": 323,
    "k": "chocolat noir tablette",
    "name": "Chocolat noir (tablette)",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "chocolat noir",
      "chocolat 70",
      "chocolat de couverture",
      "dark chocolate",
      "chocolat patissier",
      "chocolat a cuire"
    ]
  },
  {
    "id": 324,
    "k": "chocolat au lait tablette",
    "name": "Chocolat au lait (tablette)",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "chocolat au lait",
      "milk chocolate",
      "chocolat lait",
      "chocolat dessert lait"
    ]
  },
  {
    "id": 325,
    "k": "chocolat blanc",
    "name": "Chocolat blanc",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "chocolat blanc patissier",
      "white chocolate",
      "chocolat ivoire",
      "couverture ivoire"
    ]
  },
  {
    "id": 326,
    "k": "pepites de chocolat",
    "name": "Pépites de chocolat",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "chips de chocolat",
      "pepites",
      "chocolate chips",
      "chunks de chocolat",
      "pastilles de chocolat"
    ]
  },
  {
    "id": 327,
    "k": "pate a tartiner type nutella",
    "name": "Pâte à tartiner (type Nutella)",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "pate a tartiner chocolat",
      "nutella",
      "spread chocolat",
      "creme noisette chocolat",
      "pate noisette"
    ]
  },
  {
    "id": 328,
    "k": "beurre de cacahuete",
    "name": "Beurre de cacahuète",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "peanut butter",
      "creme darachide",
      "beurre darachide",
      "pate de cacahuete"
    ]
  },
  {
    "id": 329,
    "k": "chips",
    "name": "Chips",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "chips de pomme de terre",
      "crisps",
      "chips salees",
      "chips nature",
      "snack croustillant"
    ]
  },
  {
    "id": 330,
    "k": "biscuits secs type petit beurre",
    "name": "Biscuits secs (type Petit Beurre)",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "petit beurre",
      "sable",
      "boudoir",
      "speculoos",
      "digestive",
      "cookies",
      "biscuit sec"
    ]
  },
  {
    "id": 331,
    "k": "cereales de petitdejeuner",
    "name": "Céréales de petit-déjeuner",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "cornflakes",
      "cereales",
      "muslix",
      "frosties",
      "breakfast cereals",
      "cereales soufflees"
    ]
  },
  {
    "id": 332,
    "k": "granola muesli",
    "name": "Granola / Muesli",
    "cat": "Produits sucrés & snacks",
    "aliases": [
      "granola maison",
      "muesli",
      "bircher",
      "granola avoine",
      "muesli croustillant",
      "trail mix"
    ]
  }
];

// ── Index plat alias → canonical normKey (O(1)) ──────────────
// Précalculé au chargement
const WL_IDX = {"yaourt nature":"yaourt nature","yogourt":"yaourt nature","yoghourt":"yaourt nature","yaourt blanc":"yaourt nature","laitage fermente":"yaourt nature","yaourt nature entier":"yaourt nature","yaourt nature 0 mg":"yaourt nature 0 mg","yaourt maigre":"yaourt nature 0 mg","yaourt 0":"yaourt nature 0 mg","yaourt allege":"yaourt nature 0 mg","yaourt ecreme":"yaourt nature 0 mg","yogourt 0":"yaourt nature 0 mg","yaourt aux fruits":"yaourt aux fruits","yaourt fruite":"yaourt aux fruits","yaourt fraise":"yaourt aux fruits","yaourt framboise":"yaourt aux fruits","yaourt peche":"yaourt aux fruits","yaourt abricot":"yaourt aux fruits","yaourt aromatise":"yaourt aromatise","yaourt parfume":"yaourt aromatise","yaourt vanille":"yaourt aromatise","yaourt citron":"yaourt aromatise","yaourt caramel":"yaourt aromatise","yaourt saveur":"yaourt aromatise","yaourt a la grecque":"yaourt a la grecque","yaourt grec":"yaourt a la grecque","greek yogurt":"yaourt a la grecque","yogourt grec":"yaourt a la grecque","yaourt epais":"yaourt a la grecque","strained yogurt":"yaourt a la grecque","skyr":"skyr","skyr islandais":"skyr","fromage frais islandais":"skyr","yaourt skyr":"skyr","laitage islandais":"skyr","yaourt a boire":"yaourt a boire","yaourt liquide":"yaourt a boire","boisson lactee fermentee":"yaourt a boire","yaourt buvable":"yaourt a boire","dairy drink":"yaourt a boire","kefir de lait":"kefir de lait","kefir":"kefir de lait","kephir":"kefir de lait","lait fermente kefir":"kefir de lait","boisson probiotique":"kefir de lait","fromage blanc nature 20 mg":"fromage blanc nature 20 mg","fromage blanc":"fromage blanc nature 20 mg","fromage blanc demigras":"fromage blanc nature 20 mg","fromage blanc 20":"fromage blanc nature 20 mg","caillebotte":"fromage blanc nature 20 mg","fromage blanc nature 0 mg":"fromage blanc nature 0 mg","fromage blanc maigre":"fromage blanc nature 0 mg","fromage blanc 0":"fromage blanc nature 0 mg","fromage blanc allege":"fromage blanc nature 0 mg","fromage blanc ecreme":"fromage blanc nature 0 mg","fromage blanc nature 40 mg":"fromage blanc nature 40 mg","fromage blanc gras":"fromage blanc nature 40 mg","fromage blanc entier":"fromage blanc nature 40 mg","fromage blanc 40":"fromage blanc nature 40 mg","fromage blanc riche":"fromage blanc nature 40 mg","petit suisse":"petit suisse","petits suisses":"petit suisse","gervais":"petit suisse","fromage frais enfant":"petit suisse","fromage frais petit pot":"petit suisse","ricotta":"ricotta","ricotta fraiche":"ricotta","brousse":"ricotta","serac":"ricotta","fromage de lactoserum":"ricotta","creme dessert flan":"creme dessert flan","flan":"creme dessert flan","creme caramel":"creme dessert flan","creme chocolat":"creme dessert flan","creme vanille":"creme dessert flan","dessert lacte":"creme dessert flan","danette":"creme dessert flan","faisselle":"faisselle","faisselle de vache":"faisselle","fromage frais en faisselle":"faisselle","lait caille egoutte":"faisselle","camembert":"camembert","camembert de normandie":"camembert","camembert au lait cru":"camembert","fromage a croute fleurie":"camembert","brie coulommiers":"brie coulommiers","brie":"brie coulommiers","brie de meaux":"brie coulommiers","brie de melun":"brie coulommiers","coulommiers":"brie coulommiers","fromage brie":"brie coulommiers","munster":"munster","munster gerome":"munster","munster alsacien":"munster","fromage alsacien":"munster","munster au lait cru":"munster","reblochon":"reblochon","reblochon de savoie":"reblochon","fromage savoyard":"reblochon","fromage a tartiflette":"reblochon","reblochon fermier":"reblochon","epoisses fromage a croute lavee":"epoisses fromage a croute lavee","epoisses":"epoisses fromage a croute lavee","livarot":"epoisses fromage a croute lavee","maroilles":"epoisses fromage a croute lavee","pontleveque":"epoisses fromage a croute lavee","fromage fort":"epoisses fromage a croute lavee","fromage puant":"epoisses fromage a croute lavee","fromage croute lavee":"epoisses fromage a croute lavee","fromage de chevre frais":"fromage de chevre frais","chevre frais":"fromage de chevre frais","fromage frais de chevre":"fromage de chevre frais","buchette fraiche":"fromage de chevre frais","chevre doux":"fromage de chevre frais","fromage caprin frais":"fromage de chevre frais","fromage de chevre affine buche crottin":"fromage de chevre affine buche crottin","crottin de chavignol":"fromage de chevre affine buche crottin","buche de chevre":"fromage de chevre affine buche crottin","saintemaure":"fromage de chevre affine buche crottin","chevre affine":"fromage de chevre affine buche crottin","fromage caprin":"fromage de chevre affine buche crottin","picodon":"fromage de chevre affine buche crottin","pouligny":"fromage de chevre affine buche crottin","fromage de brebis":"fromage de brebis","ossauiraty":"fromage de brebis","pecorino":"fromage de brebis","manchego":"fromage de brebis","fromage brebis basque":"fromage de brebis","fromage ovin":"fromage de brebis","brebis pyrenees":"fromage de brebis","emmental":"emmental","emmental francais":"emmental","fromage rape":"emmental","gruyere rape":"emmental","fromage a trous":"emmental","emmenthal":"emmental","fromage fondu gratine":"emmental","gruyere comte":"gruyere comte","comte":"gruyere comte","gruyere suisse":"gruyere comte","beaufort":"gruyere comte","fromage a pate dure":"gruyere comte","fromage fondu":"gruyere comte","fromage a gratiner":"gruyere comte","parmesan grana padano":"parmesan grana padano","parmesan":"parmesan grana padano","parmigiano reggiano":"parmesan grana padano","grana padano":"parmesan grana padano","parmesan rape":"parmesan grana padano","fromage italien dur":"parmesan grana padano","gouda":"gouda","gouda hollandais":"gouda","gouda jeune":"gouda","gouda vieux":"gouda","fromage hollandais":"gouda","edam":"gouda","cheddar":"cheddar","cheddar anglais":"cheddar","cheddar mature":"cheddar","cheddar rape":"cheddar","fromage anglais":"cheddar","fromage burger":"cheddar","tomme fromage a pate pressee non cuite":"tomme fromage a pate pressee non cuite","tomme de savoie":"tomme fromage a pate pressee non cuite","tomme de vache":"tomme fromage a pate pressee non cuite","saintnectaire":"tomme fromage a pate pressee non cuite","cantal":"tomme fromage a pate pressee non cuite","laguiole":"tomme fromage a pate pressee non cuite","fromage montagnard":"tomme fromage a pate pressee non cuite","roquefort bleu":"roquefort bleu","roquefort":"roquefort bleu","bleu dauvergne":"roquefort bleu","bleu de gex":"roquefort bleu","fourme dambert":"roquefort bleu","gorgonzola":"roquefort bleu","fromage bleu":"roquefort bleu","bleu persille":"roquefort bleu","feta":"feta","feta grecque":"feta","fromage blanc grec":"feta","fromage de brebis grec":"feta","feta aop":"feta","fromage en saumure":"feta","mozzarella":"mozzarella","mozzarella di bufala":"mozzarella","mozzarella vache":"mozzarella","mozzarella pizza":"mozzarella","fromage file":"mozzarella","burrata":"mozzarella","fromage fondu a tartiner type kiri":"fromage fondu a tartiner type kiri","vache qui rit":"fromage fondu a tartiner type kiri","kiri":"fromage fondu a tartiner type kiri","fromage a tartiner":"fromage fondu a tartiner type kiri","creme de gruyere":"fromage fondu a tartiner type kiri","portion fondue":"fromage fondu a tartiner type kiri","mascarpone":"mascarpone","mascarpone italien":"mascarpone","creme mascarpone":"mascarpone","fromage a tiramisu":"mascarpone","fromage cremeux italien":"mascarpone","philadelphia fromage frais a tartiner":"philadelphia fromage frais a tartiner","philadelphia":"philadelphia fromage frais a tartiner","cream cheese":"philadelphia fromage frais a tartiner","fromage frais tartiner":"philadelphia fromage frais a tartiner","fromage frais cremeux":"philadelphia fromage frais a tartiner","st moret":"philadelphia fromage frais a tartiner","lait entier":"lait entier","lait de vache entier":"lait entier","lait frais entier":"lait entier","lait 35":"lait entier","lait riche en matieres grasses":"lait entier","lait demiecreme":"lait demiecreme","lait":"lait demiecreme","lait de vache":"lait demiecreme","lait frais":"lait demiecreme","lait 15":"lait demiecreme","lait demi":"lait demiecreme","lait ecreme":"lait ecreme","lait maigre":"lait ecreme","lait 0":"lait ecreme","lait allege":"lait ecreme","lait ecreme frais":"lait ecreme","lait en poudre":"lait en poudre","lait deshydrate":"lait en poudre","poudre de lait":"lait en poudre","lait en poudre entier":"lait en poudre","lait instantane":"lait en poudre","lait de soja":"lait de soja","boisson soja":"lait de soja","soja drink":"lait de soja","boisson au soja":"lait de soja","lait vegetal soja":"lait de soja","lait davoine":"lait davoine","boisson avoine":"lait davoine","oat milk":"lait davoine","boisson a lavoine":"lait davoine","lait vegetal avoine":"lait davoine","oat drink":"lait davoine","lait damande":"lait damande","boisson amande":"lait damande","almond milk":"lait damande","boisson aux amandes":"lait damande","lait vegetal amande":"lait damande","creme fraiche epaisse":"creme fraiche epaisse","creme epaisse":"creme fraiche epaisse","creme fraiche":"creme fraiche epaisse","creme entiere epaisse":"creme fraiche epaisse","creme normande":"creme fraiche epaisse","creme acidulee":"creme fraiche epaisse","creme fraiche liquide fleurette":"creme fraiche liquide fleurette","creme liquide":"creme fraiche liquide fleurette","creme fleurette":"creme fraiche liquide fleurette","creme entiere liquide":"creme fraiche liquide fleurette","creme a fouetter":"creme fraiche liquide fleurette","creme uht":"creme fraiche liquide fleurette","heavy cream":"creme fraiche liquide fleurette","creme legere":"creme legere","creme allegee":"creme legere","creme 15":"creme legere","creme semiepaisse allegee":"creme legere","creme legere epaisse":"creme legere","creme de coco":"creme de coco","creme coco":"creme de coco","coconut cream":"creme de coco","creme noix de coco":"creme de coco","creme de noix de coco":"creme de coco","boeuf hache":"boeuf hache","viande hachee":"boeuf hache","steak hache":"boeuf hache","hachis de boeuf":"boeuf hache","boeuf hache 5":"boeuf hache","boeuf hache 15":"boeuf hache","boeuf hache 20":"boeuf hache","mince beef":"boeuf hache","ground beef":"boeuf hache","steak de boeuf":"steak de boeuf","bavette":"steak de boeuf","rumsteak":"steak de boeuf","fauxfilet":"steak de boeuf","aloyau":"steak de boeuf","filet de boeuf":"steak de boeuf","bifteck":"steak de boeuf","tournedos":"steak de boeuf","roti de boeuf":"roti de boeuf","rosbif":"roti de boeuf","roti boeuf":"roti de boeuf","piece de boeuf rotie":"roti de boeuf","noix de boeuf":"roti de boeuf","tende de tranche":"roti de boeuf","entrecote cote de boeuf":"entrecote cote de boeuf","entrecote":"entrecote cote de boeuf","cote de boeuf":"entrecote cote de boeuf","rib steak":"entrecote cote de boeuf","ribeye":"entrecote cote de boeuf","cote a los":"entrecote cote de boeuf","poulet blanc filet":"poulet blanc filet","blanc de poulet":"poulet blanc filet","filet de poulet":"poulet blanc filet","escalope de poulet":"poulet blanc filet","poitrine de poulet":"poulet blanc filet","chicken breast":"poulet blanc filet","poulet cuisse pilon":"poulet cuisse pilon","cuisse de poulet":"poulet cuisse pilon","pilon de poulet":"poulet cuisse pilon","haut de cuisse":"poulet cuisse pilon","chicken thigh":"poulet cuisse pilon","chicken drumstick":"poulet cuisse pilon","poulet entier":"poulet entier","poulet roti":"poulet entier","poulet fermier":"poulet entier","volaille entiere":"poulet entier","poulet de chair":"poulet entier","coquelet":"poulet entier","dinde escalope hache":"dinde escalope hache","escalope de dinde":"dinde escalope hache","blanc de dinde":"dinde escalope hache","dinde hachee":"dinde escalope hache","filet de dinde":"dinde escalope hache","turkey":"dinde escalope hache","porc cote filet":"porc cote filet","cote de porc":"porc cote filet","filet de porc":"porc cote filet","longe de porc":"porc cote filet","cotelette de porc":"porc cote filet","porc maigre":"porc cote filet","porc roti epaule":"porc roti epaule","roti de porc":"porc roti epaule","epaule de porc":"porc roti epaule","palette de porc":"porc roti epaule","porc roti":"porc roti epaule","cochon roti":"porc roti epaule","veau escalope cote":"veau escalope cote","escalope de veau":"veau escalope cote","cote de veau":"veau escalope cote","noix de veau":"veau escalope cote","filet de veau":"veau escalope cote","piccata":"veau escalope cote","agneau cotelette gigot":"agneau cotelette gigot","gigot dagneau":"agneau cotelette gigot","cotelette dagneau":"agneau cotelette gigot","carre dagneau":"agneau cotelette gigot","epaule dagneau":"agneau cotelette gigot","agneau hache":"agneau cotelette gigot","selle dagneau":"agneau cotelette gigot","canard magret":"canard magret","magret de canard":"canard magret","filet de canard":"canard magret","magret seche":"canard magret","magret fume":"canard magret","canard confit":"canard confit","confit de canard":"canard confit","cuisse de canard confite":"canard confit","cuisse confite":"canard confit","lapin":"lapin","lapin de garenne":"lapin","lapin fermier":"lapin","cuisse de lapin":"lapin","rable de lapin":"lapin","lapin en morceaux":"lapin","foie de volaille":"foie de volaille","foie de poulet":"foie de volaille","foie de canard":"foie de volaille","foie volaille":"foie de volaille","abats de volaille":"foie de volaille","foie de veau boeuf":"foie de veau boeuf","foie de veau":"foie de veau boeuf","foie de boeuf":"foie de veau boeuf","foie de genisse":"foie de veau boeuf","foie gras de veau":"foie de veau boeuf","lardons":"lardons","lardons fumes":"lardons","lardons nature":"lardons","poitrine fumee en des":"lardons","bacon en des":"lardons","lardons allumettes":"lardons","abats divers":"abats divers","rognons":"abats divers","ris de veau":"abats divers","langue de boeuf":"abats divers","tripes":"abats divers","coeur de boeuf":"abats divers","cervelle":"abats divers","amourettes":"abats divers","jambon blanc cuit":"jambon blanc cuit","jambon cuit":"jambon blanc cuit","jambon de paris":"jambon blanc cuit","jambon superieur":"jambon blanc cuit","jambon degraisse":"jambon blanc cuit","jambon tranche":"jambon blanc cuit","jambon cru sec":"jambon cru sec","jambon cru":"jambon cru sec","serrano":"jambon cru sec","prosciutto":"jambon cru sec","jambon de bayonne":"jambon cru sec","jambon iberique":"jambon cru sec","jambon pata negra":"jambon cru sec","jambon de parme":"jambon cru sec","bresaola":"jambon cru sec","bacon poitrine fumee":"bacon poitrine fumee","bacon":"bacon poitrine fumee","poitrine fumee":"bacon poitrine fumee","ventreche":"bacon poitrine fumee","lard fume":"bacon poitrine fumee","pancetta":"bacon poitrine fumee","saucisson sec":"saucisson sec","saucisson":"saucisson sec","rosette":"saucisson sec","jesus":"saucisson sec","saucisson darles":"saucisson sec","saucisse seche":"saucisson sec","fuet":"saucisson sec","chorizo":"chorizo","chorizo fort":"chorizo","chorizo doux":"chorizo","chorizo espagnol":"chorizo","chorizo piquant":"chorizo","txistorra":"chorizo","salami pepperoni":"salami pepperoni","salami":"salami pepperoni","pepperoni":"salami pepperoni","salame":"salami pepperoni","salami italien":"salami pepperoni","salami hongrois":"salami pepperoni","merguez":"merguez","merguez dagneau":"merguez","merguez boeuf":"merguez","saucisse merguez":"merguez","saucisse epicee":"merguez","chipolata saucisse fraiche":"chipolata saucisse fraiche","chipolata":"chipolata saucisse fraiche","saucisse fraiche":"chipolata saucisse fraiche","saucisse de toulouse":"chipolata saucisse fraiche","crepinette":"chipolata saucisse fraiche","saucisse porc":"chipolata saucisse fraiche","saucisse de francfort":"saucisse de francfort","knack":"saucisse de francfort","saucisse knack":"saucisse de francfort","hotdog":"saucisse de francfort","frankfurter":"saucisse de francfort","saucisse viennoise":"saucisse de francfort","wiener":"saucisse de francfort","pate de campagne":"pate de campagne","pate":"pate de campagne","terrine de campagne":"pate de campagne","terrine maison":"pate de campagne","pate maison":"pate de campagne","pate rustique":"pate de campagne","pate de foie":"pate de foie","pate de foie de porc":"pate de foie","pate de foie gras":"pate de foie","mousse de foie":"pate de foie","foie gras":"pate de foie","rillettes":"rillettes","rillettes de porc":"rillettes","rillettes du mans":"rillettes","rillettes de canard":"rillettes","rillettes de saumon":"rillettes","rillettes maison":"rillettes","boudin noir":"boudin noir","boudin":"boudin noir","black pudding":"boudin noir","morcilla":"boudin noir","boudin antillais":"boudin noir","mortadelle":"mortadelle","mortadella":"mortadelle","mortadelle italienne":"mortadelle","bologna":"mortadelle","saucisson cuit italien":"mortadelle","saumon filet":"saumon filet","filet de saumon":"saumon filet","saumon atlantique":"saumon filet","saumon frais":"saumon filet","pave de saumon":"saumon filet","saumon delevage":"saumon filet","darne de saumon":"saumon filet","saumon fume":"saumon fume","saumon fume norvegien":"saumon fume","saumon fume ecossais":"saumon fume","saumon froid fume":"saumon fume","tranche de saumon fume":"saumon fume","thon conserve au naturel":"thon conserve au naturel","thon nature":"thon conserve au naturel","thon en boite":"thon conserve au naturel","thon a leau":"thon conserve au naturel","thon au naturel":"thon conserve au naturel","conserve de thon":"thon conserve au naturel","thon conserve a lhuile":"thon conserve a lhuile","thon a lhuile":"thon conserve a lhuile","thon huile dolive":"thon conserve a lhuile","thon en boite a lhuile":"thon conserve a lhuile","thon micuit":"thon conserve a lhuile","cabillaud morue":"cabillaud morue","cabillaud":"cabillaud morue","morue fraiche":"cabillaud morue","morue salee":"cabillaud morue","dos de cabillaud":"cabillaud morue","filet de cabillaud":"cabillaud morue","brandade":"cabillaud morue","cod":"cabillaud morue","lieu noir":"lieu noir","filet de lieu noir":"lieu noir","lieu":"lieu noir","coalfish":"lieu noir","colin noir":"lieu noir","lieu jaune":"lieu noir","dorade daurade":"dorade daurade","dorade royale":"dorade daurade","daurade":"dorade daurade","dorade grise":"dorade daurade","sparide":"dorade daurade","sea bream":"dorade daurade","bar loup":"bar loup","bar":"bar loup","loup de mer":"bar loup","bar de ligne":"bar loup","sea bass":"bar loup","loup mediterraneen":"bar loup","maquereau filet":"maquereau filet","maquereau":"maquereau filet","filet de maquereau":"maquereau filet","maquereau atlantique":"maquereau filet","maquereau frais":"maquereau filet","maquereau de ligne":"maquereau filet","maquereau fume":"maquereau fume","maquereau fume entier":"maquereau fume","filet de maquereau fume":"maquereau fume","maquereau poivre fume":"maquereau fume","sardines conserve":"sardines conserve","sardines en boite":"sardines conserve","sardines a lhuile":"sardines conserve","sardines au naturel":"sardines conserve","conserve de sardines":"sardines conserve","sardines fraiches":"sardines fraiches","sardines":"sardines fraiches","petites sardines":"sardines fraiches","sardine de mediterranee":"sardines fraiches","sardine atlantique":"sardines fraiches","hareng":"hareng","hareng fume":"hareng","hareng saur":"hareng","hareng marine":"hareng","rollmops":"hareng","kipper":"hareng","bouffi":"hareng","sole":"sole","sole meuniere":"sole","filet de sole":"sole","sole commune":"sole","dover sole":"sole","merlan colin":"merlan colin","merlan":"merlan colin","colin":"merlan colin","filet de merlan":"merlan colin","merlu":"merlan colin","whiting":"merlan colin","hake":"merlan colin","truite":"truite","truite arcenciel":"truite","truite saumonee":"truite","truite fumee":"truite","filet de truite":"truite","tilapia":"tilapia","filet de tilapia":"tilapia","tilapia delevage":"tilapia","perche du nil":"tilapia","anchois":"anchois","anchois marines":"anchois","anchois a lhuile":"anchois","filets danchois":"anchois","pate danchois":"anchois","anchoiade":"anchois","filets panes":"filets panes","poisson pane":"filets panes","fish fingers":"filets panes","goujonnettes":"filets panes","batonnets de poisson":"filets panes","fish sticks":"filets panes","crevettes":"crevettes","crevettes roses":"crevettes","crevettes grises":"crevettes","gambas":"crevettes","bouquet":"crevettes","crevette decortiquee":"crevettes","shrimp":"crevettes","prawn":"crevettes","moules":"moules","moules de bouchot":"moules","moules marinieres":"moules","moule de zelande":"moules","bivalve":"moules","mussel":"moules","coquilles saintjacques":"coquilles saintjacques","saintjacques":"coquilles saintjacques","noix de saintjacques":"coquilles saintjacques","petoncle":"coquilles saintjacques","coquille":"coquilles saintjacques","scallop":"coquilles saintjacques","calamars encornets":"calamars encornets","calamar":"calamars encornets","encornet":"calamars encornets","squid":"calamars encornets","anneaux de calamar":"calamars encornets","tentacules de calamar":"calamars encornets","chipirons":"calamars encornets","crabe":"crabe","tourteau":"crabe","araignee de mer":"crabe","crabe des neiges":"crabe","chair de crabe":"crabe","surimi crabe":"crabe","huitres":"huitres","huitre creuse":"huitres","huitre plate":"huitres","ostreiculture":"huitres","oyster":"huitres","huitre de marennes":"huitres","coques palourdes":"coques palourdes","coques":"coques palourdes","palourdes":"coques palourdes","clams":"coques palourdes","vongole":"coques palourdes","clovisses":"coques palourdes","praires":"coques palourdes","homard langouste":"homard langouste","homard breton":"homard langouste","langouste":"homard langouste","langoustine":"homard langouste","lobster":"homard langouste","queue de langouste":"homard langouste","oeuf de poule":"oeuf de poule","oeuf":"oeuf de poule","oeuf entier":"oeuf de poule","oeuf frais":"oeuf de poule","oeuf de plein air":"oeuf de poule","oeuf bio":"oeuf de poule","oeuf coque":"oeuf de poule","oeuf dur":"oeuf de poule","jaune doeuf":"jaune doeuf","jaune":"jaune doeuf","yolk":"jaune doeuf","jaune doeuf frais":"jaune doeuf","blanc doeuf":"blanc doeuf","blanc":"blanc doeuf","albumen":"blanc doeuf","egg white":"blanc doeuf","blanc doeuf frais":"blanc doeuf","tomate":"tomate","tomate ronde":"tomate","tomate grappe":"tomate","tomate cotelee":"tomate","tomate allongee":"tomate","tomate roma":"tomate","tomates fraiches":"tomate","tomate cerise":"tomate cerise","tomates cerises":"tomate cerise","cherry tomato":"tomate cerise","tomate cocktail":"tomate cerise","tomate raisin":"tomate cerise","mini tomate":"tomate cerise","tomate pelee conserve":"tomate pelee conserve","tomates pelees":"tomate pelee conserve","tomates concassees":"tomate pelee conserve","tomates en boite":"tomate pelee conserve","pulpe de tomate":"tomate pelee conserve","tomates entieres pelees":"tomate pelee conserve","concombre":"concombre","concombre long":"concombre","concombre mini":"concombre","cornichon frais":"concombre","cucurbitacee":"concombre","courgette":"courgette","courgette verte":"courgette","courgette jaune":"courgette","zucchini":"courgette","courgette ronde":"courgette","baby courgette":"courgette","aubergine":"aubergine","aubergine violette":"aubergine","aubergine blanche":"aubergine","eggplant":"aubergine","brinjal":"aubergine","melanzane":"aubergine","poivron rouge":"poivron rouge","poivron rouge mur":"poivron rouge","red pepper":"poivron rouge","pimiento rojo":"poivron rouge","capsicum rouge":"poivron rouge","poivron vert":"poivron vert","green pepper":"poivron vert","pimiento verde":"poivron vert","capsicum vert":"poivron vert","poivron jaune":"poivron jaune","yellow pepper":"poivron jaune","capsicum jaune":"poivron jaune","carotte":"carotte","carotte orange":"carotte","carotte de sable":"carotte","carotte fane":"carotte","carotte botte":"carotte","carottes rapees":"carotte","brocoli":"brocoli","brocolis":"brocoli","tete de brocoli":"brocoli","brocoli vert":"brocoli","broccoli":"brocoli","fleurettes de brocoli":"brocoli","choufleur":"choufleur","cauliflower":"choufleur","fleurettes de choufleur":"choufleur","tete de choufleur":"choufleur","choufleur blanc":"choufleur","chou blanc":"chou blanc","chou cabus":"chou blanc","chou pomme blanc":"chou blanc","white cabbage":"chou blanc","chou en chiffonnade":"chou blanc","chou rouge":"chou rouge","chou rouge pomme":"chou rouge","red cabbage":"chou rouge","chou violet":"chou rouge","chou lactofermente rouge":"chou rouge","chou de bruxelles":"chou de bruxelles","choux de bruxelles":"chou de bruxelles","brussels sprouts":"chou de bruxelles","minichoux":"chou de bruxelles","chou de bruxelles surgele":"chou de bruxelles","epinards":"epinards","epinards frais":"epinards","epinards en branches":"epinards","epinards surgeles":"epinards","pousses depinard":"epinards","spinach":"epinards","feuilles depinard":"epinards","salade verte laitue":"salade verte laitue","laitue":"salade verte laitue","salade":"salade verte laitue","salade verte":"salade verte laitue","feuille de chene":"salade verte laitue","batavia":"salade verte laitue","iceberg":"salade verte laitue","romaine":"salade verte laitue","sucrine":"salade verte laitue","roquette":"roquette","rucola":"roquette","arugula":"roquette","salade roquette":"roquette","roquette sauvage":"roquette","eruca":"roquette","mache":"mache","salade mache":"mache","doucette":"mache","valerianelle":"mache","lambs lettuce":"mache","endive":"endive","chicon":"endive","witloof":"endive","endive belge":"endive","chicoree witloof":"endive","belgian endive":"endive","fenouil":"fenouil","bulbe de fenouil":"fenouil","fenouil florence":"fenouil","aneth doux":"fenouil","finocchio":"fenouil","fennel":"fenouil","celeri branche":"celeri branche","celeri":"celeri branche","branche de celeri":"celeri branche","celery":"celeri branche","celeri a cotes":"celeri branche","celeri vert":"celeri branche","celeri rave":"celeri rave","celerirave":"celeri rave","celeriac":"celeri rave","boule de celeri":"celeri rave","celeri tubereux":"celeri rave","remoulade":"celeri rave","poireau":"poireau","poireaux":"poireau","blanc de poireau":"poireau","vert de poireau":"poireau","leek":"poireau","poireau de gennevilliers":"poireau","oignon":"oignon","oignon jaune":"oignon","oignon blanc":"oignon","oignon de pays":"oignon","oignon hache":"oignon","oignon emince":"oignon","oignon doux des cevennes":"oignon","oignon rouge":"oignon rouge","oignon violet":"oignon rouge","oignon rouge de toulouges":"oignon rouge","red onion":"oignon rouge","oignon cru rouge":"oignon rouge","echalote":"echalote","echalote grise":"echalote","echalote de jersey":"echalote","shallot":"echalote","echalote francaise":"echalote","ciboule":"echalote","ail":"ail","gousse dail":"ail","ail blanc":"ail","ail rose":"ail","ail violet":"ail","ail des ours":"ail","ail hache":"ail","ail en poudre":"ail","garlic":"ail","champignon de paris":"champignon de paris","champignon blanc":"champignon de paris","button mushroom":"champignon de paris","champignon emince":"champignon de paris","champignon de couche":"champignon de paris","agaric":"champignon de paris","champignon varietes":"champignon varietes","shiitake":"champignon varietes","pleurote":"champignon varietes","girolle":"champignon varietes","chanterelle":"champignon varietes","cepe":"champignon varietes","porcini":"champignon varietes","morille":"champignon varietes","champignons des bois":"champignon varietes","champignons seches":"champignon varietes","champignons forestiers":"champignon varietes","asperge":"asperge","asperge blanche":"asperge","asperge verte":"asperge","asperge violette":"asperge","pointe dasperge":"asperge","asparagus":"asperge","haricot vert":"haricot vert","haricots verts":"haricot vert","haricot extrafin":"haricot vert","bobby beans":"haricot vert","green beans":"haricot vert","haricot mangetout":"haricot vert","haricot plat":"haricot vert","petit pois":"petit pois","petits pois":"petit pois","pois":"petit pois","pois frais":"petit pois","pois surgeles":"petit pois","pois de senteur":"petit pois","garden peas":"petit pois","mais grain":"mais grain","mais doux":"mais grain","grains de mais":"mais grain","mais en boite":"mais grain","corn":"mais grain","mais surgele":"mais grain","mais cuit":"mais grain","artichaut":"artichaut","fond dartichaut":"artichaut","coeur dartichaut":"artichaut","artichaut breton":"artichaut","artichaut violet":"artichaut","artichoke":"artichaut","betterave rouge":"betterave rouge","betterave":"betterave rouge","betterave cuite":"betterave rouge","betteraves rouges":"betterave rouge","beet":"betterave rouge","beet root":"betterave rouge","betterave chioggia":"betterave rouge","radis":"radis","radis rose":"radis","radis rouge":"radis","radis blanc":"radis","radis noir":"radis","daikon":"radis","raphanus":"radis","navet":"navet","navet blanc":"navet","navet de nancy":"navet","turnip":"navet","navet long":"navet","navet rond":"navet","panais":"panais","panais blanc":"panais","parsnip":"panais","racine de panais":"panais","rhubarbe":"rhubarbe","tige de rhubarbe":"rhubarbe","rhubarbe fraiche":"rhubarbe","rhubarbe a confiture":"rhubarbe","rhubarb":"rhubarbe","blette bette a carde":"blette bette a carde","blettes":"blette bette a carde","bettes":"blette bette a carde","cotes de blettes":"blette bette a carde","chard":"blette bette a carde","bette a carde":"blette bette a carde","swiss chard":"blette bette a carde","potiron courge butternut":"potiron courge butternut","butternut":"potiron courge butternut","potiron":"potiron courge butternut","courge":"potiron courge butternut","pumpkin":"potiron courge butternut","squash":"potiron courge butternut","courge musquee":"potiron courge butternut","giraumon":"potiron courge butternut","jack be little":"potiron courge butternut","potimarron":"potimarron","potimarron rouge":"potimarron","courge hokkaido":"potimarron","red kuri squash":"potimarron","courge japonaise":"potimarron","avocat":"avocat","avocat hass":"avocat","avocat florida":"avocat","avocat mur":"avocat","avocado":"avocat","avocat a point":"avocat","guacamole":"avocat","pak choi":"pak choi","bok choy":"pak choi","chou chinois":"pak choi","bette chinoise":"pak choi","chou de shanghai":"pak choi","gingembre frais":"gingembre frais","racine de gingembre":"gingembre frais","gingembre":"gingembre frais","ginger":"gingembre frais","gingembre rape":"gingembre frais","rhizome de gingembre":"gingembre frais","piment frais":"piment frais","piment rouge":"piment frais","piment vert":"piment frais","piment oiseau":"piment frais","chili frais":"piment frais","jalapeno":"piment frais","piment fort":"piment frais","olives":"olives","olives noires":"olives","olives vertes":"olives","olives kalamata":"olives","olives denoyautees":"olives","tapenade":"olives","cornichon":"cornichon","cornichons au vinaigre":"cornichon","petit cornichon":"cornichon","gherkin":"cornichon","cornichon malossol":"cornichon","pickle":"cornichon","capres":"capres","capres au vinaigre":"capres","capres en saumure":"capres","caprons":"capres","capers":"capres","coeur de palmier":"coeur de palmier","coeurs de palmier":"coeur de palmier","palmito":"coeur de palmier","heart of palm":"coeur de palmier","palm heart":"coeur de palmier","broccolini romanesco":"broccolini romanesco","broccolini":"broccolini romanesco","romanesco":"broccolini romanesco","chou romanesco":"broccolini romanesco","brocoli tige":"broccolini romanesco","tenderstem":"broccolini romanesco","choufleur romanesco":"broccolini romanesco","pomme":"pomme","pomme golden":"pomme","pomme granny smith":"pomme","pomme fuji":"pomme","pomme pink lady":"pomme","pomme gala":"pomme","pomme cox":"pomme","pomme de terre sucree":"pomme","poire":"poire","poire william":"poire","poire conference":"poire","poire bosc":"poire","poire comice":"poire","poire bartlett":"poire","banane":"banane","banane jaune":"banane","banane mure":"banane","banana":"banane","banane cavendish":"banane","banane des antilles":"banane","orange":"orange","orange navel":"orange","orange sanguine":"orange","orange valencia":"orange","jus dorange":"orange","oranges fraiches":"orange","citron":"citron","citron jaune":"citron","citron de menton":"citron","lemon":"citron","jus de citron":"citron","zeste de citron":"citron","citron non traite":"citron","citron vert":"citron vert","lime":"citron vert","citron vert tahiti":"citron vert","jus de citron vert":"citron vert","zeste de citron vert":"citron vert","kaffir lime":"citron vert","pamplemousse":"pamplemousse","pomelo":"pamplemousse","grapefruit":"pamplemousse","pamplemousse rose":"pamplemousse","pamplemousse jaune":"pamplemousse","mandarine clementine":"mandarine clementine","clementine":"mandarine clementine","mandarine":"mandarine clementine","tangerine":"mandarine clementine","clementine de corse":"mandarine clementine","satsuma":"mandarine clementine","raisin blanc":"raisin blanc","raisin vert":"raisin blanc","raisin muscat blanc":"raisin blanc","raisin chasselas":"raisin blanc","grapes":"raisin blanc","raisin noir":"raisin noir","raisin rouge":"raisin noir","raisin muscat noir":"raisin noir","raisin cardinal":"raisin noir","red grapes":"raisin noir","fraise":"fraise","fraises":"fraise","fraise gariguette":"fraise","fraise mara des bois":"fraise","fraise charlotte":"fraise","strawberry":"fraise","fraise de plein champ":"fraise","framboise":"framboise","framboises":"framboise","framboise fraiche":"framboise","raspberry":"framboise","framboise surgelee":"framboise","myrtille":"myrtille","myrtilles":"myrtille","blueberry":"myrtille","airelle noire":"myrtille","bilberry":"myrtille","myrtille sauvage":"myrtille","cerise":"cerise","cerises":"cerise","bigarreau":"cerise","griotte":"cerise","cerise noire":"cerise","cherry":"cerise","cerise fraiche":"cerise","peche nectarine":"peche nectarine","peche":"peche nectarine","nectarine":"peche nectarine","brugnon":"peche nectarine","peche blanche":"peche nectarine","peche jaune":"peche nectarine","peach":"peche nectarine","abricot":"abricot","abricots":"abricot","abricot bergeron":"abricot","apricot":"abricot","abricot frais":"abricot","prune":"prune","prunes":"prune","quetsche":"prune","mirabelle":"prune","reineclaude":"prune","plum":"prune","prune dagen":"prune","figue":"figue","figues fraiches":"figue","figue violette":"figue","figue blanche":"figue","fig":"figue","figue de barbarie":"figue","kiwi":"kiwi","kiwi vert":"kiwi","kiwi jaune":"kiwi","kiwi gold":"kiwi","actinidia":"kiwi","zespri":"kiwi","mangue":"mangue","mangue fraiche":"mangue","mangue ataulfo":"mangue","mangue alphonso":"mangue","mango":"mangue","mangue tommy":"mangue","ananas":"ananas","ananas frais":"ananas","ananas en conserve":"ananas","ananas victoria":"ananas","pineapple":"ananas","ananas tranche":"ananas","pasteque":"pasteque","pasteque rouge":"pasteque","melon deau":"pasteque","watermelon":"pasteque","pasteque sans pepins":"pasteque","melon":"melon","melon charentais":"melon","melon jaune":"melon","melon brode":"melon","cantaloupe":"melon","honeydew":"melon","gallia":"melon","noix de coco":"noix de coco","noix de coco fraiche":"noix de coco","chair de coco":"noix de coco","coco rapee":"noix de coco","coconut":"noix de coco","noix de coco sechee":"noix de coco","fruit de la passion":"fruit de la passion","maracuja":"fruit de la passion","passion fruit":"fruit de la passion","grenadille":"fruit de la passion","fruit passion":"fruit de la passion","pulpe de passion":"fruit de la passion","litchi":"litchi","lychee":"litchi","litchis":"litchi","letchi":"litchi","lichi":"litchi","grenade":"grenade","grenade rouge":"grenade","arilles de grenade":"grenade","pomegranate":"grenade","grains de grenade":"grenade","papaye":"papaye","papaye fraiche":"papaye","papaye verte":"papaye","pawpaw":"papaye","papaye tropicale":"papaye","datte":"datte","dattes fraiches":"datte","dattes medjool":"datte","dattes deglet nour":"datte","date fruit":"datte","pruneaux":"pruneaux","pruneau dagen":"pruneaux","pruneaux secs":"pruneaux","prune sechee":"pruneaux","dried plum":"pruneaux","raisins secs":"raisins secs","raisins de corinthe":"raisins secs","sultanes":"raisins secs","sultanines":"raisins secs","raisins dores":"raisins secs","dried grapes":"raisins secs","currants":"raisins secs","abricots secs":"abricots secs","abricot deshydrate":"abricots secs","abricot seche":"abricots secs","dried apricots":"abricots secs","abricots moelleux":"abricots secs","figues sechees":"figues sechees","figue seche":"figues sechees","figues deshydratees":"figues sechees","dried figs":"figues sechees","cranberry airelle":"cranberry airelle","cranberry":"cranberry airelle","airelle rouge":"cranberry airelle","canneberge":"cranberry airelle","cranberries sechees":"cranberry airelle","airelle americaine":"cranberry airelle","mure":"mure","mures sauvages":"mure","mure de ronce":"mure","blackberry":"mure","mure de bourgogne":"mure","groseille":"groseille","groseille rouge":"groseille","groseille a maquereau":"groseille","cassis":"groseille","redcurrant":"groseille","blackcurrant":"groseille","banane plantain":"banane plantain","plantain":"banane plantain","banane a cuire":"banane plantain","banane verte":"banane plantain","alloco":"banane plantain","tostones":"banane plantain","lentilles vertes":"lentilles vertes","lentilles":"lentilles vertes","lentilles du puy":"lentilles vertes","lentilles blondes":"lentilles vertes","lentilles beluga":"lentilles vertes","green lentils":"lentilles vertes","lentilles corail":"lentilles corail","lentilles rouges":"lentilles corail","red lentils":"lentilles corail","lentilles oranges":"lentilles corail","masoor dal":"lentilles corail","pois chiches":"pois chiches","chickpeas":"pois chiches","garbanzo":"pois chiches","pois chiche en boite":"pois chiches","houmous":"pois chiches","ceci":"pois chiches","pois chiches cuits":"pois chiches","haricots blancs":"haricots blancs","haricots cocos":"haricots blancs","lingots":"haricots blancs","navy beans":"haricots blancs","white beans":"haricots blancs","haricots tarbais":"haricots blancs","flageolets":"haricots blancs","haricots rouges":"haricots rouges","red kidney beans":"haricots rouges","haricots rouges en boite":"haricots rouges","kidney beans":"haricots rouges","haricots a la mexicaine":"haricots rouges","haricots noirs":"haricots noirs","black beans":"haricots noirs","haricots noirs mexicains":"haricots noirs","frijoles negros":"haricots noirs","turtle beans":"haricots noirs","pois casses":"pois casses","pois casses jaunes":"pois casses","pois casses verts":"pois casses","split peas":"pois casses","puree de pois":"pois casses","feves":"feves","feves fraiches":"feves","feves seches":"feves","broad beans":"feves","feve de marais":"feves","ful medames":"feves","edamame soja vert":"edamame soja vert","edamame":"edamame soja vert","soja vert":"edamame soja vert","feve de soja":"edamame soja vert","green soybeans":"edamame soja vert","mukimame":"edamame soja vert","pomme de terre":"pomme de terre","patate":"pomme de terre","pommes de terre":"pomme de terre","charlotte":"pomme de terre","bintje":"pomme de terre","ratte":"pomme de terre","agata":"pomme de terre","potato":"pomme de terre","spud":"pomme de terre","vapeur":"pomme de terre","puree":"pomme de terre","frites":"pomme de terre","patate douce":"patate douce","sweet potato":"patate douce","patate douce orange":"patate douce","patate douce violette":"patate douce","batata":"patate douce","camote":"patate douce","manioc":"manioc","cassava":"manioc","yuca":"manioc","tapioca":"manioc","farine de manioc":"manioc","racine de manioc":"manioc","topinambour":"topinambour","jerusalem artichoke":"topinambour","artichaut de jerusalem":"topinambour","soleil vivace":"topinambour","poire de terre":"topinambour","igname":"igname","yam":"igname","igname blanc":"igname","igname violet":"igname","tubercule africain":"igname","pates blanches":"pates blanches","spaghetti":"pates blanches","penne":"pates blanches","tagliatelles":"pates blanches","fusilli":"pates blanches","farfalle":"pates blanches","rigatoni":"pates blanches","macaroni":"pates blanches","linguine":"pates blanches","fettuccine":"pates blanches","pates":"pates blanches","vermicelles":"pates blanches","capellini":"pates blanches","orecchiette":"pates blanches","conchiglie":"pates blanches","pates completes":"pates completes","pates de ble complet":"pates completes","spaghetti complets":"pates completes","penne completes":"pates completes","whole wheat pasta":"pates completes","pates integrales":"pates completes","pates aux oeufs":"pates aux oeufs","tagliatelles aux oeufs":"pates aux oeufs","pappardelle":"pates aux oeufs","pates fraiches":"pates aux oeufs","egg pasta":"pates aux oeufs","pates jaunes":"pates aux oeufs","pates sans gluten":"pates sans gluten","pates de riz":"pates sans gluten","pates de mais":"pates sans gluten","pates gluten free":"pates sans gluten","pasta sans gluten":"pates sans gluten","pates coeliaques":"pates sans gluten","riz blanc":"riz blanc","riz":"riz blanc","riz long grain":"riz blanc","riz a grains longs":"riz blanc","riz cuit":"riz blanc","white rice":"riz blanc","riz etuve":"riz blanc","riz complet":"riz complet","riz brun":"riz complet","brown rice":"riz complet","riz integral":"riz complet","riz semicomplet":"riz complet","whole grain rice":"riz complet","riz basmati":"riz basmati","basmati":"riz basmati","riz indien":"riz basmati","riz parfume":"riz basmati","basmati blanc":"riz basmati","riz a curry":"riz basmati","riz risotto arborio":"riz risotto arborio","arborio":"riz risotto arborio","carnaroli":"riz risotto arborio","vialone nano":"riz risotto arborio","riz a risotto":"riz risotto arborio","riz italien":"riz risotto arborio","semoule couscous":"semoule couscous","couscous":"semoule couscous","semoule de ble":"semoule couscous","semoule fine":"semoule couscous","semoule moyenne":"semoule couscous","semoule grosse":"semoule couscous","couscous precuit":"semoule couscous","quinoa":"quinoa","quinoa blanc":"quinoa","quinoa rouge":"quinoa","quinoa noir":"quinoa","quinoa tricolore":"quinoa","quinoa cuit":"quinoa","polenta":"polenta","polenta instantanee":"polenta","farine de mais jaune":"polenta","polenta precuite":"polenta","polenta italienne":"polenta","cornmeal":"polenta","boulgour ble":"boulgour ble","boulgour":"boulgour ble","bulgur":"boulgour ble","ble concasse":"boulgour ble","ble dur":"boulgour ble","taboule":"boulgour ble","freekeh":"boulgour ble","epeautre":"boulgour ble","sarrasin":"sarrasin","sarrasin decortique":"sarrasin","ble noir":"sarrasin","kasha":"sarrasin","buckwheat":"sarrasin","gruau de sarrasin":"sarrasin","flocons davoine":"flocons davoine","avoine":"flocons davoine","rolled oats":"flocons davoine","oats":"flocons davoine","porridge":"flocons davoine","muesli base":"flocons davoine","flocons fins":"flocons davoine","flocons epais":"flocons davoine","gruau davoine":"flocons davoine","orge orge perle":"orge orge perle","orge perle":"orge orge perle","orge monde":"orge orge perle","pearl barley":"orge orge perle","barley":"orge orge perle","orge cuit":"orge orge perle","millet":"millet","millet decortique":"millet","millet jaune":"millet","millet blanc":"millet","cereale millet":"millet","pain blanc baguette campagne":"pain blanc baguette campagne","baguette":"pain blanc baguette campagne","pain de campagne":"pain blanc baguette campagne","pain blanc":"pain blanc baguette campagne","pain ordinaire":"pain blanc baguette campagne","pain tradition":"pain blanc baguette campagne","ficelle":"pain blanc baguette campagne","pain boulanger":"pain blanc baguette campagne","pain de mie blanc":"pain de mie blanc","pain de mie":"pain de mie blanc","sandwich bread":"pain de mie blanc","pain americain":"pain de mie blanc","pain toast":"pain de mie blanc","pain en tranches":"pain de mie blanc","pain complet aux cereales":"pain complet aux cereales","pain complet":"pain complet aux cereales","pain aux cereales":"pain complet aux cereales","pain de ble complet":"pain complet aux cereales","pain multicereales":"pain complet aux cereales","wholemeal bread":"pain complet aux cereales","pain integral":"pain complet aux cereales","pain de seigle":"pain de seigle","pain au seigle":"pain de seigle","rye bread":"pain de seigle","pumpernickel":"pain de seigle","pain nordique":"pain de seigle","knackebrod":"pain de seigle","pain sans gluten":"pain sans gluten","pain gluten free":"pain sans gluten","pain coeliaques":"pain sans gluten","pain de riz":"pain sans gluten","pain sans gluten tranche":"pain sans gluten","pain pita naan":"pain pita naan","pita":"pain pita naan","naan":"pain pita naan","pain libanais":"pain pita naan","pain plat":"pain pita naan","flatbread":"pain pita naan","tortilla de ble":"pain pita naan","wrap":"pain pita naan","lavash":"pain pita naan","biscottes":"biscottes","biscotte complete":"biscottes","tartine grillee":"biscottes","zwiebach":"biscottes","toast grille":"biscottes","crackers pain craquant":"crackers pain craquant","crackers":"crackers pain craquant","pain craquant":"crackers pain craquant","crispbread":"crackers pain craquant","galette de riz":"crackers pain craquant","wasa":"crackers pain craquant","ryvita":"crackers pain craquant","chapelure panure":"chapelure panure","chapelure":"chapelure panure","panure":"chapelure panure","breadcrumbs":"chapelure panure","panko":"chapelure panure","chapelure maison":"chapelure panure","croutons":"chapelure panure","beurre doux":"beurre doux","beurre":"beurre doux","beurre de cuisine":"beurre doux","beurre de qualite":"beurre doux","sweet butter":"beurre doux","beurre frais":"beurre doux","beurre fondu":"beurre doux","noix de beurre":"beurre doux","beurre demisel":"beurre demisel","beurre sale":"beurre demisel","beurre breton":"beurre demisel","beurre de baratte":"beurre demisel","salted butter":"beurre demisel","beurre allege":"beurre allege","beurre leger":"beurre allege","beurre light":"beurre allege","beurre 41":"beurre allege","beurre reduit en graisses":"beurre allege","ghee":"ghee","beurre clarifie":"ghee","ghee indien":"ghee","beurre purifie":"ghee","clarified butter":"ghee","samn":"ghee","margarine":"margarine","margarine vegetale":"margarine","matiere grasse vegetale":"margarine","flora":"margarine","margarine allegee":"margarine","huile dolive":"huile dolive","huile dolive vierge":"huile dolive","huile dolive extra vierge":"huile dolive","evoo":"huile dolive","huile olive":"huile dolive","olive oil":"huile dolive","huile de tournesol":"huile de tournesol","huile vegetale":"huile de tournesol","huile neutre":"huile de tournesol","sunflower oil":"huile de tournesol","huile de friture":"huile de tournesol","huile de colza":"huile de colza","rapeseed oil":"huile de colza","canola oil":"huile de colza","huile colza vierge":"huile de colza","huile de noix":"huile de noix","huile de noix vierge":"huile de noix","walnut oil":"huile de noix","huile de noix premiere pression":"huile de noix","huile de coco":"huile de coco","huile de noix de coco":"huile de coco","coconut oil":"huile de coco","huile coco vierge":"huile de coco","huile de coprah":"huile de coco","saindoux":"saindoux","graisse de porc":"saindoux","lard":"saindoux","lard fondu":"saindoux","graisse de canard":"saindoux","schmaltz":"saindoux","amandes":"amandes","amande entiere":"amandes","amande effilee":"amandes","amande en poudre":"amandes","poudre damande":"amandes","almonds":"amandes","amande grillee":"amandes","noisettes":"noisettes","noisette entiere":"noisettes","noisette grillee":"noisettes","hazelnuts":"noisettes","praline noisette":"noisettes","poudre de noisette":"noisettes","noix":"noix","noix de grenoble":"noix","cerneaux de noix":"noix","walnuts":"noix","noix fraiche":"noix","noix seche":"noix","noix de cajou":"noix de cajou","cajou":"noix de cajou","anacarde":"noix de cajou","cashew":"noix de cajou","noix cajou grillee":"noix de cajou","cashew nuts":"noix de cajou","pistaches":"pistaches","pistache":"pistaches","pistache diran":"pistaches","pistache decortiquee":"pistaches","pistaches salees":"pistaches","pistachios":"pistaches","cacahuetes arachides":"cacahuetes arachides","cacahuete":"cacahuetes arachides","arachide":"cacahuetes arachides","peanuts":"cacahuetes arachides","cacahuetes grillees":"cacahuetes arachides","cacahuetes salees":"cacahuetes arachides","noix de macadamia":"noix de macadamia","macadamia":"noix de macadamia","noix hawaienne":"noix de macadamia","macadamia nuts":"noix de macadamia","noix du bresil":"noix du bresil","brazil nuts":"noix du bresil","bertholletia":"noix du bresil","noix damazonie":"noix du bresil","pignons de pin":"pignons de pin","pignons":"pignons de pin","pine nuts":"pignons de pin","pinones":"pignons de pin","pignoli":"pignons de pin","graines de sesame":"graines de sesame","sesame":"graines de sesame","graines de sesame blanc":"graines de sesame","sesame noir":"graines de sesame","sesame seeds":"graines de sesame","sesame grille":"graines de sesame","graines de tournesol":"graines de tournesol","tournesol":"graines de tournesol","graines de soleil":"graines de tournesol","sunflower seeds":"graines de tournesol","pepitas de tournesol":"graines de tournesol","graines de courge":"graines de courge","pepitas":"graines de courge","graines de potiron":"graines de courge","pumpkin seeds":"graines de courge","graines vertes":"graines de courge","kurbiskerne":"graines de courge","graines de lin":"graines de lin","lin dore":"graines de lin","lin brun":"graines de lin","flaxseed":"graines de lin","graines de lin moulues":"graines de lin","linseed":"graines de lin","graines de chia":"graines de chia","chia":"graines de chia","graines de chia blanc":"graines de chia","chia seeds":"graines de chia","chia noir":"graines de chia","graines de pavot":"graines de pavot","pavot":"graines de pavot","graines de coquelicot":"graines de pavot","poppy seeds":"graines de pavot","mohn":"graines de pavot","noix de pecan":"noix de pecan","pecan":"noix de pecan","pacane":"noix de pecan","pecan nuts":"noix de pecan","noix pecan":"noix de pecan","cerneaux de pecan":"noix de pecan","sel":"sel","sel fin":"sel","sel de mer":"sel","sel de guerande":"sel","fleur de sel":"sel","sel rose":"sel","sel de table":"sel","salt":"sel","poivre noir":"poivre noir","poivre":"poivre noir","poivre moulu":"poivre noir","poivre concasse":"poivre noir","black pepper":"poivre noir","poivre de kampot":"poivre noir","mignonette":"poivre noir","paprika":"paprika","paprika doux":"paprika","paprika fume":"paprika","paprika fort":"paprika","pimenton":"paprika","sweet paprika":"paprika","cumin":"cumin","cumin en poudre":"cumin","cumin moulu":"cumin","cumin seeds":"cumin","graines de cumin":"cumin","comino":"cumin","coriandre poudre":"coriandre poudre","coriandre moulue":"coriandre poudre","coriandre en poudre":"coriandre poudre","graines de coriandre":"coriandre poudre","coriander powder":"coriandre poudre","curry colombo":"curry colombo","curry en poudre":"curry colombo","poudre de curry":"curry colombo","masala":"curry colombo","garam masala":"curry colombo","colombo":"curry colombo","madras curry":"curry colombo","curry mild":"curry colombo","curry fort":"curry colombo","curcuma":"curcuma","curcuma en poudre":"curcuma","safran des indes":"curcuma","turmeric":"curcuma","kurkuma":"curcuma","cannelle":"cannelle","cannelle en poudre":"cannelle","baton de cannelle":"cannelle","cannelle de ceylan":"cannelle","cinnamon":"cannelle","cassia":"cannelle","noix de muscade":"noix de muscade","muscade":"noix de muscade","muscade rapee":"noix de muscade","nutmeg":"noix de muscade","noix de muscade entiere":"noix de muscade","piment en poudre cayenne":"piment en poudre cayenne","piment de cayenne":"piment en poudre cayenne","chili powder":"piment en poudre cayenne","piment despelette":"piment en poudre cayenne","piment rouge moulu":"piment en poudre cayenne","cayenne pepper":"piment en poudre cayenne","thym":"thym","thym seche":"thym","branche de thym":"thym","thym frais":"thym","thyme":"thym","serpolet":"thym","romarin":"romarin","romarin frais":"romarin","branche de romarin":"romarin","romarin seche":"romarin","rosemary":"romarin","rosmarin":"romarin","laurier":"laurier","feuille de laurier":"laurier","laurier sauce":"laurier","bay leaf":"laurier","laurier seche":"laurier","basilic":"basilic","basilic frais":"basilic","basilic grand vert":"basilic","feuilles de basilic":"basilic","basilic seche":"basilic","basil":"basilic","basilic thai":"basilic","persil":"persil","persil plat":"persil","persil frise":"persil","persil frais":"persil","persil hache":"persil","parsley":"persil","persil seche":"persil","ciboulette":"ciboulette","ciboulette fraiche":"ciboulette","brins de ciboulette":"ciboulette","chives":"ciboulette","civette":"ciboulette","ciboulette ciselee":"ciboulette","origan":"origan","origan seche":"origan","origan frais":"origan","origanum":"origan","marjolaine sauvage":"origan","oregano":"origan","menthe":"menthe","menthe fraiche":"menthe","feuilles de menthe":"menthe","menthe poivree":"menthe","menthe verte":"menthe","mint":"menthe","menthe sechee":"menthe","menthe marocaine":"menthe","estragon":"estragon","estragon frais":"estragon","estragon francais":"estragon","tarragon":"estragon","estragon seche":"estragon","sauge":"sauge","sauge fraiche":"sauge","feuille de sauge":"sauge","sauge sechee":"sauge","sage":"sauge","salvia":"sauge","aneth":"aneth","aneth frais":"aneth","dill":"aneth","fenouil batard":"aneth","aneth seche":"aneth","brins daneth":"aneth","cerfeuil":"cerfeuil","cerfeuil frais":"cerfeuil","cerfeuil hache":"cerfeuil","chervil":"cerfeuil","cerfeuil seche":"cerfeuil","herbes de provence":"herbes de provence","melange herbes de provence":"herbes de provence","herbes provencales":"herbes de provence","bouquet garni":"herbes de provence","fines herbes":"herbes de provence","ras el hanout":"ras el hanout","raselhanout":"ras el hanout","epices marocaines":"ras el hanout","melange maghrebin":"ras el hanout","epices orientales":"ras el hanout","quatre epices":"quatre epices","quatreepices":"quatre epices","melange quatre epices":"quatre epices","epices charcuterie":"quatre epices","allspice blend":"quatre epices","cardamome":"cardamome","cardamome verte":"cardamome","cardamome noire":"cardamome","cardamom":"cardamome","cardamome en poudre":"cardamome","gousses de cardamome":"cardamome","elachi":"cardamome","farine de ble t45 t55":"farine de ble t45 t55","farine":"farine de ble t45 t55","farine blanche":"farine de ble t45 t55","farine de ble":"farine de ble t45 t55","farine t55":"farine de ble t45 t55","farine t45":"farine de ble t45 t55","farine patissiere":"farine de ble t45 t55","allpurpose flour":"farine de ble t45 t55","farine complete t110 t150":"farine complete t110 t150","farine integrale":"farine complete t110 t150","farine de ble complet":"farine complete t110 t150","whole wheat flour":"farine complete t110 t150","farine t110":"farine complete t110 t150","farine t150":"farine complete t110 t150","farine brune":"farine complete t110 t150","farine de mais":"farine de mais","masa harina":"farine de mais","farine de polenta":"farine de mais","cornflour":"farine de mais","maizena jaune":"farine de mais","fecule de mais maizena":"fecule de mais maizena","maizena":"fecule de mais maizena","fecule":"fecule de mais maizena","fecule de mais":"fecule de mais maizena","cornstarch":"fecule de mais maizena","amidon de mais":"fecule de mais maizena","epaississant":"fecule de mais maizena","farine de riz":"farine de riz","farine de riz blanc":"farine de riz","rice flour":"farine de riz","farine de riz complet":"farine de riz","amidon de riz":"farine de riz","levure chimique":"levure chimique","levure":"levure chimique","baking powder":"levure chimique","poudre levante":"levure chimique","levure alsacienne":"levure chimique","sachet de levure":"levure chimique","levure de boulanger":"levure de boulanger","levure fraiche":"levure de boulanger","levure boulangere":"levure de boulanger","levure seche":"levure de boulanger","instant yeast":"levure de boulanger","dry yeast":"levure de boulanger","sachet levure boulanger":"levure de boulanger","bicarbonate de soude":"bicarbonate de soude","bicarbonate":"bicarbonate de soude","baking soda":"bicarbonate de soude","bicarbonate alimentaire":"bicarbonate de soude","carbonate de sodium":"bicarbonate de soude","cacao en poudre":"cacao en poudre","cacao non sucre":"cacao en poudre","poudre de cacao":"cacao en poudre","chocolat en poudre":"cacao en poudre","cocoa powder":"cacao en poudre","cacao amer":"cacao en poudre","van houten":"cacao en poudre","vanille extrait gousse":"vanille extrait gousse","gousse de vanille":"vanille extrait gousse","extrait de vanille":"vanille extrait gousse","vanille bourbon":"vanille extrait gousse","vanilline":"vanille extrait gousse","arome vanille":"vanille extrait gousse","vanilla extract":"vanille extrait gousse","gelatine":"gelatine","feuille de gelatine":"gelatine","gelatine en poudre":"gelatine","colle de poisson":"gelatine","feuilles dor":"gelatine","agaragar":"agaragar","agar":"agaragar","gelifiant vegetal":"agaragar","agaragar en poudre":"agaragar","kanten":"agaragar","gelatine vegane":"agaragar","lait de coco conserve":"lait de coco conserve","lait de coco":"lait de coco conserve","coconut milk":"lait de coco conserve","lait de noix de coco":"lait de coco conserve","lait de coco entier":"lait de coco conserve","lait coco leger":"lait de coco conserve","tahini puree de sesame":"tahini puree de sesame","tahini":"tahini puree de sesame","puree de sesame":"tahini puree de sesame","tahin":"tahini puree de sesame","tahine":"tahini puree de sesame","pate de sesame":"tahini puree de sesame","sesame paste":"tahini puree de sesame","miso":"miso","miso blanc":"miso","miso rouge":"miso","shiro miso":"miso","pate miso":"miso","miso paste":"miso","hatcho miso":"miso","mayonnaise":"mayonnaise","mayo":"mayonnaise","mayonnaise maison":"mayonnaise","mayonnaise allegee":"mayonnaise","aioli":"mayonnaise","sauce mayo":"mayonnaise","moutarde":"moutarde","moutarde de dijon":"moutarde","moutarde a lancienne":"moutarde","moutarde forte":"moutarde","mustard":"moutarde","moutarde douce":"moutarde","moutarde miforte":"moutarde","ketchup":"ketchup","ketchup tomate":"ketchup","sauce ketchup":"ketchup","tomato ketchup":"ketchup","catsup":"ketchup","sauce tomate sucree":"ketchup","sauce soja":"sauce soja","soja":"sauce soja","shoyu":"sauce soja","tamari":"sauce soja","sauce soya":"sauce soja","soy sauce":"sauce soja","sauce soja salee":"sauce soja","soja sans gluten":"sauce soja","vinaigre blanc":"vinaigre blanc","vinaigre dalcool":"vinaigre blanc","vinaigre cristal":"vinaigre blanc","white vinegar":"vinaigre blanc","vinaigre de vin blanc":"vinaigre blanc","vinaigre de cidre":"vinaigre blanc","vinaigre balsamique":"vinaigre balsamique","balsamique":"vinaigre balsamique","vinaigre de modene":"vinaigre balsamique","balsamic vinegar":"vinaigre balsamique","condiment balsamique":"vinaigre balsamique","creme balsamique":"vinaigre balsamique","sauce tomate conserve":"sauce tomate conserve","sauce tomate":"sauce tomate conserve","coulis de tomate":"sauce tomate conserve","passata":"sauce tomate conserve","sugo":"sauce tomate conserve","salsa di pomodoro":"sauce tomate conserve","sauce bolognaise de base":"sauce tomate conserve","concentre de tomate":"concentre de tomate","concentre tomate":"concentre de tomate","double concentre":"concentre de tomate","tomato paste":"concentre de tomate","puree de tomate concentree":"concentre de tomate","extrait de tomate":"concentre de tomate","bouillon cube fond":"bouillon cube fond","bouillon cube":"bouillon cube fond","fond de veau":"bouillon cube fond","fond de volaille":"bouillon cube fond","stock cube":"bouillon cube fond","bouillon de legumes":"bouillon cube fond","bouillon de boeuf":"bouillon cube fond","dashi":"bouillon cube fond","broth":"bouillon cube fond","huile de sesame":"huile de sesame","huile de sesame grille":"huile de sesame","sesame oil":"huile de sesame","huile sesame toaste":"huile de sesame","huile de sesame asiatique":"huile de sesame","sauce worcestershire":"sauce worcestershire","worcestershire":"sauce worcestershire","sauce anglaise":"sauce worcestershire","lea perrins":"sauce worcestershire","worcester sauce":"sauce worcestershire","sucre blanc":"sucre blanc","sucre":"sucre blanc","sucre semoule":"sucre blanc","sucre cristallise":"sucre blanc","sucre en poudre":"sucre blanc","white sugar":"sucre blanc","sucre de table":"sucre blanc","sucre roux cassonade":"sucre roux cassonade","cassonade":"sucre roux cassonade","sucre roux":"sucre roux cassonade","vergeoise":"sucre roux cassonade","brown sugar":"sucre roux cassonade","raw sugar":"sucre roux cassonade","sucre de canne":"sucre roux cassonade","sucre glace":"sucre glace","sucre impalpable":"sucre glace","sucre en poudre fine":"sucre glace","powdered sugar":"sucre glace","icing sugar":"sucre glace","sucre a glacer":"sucre glace","sirop derable":"sirop derable","maple syrup":"sirop derable","sirop derable pur":"sirop derable","sirop erable grade a":"sirop derable","sirop derable canadien":"sirop derable","miel":"miel","miel toutes fleurs":"miel","miel dacacia":"miel","miel de lavande":"miel","honey":"miel","miel liquide":"miel","miel cremeux":"miel","confiture generique":"confiture generique","confiture de fraises":"confiture generique","confiture dabricots":"confiture generique","marmelade":"confiture generique","jam":"confiture generique","gelee de fruits":"confiture generique","confiture maison":"confiture generique","chocolat noir tablette":"chocolat noir tablette","chocolat noir":"chocolat noir tablette","chocolat 70":"chocolat noir tablette","chocolat de couverture":"chocolat noir tablette","dark chocolate":"chocolat noir tablette","chocolat patissier":"chocolat noir tablette","chocolat a cuire":"chocolat noir tablette","chocolat au lait tablette":"chocolat au lait tablette","chocolat au lait":"chocolat au lait tablette","milk chocolate":"chocolat au lait tablette","chocolat lait":"chocolat au lait tablette","chocolat dessert lait":"chocolat au lait tablette","chocolat blanc":"chocolat blanc","chocolat blanc patissier":"chocolat blanc","white chocolate":"chocolat blanc","chocolat ivoire":"chocolat blanc","couverture ivoire":"chocolat blanc","pepites de chocolat":"pepites de chocolat","chips de chocolat":"pepites de chocolat","pepites":"pepites de chocolat","chocolate chips":"pepites de chocolat","chunks de chocolat":"pepites de chocolat","pastilles de chocolat":"pepites de chocolat","pate a tartiner type nutella":"pate a tartiner type nutella","pate a tartiner chocolat":"pate a tartiner type nutella","nutella":"pate a tartiner type nutella","spread chocolat":"pate a tartiner type nutella","creme noisette chocolat":"pate a tartiner type nutella","pate noisette":"pate a tartiner type nutella","beurre de cacahuete":"beurre de cacahuete","peanut butter":"beurre de cacahuete","creme darachide":"beurre de cacahuete","beurre darachide":"beurre de cacahuete","pate de cacahuete":"beurre de cacahuete","chips":"chips","chips de pomme de terre":"chips","crisps":"chips","chips salees":"chips","chips nature":"chips","snack croustillant":"chips","biscuits secs type petit beurre":"biscuits secs type petit beurre","petit beurre":"biscuits secs type petit beurre","sable":"biscuits secs type petit beurre","boudoir":"biscuits secs type petit beurre","speculoos":"biscuits secs type petit beurre","digestive":"biscuits secs type petit beurre","cookies":"biscuits secs type petit beurre","biscuit sec":"biscuits secs type petit beurre","cereales de petitdejeuner":"cereales de petitdejeuner","cornflakes":"cereales de petitdejeuner","cereales":"cereales de petitdejeuner","muslix":"cereales de petitdejeuner","frosties":"cereales de petitdejeuner","breakfast cereals":"cereales de petitdejeuner","cereales soufflees":"cereales de petitdejeuner","granola muesli":"granola muesli","granola maison":"granola muesli","muesli":"granola muesli","bircher":"granola muesli","granola avoine":"granola muesli","muesli croustillant":"granola muesli","trail mix":"granola muesli","yaourt":"yaourt nature"};

/**
 * whitelistLookup(normKey)
 * Retourne le normKey canonique si l'entrée est connue, sinon null.
 * Ex: whitelistLookup("spaghetti")   → "pates blanches"
 *     whitelistLookup("yogourt")     → "yaourt nature"
 *     whitelistLookup("carottes")    → "carotte"
 */
function whitelistLookup(normKey) {
  if (!normKey) return null;
  // 1. Lookup direct
  if (WL_IDX[normKey]) return WL_IDX[normKey];
  // 2. Dé-pluralisation
  const deplural = normKey.replace(/s$/, '');
  if (deplural !== normKey && WL_IDX[deplural]) return WL_IDX[deplural];
  return null;
}

/**
 * whitelistEntry(canonicalKey)
 * Retourne l'entrée complète d'un SKU canonique.
 */
const _WL_ENTRIES = Object.fromEntries(WHITELIST.map(e => [e.k, e]));
function whitelistEntry(canonicalKey) {
  return _WL_ENTRIES[canonicalKey] || null;
}
