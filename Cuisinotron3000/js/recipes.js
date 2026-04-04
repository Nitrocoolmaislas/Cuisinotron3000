// ══════════════════════════════════════════════
//  RECETTES — données RecipeML
// ══════════════════════════════════════════════
const RECIPES = [

  // ── REPAS CHAUDS ──
  {
    id: 'courge-farcie',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Courge farcie aux champignons et épinards',
    description: 'Une chair fondante, des champignons parfumés, des épinards juste tombés… et le tout gratiné au fromage. Une recette simple et chaleureuse qui sent bon l\'automne.',
    prepTime: 20, cookTime: 50, servings: 2,
    ingredients: [
      '1 courge spaghetti ou butternut',
      '500 g de champignons de Paris',
      '2 gousses d\'ail, hachées',
      'Thym',
      '200 g d\'épinards frais',
      '1 échalote, émincée',
      '75 g de fromage frais aux fines herbes (½ pot)',
      '50 g de fromage râpé',
      'Huile d\'olive',
      'Sel et poivre'
    ],
    steps: [
      'Préchauffer le four à 180 °C. Couper les courges en deux, retirer les graines, huiler, saler, poivrer.',
      'Enfourner 30 min.',
      'Garniture : dans une poêle huilée, faire revenir champignons, échalotes, ail et thym.',
      'Ajouter les épinards, laisser réduire, puis incorporer le fromage frais et 2 c. à s. d\'eau.',
      'Farcir les courges, parsemer de fromage râpé et gratiner 20 min jusqu\'à ce que le dessus soit doré et la chair fondante.'
    ],
    notes: 'Variantes : remplacer le fromage frais par du gorgonzola, feta ou chèvre. Garniture à base de saumon, épinards et courgettes. Ou quinoa, épinards, chèvre et petits lardons.'
  },
  {
    id: 'chili-con-carne',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Chili con carne',
    description: 'Un grand classique tex-mex, mijoté doucement pour révéler toutes ses saveurs. Parfait avec du riz, dans une tortilla ou simplement avec un avocat bien mûr.',
    prepTime: 15, cookTime: 45, servings: 3,
    ingredients: [
      '250 g de bœuf haché',
      '1 oignon blanc, haché',
      '1 gousse d\'ail, hachée',
      '½ sachet de mélange d\'épices à chili (ou 1 càc de poudre de chili + 1 càc de cumin + ½ càc de cannelle)',
      '1 conserve de tomates en dés (400 g)',
      '2 poivrons rouges',
      '1 boîte de haricots rouges',
      '1 conserve de maïs (285 g égouttés)',
      '2 feuilles de laurier (optionnel)',
      'Sel'
    ],
    steps: [
      'Base aromatique : dans un wok, faire revenir l\'oignon, l\'ail et le piment émincés dans un filet d\'huile à feu doux 3 min. Ajouter les poivrons en dés.',
      'Viande : incorporer le bœuf haché, cuire à feu vif 5 min, puis ajouter les épices.',
      'Ajouter le maïs et les haricots rouges.',
      'Mijotage : verser les tomates concassées et les feuilles de laurier. Réduire à feu doux, laisser mijoter 30 min.',
      'Finition : saler, poivrer, retirer le laurier. Servir chaud avec du riz, dans une tortilla ou sur un lit d\'avocat.'
    ],
    notes: 'Peut aussi être utilisé dans des tacos, surmonté de cottage et de cheddar râpé.'
  },
  {
    id: 'bowl-grecque',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Bowl grecque au quinoa et légumes grillés',
    description: 'Un mélange coloré et ensoleillé : légumes rôtis au paprika, quinoa parfumé au curry, feta crémeuse et un petit coup de pep\'s avec la sriracha. Simple, sain et plein de saveurs.',
    prepTime: 10, cookTime: 30, servings: 2,
    ingredients: [
      '1 courgette',
      '2 poivrons',
      '250 g de tomates cerises',
      '1 oignon rouge',
      'Paprika',
      'Curry',
      '1 aubergine (facultatif)',
      '60 g de feta',
      '200 g de quinoa',
      '2 gousses d\'ail hachées',
      '1 filet d\'huile d\'olive',
      'Quelques olives (facultatif)'
    ],
    steps: [
      'Four : préchauffer à 180 °C.',
      'Légumes : couper courgette et poivrons en dés, trancher l\'oignon rouge. Mettre sur une plaque avec les tomates cerises. Arroser d\'huile, parsemer d\'ail, saler et saupoudrer généreusement de paprika.',
      'Rôtissage : enfourner 30 à 35 min, en remuant 1 à 2 fois, jusqu\'à ce que les légumes soient tendres et légèrement dorés.',
      'Quinoa : cuire dans 2,5 volumes d\'eau salée parfumée au curry. Égoutter si nécessaire.',
      'Service : dresser le quinoa, ajouter les légumes grillés, parsemer de feta et d\'olives. Ajouter un filet de sriracha pour relever le tout.'
    ],
    notes: 'Pour encore plus de parfum, ajoutez un peu de zeste de citron au quinoa juste avant de servir.'
  },
  {
    id: 'nouilles-mauriciennes',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Nouilles sautées à la mauricienne',
    description: 'Un plat rapide, parfumé et plein de fraîcheur, où les nouilles s\'enrobent d\'une sauce au sésame, soja et vinaigre, relevée par le croquant des légumes sautés.',
    prepTime: 15, cookTime: 20, servings: 4,
    ingredients: [
      '300 g de nouilles',
      '3 carottes',
      '300 g de chou blanc (¼)',
      '100 g de germes de soja',
      '200 g de tofu ou de poulet',
      'Un filet d\'huile de sésame',
      'Jeunes oignons',
      'Sauce soja',
      'Sauce d\'huître',
      'Vinaigre blanc',
      '2 gousses d\'ail'
    ],
    steps: [
      'Marinade : couper le tofu ou le poulet en dés. Mélanger avec l\'ail, 3 c. à s. de sauce soja, 2 c. à s. de sauce d\'huître et 1 c. à s. d\'huile de sésame. Réserver au frais.',
      'Légumes : couper les carottes et le chou en fines lamelles. Dans une poêle bien chaude, faire sauter carottes et chou avec 1 c. à s. d\'huile de sésame pendant 5 min. Ajouter les germes de soja et cuire encore 2-3 min. Réserver.',
      'Nouilles : cuire selon les indications du paquet. Égoutter. Arroser d\'un filet de sauce soja.',
      'Protéine : dans la poêle, faire dorer le tofu ou le poulet avec sa marinade.',
      'Assemblage : baisser le feu, ajouter 3 c. à s. de vinaigre blanc, puis les légumes et les nouilles. Mélanger. Ajuster l\'assaisonnement.',
      'Service : parsemer de jeunes oignons. Ajouter piment et languettes d\'omelette si souhaité.'
    ],
    notes: ''
  },
  {
    id: 'soupe-lentilles',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Soupe de lentilles au garam masala',
    description: 'Un plat réconfortant, parfumé au garam masala, où les lentilles vertes et corail s\'unissent pour offrir texture et douceur. Idéal seul ou accompagné d\'un pain naan.',
    prepTime: 15, cookTime: 25, servings: 4,
    ingredients: [
      '250 g de lentilles vertes',
      '50 g de lentilles corail',
      '2 carottes',
      '1 oignon rouge',
      '100 g d\'épinards frais',
      'Huile d\'olive',
      '2 càs de garam masala',
      '2 L de bouillon',
      '2 brins d\'origan',
      '1 feuille de laurier',
      '1 brin de thym'
    ],
    steps: [
      'Préparer les ingrédients : rincer séparément les lentilles vertes et corail. Peler et couper les carottes en rondelles. Peler et couper l\'oignon en rondelles.',
      'Base aromatique : dans une grande casserole, faire revenir l\'oignon avec le garam masala dans l\'huile d\'olive pendant 2 min.',
      'Première cuisson : ajouter les lentilles vertes, le bouquet garni et le bouillon. Cuire 15 min.',
      'Seconde cuisson : ajouter les lentilles corail et poursuivre 15 min supplémentaires.',
      'Finition : incorporer les épinards frais en fin de cuisson, saler, poivrer, et mélanger. Servir chaud.'
    ],
    notes: 'Astuce nutrition : associez vos lentilles à du riz blanc. Leurs protéines sont complémentaires, ce qui améliore leur assimilation et leur valeur nutritive.'
  },
  {
    id: 'pates-ricotta',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Pâtes ricotta, épinards, citron',
    description: 'Une assiette fraîche et onctueuse où la douceur de la ricotta rencontre le parfum du citron et la légèreté des épinards. Parfaite pour un repas rapide mais raffiné.',
    prepTime: 15, cookTime: 15, servings: 3,
    ingredients: [
      '250 g de spaghettis',
      '1 échalote',
      '1 gousse d\'ail',
      '200 g d\'épinards',
      '125 g de ricotta',
      '40 g de cerneaux de noix',
      '1 citron bio',
      'Eau de cuisson des pâtes',
      'Filet d\'huile d\'olive',
      'Vin blanc (facultatif)',
      'Basilic'
    ],
    steps: [
      'Pâtes : cuire les spaghettis al dente selon les indications du paquet.',
      'Base aromatique : rincer et égoutter les épinards. Émincer l\'échalote et l\'ail. Dans une poêle avec un filet d\'huile d\'olive, faire revenir l\'échalote, puis ajouter l\'ail.',
      'Sauce : déglacer avec le vin blanc (facultatif), puis ajouter la ricotta. Incorporer le zeste et le jus de citron. Laisser réduire légèrement.',
      'Légumes : ajouter les épinards et les laisser fondre quelques instants. Si besoin, allonger avec un peu d\'eau de cuisson des pâtes.',
      'Service : dresser les spaghettis, napper de sauce, ajouter les noix grillées et le basilic. Terminer par un peu de zeste de citron.'
    ],
    notes: 'Variante : ajoutez quelques lanières de saumon fumé pour une version gourmande aux saveurs marines.'
  },
  {
    id: 'risotto-champignons',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Risotto champignons et petits-pois',
    description: 'Crémeux, parfumé et réconfortant, ce risotto allie la douceur des petits pois au goût boisé des champignons, relevé par une touche de parmesan fondant.',
    prepTime: 10, cookTime: 40, servings: 2,
    ingredients: [
      '250 g de riz pour risotto',
      '250 ml de bouillon de légumes',
      '10 cl de vin blanc sec',
      '250 g de champignons',
      '150 g de petits pois',
      '1 oignon',
      '1 cuillère à soupe de parmesan',
      'Sel',
      'Poivre',
      'Filet d\'huile d\'olive'
    ],
    steps: [
      'Préparer les ingrédients : émincer les champignons, hacher l\'oignon et l\'ail. Faire chauffer le bouillon.',
      'Base aromatique : dans une grande poêle, faire revenir champignons, oignon et ail à feu vif avec un filet d\'huile d\'olive.',
      'Riz : ajouter le riz, mélanger 1 à 2 min. Déglacer avec le vin blanc et laisser réduire complètement.',
      'Cuisson : ajouter le bouillon, louche par louche, en remuant et en attendant que le liquide soit absorbé avant chaque ajout.',
      'Légumes : après environ 10 min de cuisson, incorporer les petits pois et poursuivre jusqu\'à ce que le riz soit crémeux et al dente.',
      'Finition : hors du feu, ajouter le parmesan. Mélanger et servir bien chaud.'
    ],
    notes: 'Idées de variantes : potiron & gorgonzola · chorizo & poivrons · citron, asperge & parmesan'
  },
  {
    id: 'chachouka',
    category: 'repas',
    categoryLabel: 'Repas chauds',
    name: 'Chachouka aux œufs et haricots rouges',
    description: 'Un plat complet et réconfortant, où les œufs cuisent doucement dans une sauce tomate relevée au chili, agrémentée de haricots rouges et parfumée à l\'origan.',
    prepTime: 10, cookTime: 15, servings: 2,
    ingredients: [
      '1 oignon rouge',
      '1 boîte de tomates pelées',
      '1-2 càc d\'épices à chili',
      'Origan',
      '200 g d\'haricots rouges',
      '2 œufs',
      '1 cuillère à soupe de parmesan râpé',
      'Persil',
      'Huile d\'olive'
    ],
    steps: [
      'Peler et couper les oignons en fines lamelles. Couper les tomates pelées en morceaux.',
      'Dans une poêle, faire revenir les oignons dans un filet d\'huile d\'olive jusqu\'à dorés. Ajouter les tomates, la poudre de chili, l\'origan. Saler.',
      'Ajouter les haricots rouges à la préparation. Mélanger à feu très doux puis casser les œufs par-dessus.',
      'Parsemer de parmesan et de persil. Poivrer.',
      'Placer un couvercle sur la poêle et laisser cuire les œufs à feux doux pendant 7 bonnes minutes.',
      'Déguster chaud avec un morceau de pain !'
    ],
    notes: 'Astuce : pour éviter que les jaunes ne cuisent trop, retirez la poêle du feu une minute avant la fin de cuisson et laissez reposer à couvert.'
  },

  // ── TARTINADES & DIPS ──
  {
    id: 'tartinade-thon',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Tartinade thon cocktail revisité',
    description: 'Une version plus légère et tout aussi gourmande du classique thon cocktail, idéale pour vos tartines, salades ou entrées froides.',
    prepTime: 5, cookTime: 0, servings: 2,
    ingredients: [
      '1 boîte de thon au naturel (150 g égouttés)',
      '2 c. à soupe de sauce cocktail (type Heinz)',
      '2 c. à soupe de yaourt nature (ou fromage blanc 0–3%)',
      '1 c. à café de jus de citron',
      '1 petite échalote ou ¼ oignon rouge',
      '1 c. à soupe de ciboulette',
      'Poivre noir',
      '½ c. à café de paprika doux ou piment d\'Espelette (optionnel)'
    ],
    steps: [
      'Égoutter le thon et l\'émietter dans un bol.',
      'Mélanger le yaourt + sauce cocktail + citron + paprika.',
      'Ajouter l\'échalote et les herbes.',
      'Incorporer le thon.',
      'Poivrer, rectifier en sel si nécessaire.',
      'Réserver au frais 20 minutes avant de servir, avec une feuille de salade ou quelques crudités !'
    ],
    notes: 'Le yaourt permet : alléger la sauce, apporter des protéines, avoir une texture plus douce et digeste.'
  },
  {
    id: 'poivronnade-feta',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Poivronnade à la feta',
    description: 'Un dip onctueux où la douceur du poivron rôti rencontre la salinité de la feta, relevé d\'une pointe d\'ail et de piment. Idéal pour un apéritif méditerranéen.',
    prepTime: 15, cookTime: 40, servings: 4,
    ingredients: [
      '1 poivron rouge',
      '100 g de feta',
      '75 g de yaourt nature',
      '1 gousse d\'ail',
      '1 càc d\'huile d\'olive',
      '5 g de piment de Cayenne',
      '1 càc d\'origan'
    ],
    steps: [
      'Préchauffer le four à 180 °C.',
      'Enfourner le poivron entier 40 min sur une plaque, en le retournant à mi-cuisson.',
      'Laisser tiédir, puis peler, épépiner et couper en morceaux.',
      'Mixer le poivron avec la feta, le yaourt, l\'huile, l\'ail émincé, le piment et l\'origan jusqu\'à obtenir une texture lisse.',
      'Servir frais avec des grissinis ou des crudités.'
    ],
    notes: 'Variantes possibles avec d\'autres légumes ou fromages. Ajoutez un filet de jus de citron pour une touche plus fraîche.'
  },
  {
    id: 'dips-haricots-blanc',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Dips de haricots blancs à l\'ail et au citron',
    description: 'Une tartinade douce et veloutée où la finesse des haricots blancs se marie à la fraîcheur acidulée du citron et au parfum de l\'huile d\'olive.',
    prepTime: 15, cookTime: 0, servings: 4,
    ingredients: [
      '400 g de haricots blancs en boîte',
      '1 citron',
      '1 gousse d\'ail pressée',
      '3 cuillères à soupe d\'huile d\'olive',
      'Sel et poivre'
    ],
    steps: [
      'Rincer les haricots blancs et les placer dans un mixeur.',
      'Ajouter l\'ail pressé, le jus de citron, l\'huile d\'olive, le sel et le poivre.',
      'Mixer jusqu\'à obtention d\'une crème lisse.',
      'Goûter et ajuster l\'assaisonnement.',
      'Servir frais avec des légumes croquants ou du pain pita.'
    ],
    notes: 'Pour une version plus gourmande, ajoutez une cuillère à soupe de tahini ou de yaourt grec avant de mixer. Pour plus de caractère, ajoutez une pincée de paprika fumé.'
  },
  {
    id: 'mousse-truite',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Mousse de truite fumée',
    description: 'Un mélange raffiné où la saveur délicate de la truite fumée rencontre le piquant subtil du wasabi et la fraîcheur de l\'aneth.',
    prepTime: 15, cookTime: 0, servings: 4,
    ingredients: [
      '250 g de truite fumée',
      '50 g de fromage frais type Philadelphia',
      'Un filet de jus de citron',
      'Un trait de lait',
      '1 petite càc de wasabi ou de raifort',
      'Quelques brins d\'aneth',
      'Sel et poivre du moulin'
    ],
    steps: [
      'Mixer finement la truite fumée avec le fromage frais.',
      'Ajouter le wasabi et l\'aneth, puis mélanger.',
      'Détendre avec un peu de lait jusqu\'à obtenir une texture onctueuse.',
      'Réserver au frais et servir avec du pain grillé ou des crudités.'
    ],
    notes: 'Pour un goût plus doux, remplacez le wasabi par un peu de moutarde douce. Ajoutez quelques zestes de citron vert pour une touche encore plus fraîche.'
  },
  {
    id: 'dips-courgette-basilic',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Dips à la courgette et au basilic',
    description: 'Un dip léger et parfumé où la douceur des courgettes se marie à la fraîcheur du basilic et à la vivacité du citron vert.',
    prepTime: 10, cookTime: 10, servings: 4,
    ingredients: [
      '2 courgettes moyennes',
      '1 petite gousse d\'ail',
      '1 c. à soupe de jus de citron vert',
      '5 à 6 feuilles de basilic',
      '1 c. à soupe d\'huile d\'olive',
      'Sel, poivre',
      '1 cuillère de fromage frais ou de yaourt (optionnel)'
    ],
    steps: [
      'Laver les courgettes, couper les extrémités et les détailler en rondelles.',
      'Les faire revenir dans un filet d\'huile d\'olive pendant 10 min, jusqu\'à tendreté.',
      'Laisser tiédir, puis mixer avec l\'ail, le jus de citron vert, le basilic, le sel et le poivre.',
      'Ajuster la texture avec un filet d\'huile ou une cuillère de fromage frais.',
      'Réserver au frais au moins 30 min avant de servir.'
    ],
    notes: 'Pour une touche encore plus fraîche, ajoutez quelques feuilles de menthe en fin de mixage ou un soupçon de piment d\'Espelette.'
  },
  {
    id: 'houmous-maison',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Houmous maison',
    description: 'Un houmous crémeux et parfumé où la douceur du poivron rôti se mêle au goût intense des tomates confites et à la richesse du tahini.',
    prepTime: 10, cookTime: 25, servings: 4,
    ingredients: [
      '250 g de pois chiches cuits (en conserve ou maison)',
      '1 poivron rouge',
      '3 tomates confites à l\'huile (égouttées)',
      '1 gousse d\'ail',
      '1 c. à soupe de tahini (purée de sésame)',
      'Le jus d\'½ citron',
      '2 c. à soupe d\'huile d\'olive',
      'Sel, poivre',
      'Paprika fumé ou piment doux (optionnel)'
    ],
    steps: [
      'Préchauffer le four à 200 °C. Couper le poivron en deux, retirer les graines et enfourner 25 min jusqu\'à ce que la peau cloque. Laisser tiédir, peler et couper en morceaux.',
      'Dans un mixeur, réunir pois chiches, poivron rôti, tomates confites, ail, tahini, jus de citron, huile, sel et poivre.',
      'Mixer jusqu\'à texture lisse, en ajoutant un peu d\'eau ou de jus de cuisson des pois chiches si besoin.',
      'Goûter et ajuster l\'assaisonnement.',
      'Verser dans un bol, creuser un léger puits et garnir de tomates confites hachées, d\'un filet d\'huile d\'olive et d\'un soupçon de paprika fumé.'
    ],
    notes: 'Servez avec des bâtonnets de légumes croquants ou des pains pita grillés.'
  },
  {
    id: 'tartinade-pois-chiches-avocat',
    category: 'tartinade',
    categoryLabel: 'Tartinades & Dips',
    name: 'Tartinade de pois chiches et avocats',
    description: 'Une tartinade onctueuse, fraîche et pleine de saveurs, idéale pour un apéro sain et gourmand.',
    prepTime: 5, cookTime: 0, servings: 2,
    ingredients: [
      '200 g de pois chiches cuits',
      '1 avocat mûr',
      'Jus d\'un citron',
      'Cumin, sel, poivre'
    ],
    steps: [
      'Mixer les pois chiches et l\'avocat avec le jus de citron jusqu\'à obtenir une texture lisse.',
      'Ajouter les épices et ajuster l\'assaisonnement selon votre goût.'
    ],
    notes: 'Pour un goût encore plus frais, ajoutez une poignée de coriandre ou de persil avant de mixer.'
  },

  // ── PETITS-DÉJEUNERS ──
  {
    id: 'pancakes-banane-avoine',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Pancakes banane et avoine',
    description: 'Des pancakes moelleux et naturellement sucrés à la banane, avec une touche de cannelle et de vanille, parfaits pour un petit-déjeuner gourmand et sain.',
    prepTime: 5, cookTime: 20, servings: 5,
    ingredients: [
      '200 g de flocons d\'avoine',
      '250 ml de lait d\'amande',
      '2 œufs',
      '2 bananes',
      '1 cuillère à café de levure chimique',
      '1 cuillère à soupe de sirop d\'érable (facultatif)',
      '½ cuillère à café de cannelle (facultatif)',
      '1 cuillère à café d\'extrait de vanille (facultatif)',
      '¼ cuillère à café de sel (facultatif)'
    ],
    steps: [
      'Mixer les flocons d\'avoine jusqu\'à obtenir une poudre fine.',
      'Ajouter le lait d\'amande, les œufs, la banane, la levure, le sirop d\'érable, la cannelle, la vanille et le sel. Mixer jusqu\'à obtention d\'une pâte lisse.',
      'Chauffer une poêle grill avec un peu de beurre à feu vif.',
      'Verser la pâte pour former les pancakes et cuire 2 à 3 min de chaque côté, jusqu\'à ce qu\'ils soient dorés.'
    ],
    notes: 'Servez avec des fruits frais, du yaourt ou un filet de sirop d\'érable pour encore plus de gourmandise.'
  },
  {
    id: 'muffins-avoine-pomme',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Muffins d\'avoine et pomme',
    description: 'Des muffins moelleux et légèrement épicés à la cannelle, où la douceur des pommes se marie parfaitement aux flocons d\'avoine.',
    prepTime: 10, cookTime: 30, servings: 10,
    ingredients: [
      '100 g de flocons d\'avoine',
      '4 càs de farine',
      '2 œufs',
      '1 sachet de sucre vanillé',
      '2 càc de cannelle',
      '2 pommes',
      '100 ml de lait'
    ],
    steps: [
      'Préchauffer le four à 180 °C.',
      'Laver, éplucher et couper les pommes en petits dés.',
      'Dans un saladier, mélanger les flocons d\'avoine, la farine, l\'œuf, le sucre vanillé et la cannelle. Ajouter le lait petit à petit en mélangeant jusqu\'à obtenir une pâte homogène.',
      'Répartir la pâte dans des moules à muffins et enfourner 30 min.',
      'Laisser refroidir avant de déguster.'
    ],
    notes: 'Pour encore plus de gourmandise, ajoutez quelques noix ou pépites de chocolat dans la pâte avant la cuisson.'
  },
  {
    id: 'porridge-pomme-cannelle',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Porridge pomme cannelle',
    description: 'Un porridge doux et réconfortant aux pommes fondantes, délicatement parfumé à la cannelle, pour un petit-déjeuner sain et plein de douceur.',
    prepTime: 5, cookTime: 10, servings: 2,
    ingredients: [
      '100 g de flocons d\'avoine',
      '200 ml de lait',
      '1 càc de cannelle',
      '2 pommes',
      '2 càc de miel ou sirop d\'agave (facultatif)',
      'Raisins secs (facultatif)'
    ],
    steps: [
      'Couper les pommes en dés.',
      'Les faire revenir dans une casserole à feu vif avec un peu d\'eau ou quelques gouttes d\'huile de sésame.',
      'Lorsque les pommes sont dorées, saupoudrer de cannelle.',
      'Ajouter les flocons d\'avoine et le lait.',
      'Faire cuire à feu doux en remuant pendant 5 minutes.',
      'Ajuster la consistance en ajoutant du lait selon votre goût. Ajouter un peu de miel et/ou quelques raisins secs si souhaité.'
    ],
    notes: 'Version rapide : faire cuire les dés de pomme avec la cannelle au micro-ondes 5 min. Ajouter les flocons d\'avoine, le lait, puis remettre au micro-ondes 2 minutes.'
  },
  {
    id: 'porridge-cacao-banane',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Porridge cacao et banane',
    description: 'Un porridge onctueux et naturellement sucré à la banane, sublimé par un cacao intense à 100%, pour un petit-déjeuner gourmand et plein d\'énergie.',
    prepTime: 5, cookTime: 10, servings: 2,
    ingredients: [
      '100 g de flocons d\'avoine',
      '200 ml de lait de soja ou de vache',
      '2 càc de cacao 100%',
      '2 bananes',
      '2 càc de miel ou sirop d\'agave (facultatif)'
    ],
    steps: [
      'Dans une casserole, verser les flocons d\'avoine et la poudre de cacao.',
      'Ajouter le lait (vache ou soja) pour plus de douceur.',
      'Faire cuire à feu doux en remuant pendant 5 minutes.',
      'Ajuster la consistance en ajoutant du lait selon votre goût.',
      'En fin de cuisson, incorporer une banane coupée en petits dés pour sucrer naturellement.',
      'Réserver la deuxième banane pour décorer les bols avec des rondelles fraîches. Servir chaud.'
    ],
    notes: 'Version rapide en portion individuelle : même préparation au micro-ondes !'
  },
  {
    id: 'porridge-fruits-rouges',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Porridge fruits rouges',
    description: 'Un porridge gourmand et vitaminé, relevé par la fraîcheur acidulée des fruits rouges, pour un petit-déjeuner sain, coloré et plein de vitalité.',
    prepTime: 5, cookTime: 10, servings: 2,
    ingredients: [
      '100 g de flocons d\'avoine',
      '200 ml de lait de soja ou de vache',
      '150 g de fruits rouges congelés',
      '2 càc de miel ou sirop d\'agave'
    ],
    steps: [
      'Dans une casserole, faire réduire les fruits rouges congelés jusqu\'à obtenir une compotée.',
      'Ajouter le miel selon votre goût.',
      'Verser les flocons d\'avoine sur la compotée.',
      'Ajouter progressivement le lait en remuant doucement.',
      'Faire cuire à feu doux pendant 5 minutes en remuant régulièrement.',
      'Ajuster la consistance en ajoutant du lait selon vos préférences.',
      'Répartir dans des bols et décorer avec quelques fruits rouges congelés. Servir chaud !'
    ],
    notes: 'Version rapide en portion individuelle : même préparation au micro-ondes !'
  },
  {
    id: 'chia-pudding',
    category: 'petitdej',
    categoryLabel: 'Petits-déjeuners',
    name: 'Chia pudding',
    description: 'Un petit-déjeuner ou goûter sain et gourmand, où le crémeux du pudding de chia se marie au croquant du granola et à la fraîcheur des fruits.',
    prepTime: 10, cookTime: 0, servings: 2,
    ingredients: [
      '250 g de fruits rouges',
      '150 g de granola',
      '50 g de graines de chia',
      '50 cl de lait végétal ou de vache',
      '1 càc de vanille en poudre',
      '2 càs de sirop d\'agave'
    ],
    steps: [
      'Verser le lait sur les graines de chia, ajouter la vanille et le sirop d\'agave.',
      'Mélanger toutes les 10 minutes pendant 30 min. Filmer et placer au réfrigérateur 1 h.',
      'Déposer du granola au fond d\'un bol, recouvrir de pudding de chia bien gonflé, puis ajouter les fruits par-dessus. Servir frais.'
    ],
    notes: 'Dans l\'idéal : préparez le pudding de chia la veille et laissez gonfler toute la nuit. Pour un pudding encore plus gourmand, ajoutez quelques noix concassées ou des pépites de chocolat.'
  }
];