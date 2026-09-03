// ══════════════════════════════════════════════
//  glycemic_index.js — Index glycémique (IG) par SKU canonique WHITELIST
//
//  Repère indicatif, pas un outil médical certifié. L'IG réel d'un
//  aliment varie selon variété, cuisson, maturité — les valeurs ici sont
//  des médianes statistiques, pas des constantes physiques.
//
//  Source primaire : base SUGiRS International Tables (Sydney University
//  Glycemic Index Research Service — la source académique de référence
//  pour l'IG, ~3946 entrées, une ligne par étude clinique publiée).
//  Pour chaque SKU : médiane des entrées génériques correspondantes
//  (variétés/préparations courantes, hors produits de marque très
//  spécifiques, amidon résistant, enrichissements atypiques).
//  n = nombre d'études utilisées pour la médiane — une confiance faible
//  (n=1-2) signifie une seule mesure publiée, pas une moyenne robuste.
//
//  Ne couvre que les ingrédients à apport glucidique réel dans le corpus
//  de recettes (viandes/légumes/matières grasses n'ont pas besoin d'IG :
//  CG = IG × glucides/100 → glucides≈0 ⇒ CG≈0 quel que soit l'IG).
//
//  Champs : k (clé canonique WHITELIST), gi (IG médian), n (nb études),
//  confidence ('bonne'|'moyenne'|'faible'), proxy (optionnel — vrai si
//  la valeur vient d'un aliment proche faute d'entrée directe)
// ══════════════════════════════════════════════

const GLYCEMIC_INDEX = [
  { k: 'riz blanc',                  gi: 71, n: 47, confidence: 'bonne' },
  { k: 'riz basmati',                gi: 60, n: 20, confidence: 'bonne' },
  { k: 'riz complet',                gi: 58, n: 13, confidence: 'bonne' },
  { k: 'riz risotto arborio',        gi: 69, n: 1,  confidence: 'faible' },
  { k: 'vermicelles de riz',         gi: 55, n: 13, confidence: 'bonne' },
  { k: 'pomme de terre',             gi: 59, n: 22, confidence: 'bonne' },
  { k: 'pain blanc baguette campagne', gi: 67, n: 65, confidence: 'bonne' },
  { k: 'pain de mie blanc',          gi: 67, n: 65, confidence: 'moyenne', proxy: 'pain blanc baguette campagne' },
  { k: 'pain complet aux cereales',  gi: 75, n: 15, confidence: 'bonne' },
  { k: 'pates blanches',             gi: 46, n: 13, confidence: 'bonne' },
  { k: 'pates completes',            gi: 45, n: 7,  confidence: 'bonne' },
  { k: 'pates aux oeufs',            gi: 46, n: 0,  confidence: 'faible', proxy: 'pates blanches' },
  { k: 'lentilles corail',           gi: 18, n: 3,  confidence: 'moyenne' },
  { k: 'lentilles vertes',           gi: 23, n: 1,  confidence: 'faible' },
  { k: 'pois chiches',               gi: 34, n: 16, confidence: 'bonne' },
  { k: 'haricots rouges',            gi: 36, n: 14, confidence: 'bonne' },
  { k: 'haricots blancs',            gi: 23, n: 1,  confidence: 'faible' },
  { k: 'flocons davoine',            gi: 62, n: 3,  confidence: 'moyenne' },
  { k: 'quinoa',                     gi: 53, n: 3,  confidence: 'moyenne' },
  { k: 'mais grain',                 gi: 54, n: 8,  confidence: 'bonne' },
  { k: 'patate douce',               gi: 60, n: 4,  confidence: 'moyenne' },
  { k: 'carotte',                    gi: 35, n: 9,  confidence: 'bonne' },
  { k: 'pomme',                      gi: 39, n: 7,  confidence: 'bonne' },
  { k: 'banane',                     gi: 48, n: 13, confidence: 'bonne' },
  { k: 'sucre blanc',                gi: 59, n: 2,  confidence: 'moyenne' },
  { k: 'sucre roux cassonade',       gi: 59, n: 2,  confidence: 'faible', proxy: 'sucre blanc' },
  { k: 'miel',                       gi: 61, n: 11, confidence: 'moyenne' },
  { k: 'lait demiecreme',            gi: 26, n: 6,  confidence: 'bonne' },
  { k: 'lait davoine',               gi: 59, n: 2,  confidence: 'faible' },
  { k: 'chocolat noir tablette',     gi: 44, n: 5,  confidence: 'moyenne' },
  { k: 'chocolat blanc',             gi: 38, n: 2,  confidence: 'faible' },
  { k: 'pepites de chocolat',        gi: 42, n: 6,  confidence: 'moyenne', proxy: 'chocolate, milk (SUGiRS)' },
  { k: 'granola muesli',             gi: 56, n: 20, confidence: 'bonne' },
];

const _GI_IDX = {};
GLYCEMIC_INDEX.forEach(e => { _GI_IDX[e.k] = e; });

// Retourne l'IG médian pour une clé canonique WHITELIST, ou null si non couvert.
function getGlycemicIndex(canonicalKey) {
  return _GI_IDX[canonicalKey]?.gi ?? null;
}
