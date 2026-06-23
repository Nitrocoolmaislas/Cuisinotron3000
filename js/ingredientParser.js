/**
 * ingredientParser.js
 * Parse une string brute d'ingrédient en { qty, unit, rawName }
 *
 * Pipeline: parseIngredientString(str) → rawName → normIngredient() → INGREDIENT_BRIDGE
 *
 * Dépendance optionnelle : ciqual_discriminants.js (DISCRIMINANTS_GLOBAUX)
 * Si présent → liste blanche CIQUAL
 * Si absent  → fallback liste noire interne
 */

const UNITS = {
  'kg':'kg','g':'g','gr':'g','gramme':'g','grammes':'g','mg':'mg',
  'l':'l','litre':'l','litres':'l','cl':'cl','ml':'ml','dl':'dl',
  'cuillère à soupe':'c. à soupe','cuillères à soupe':'c. à soupe','cuillère(s) à soupe':'c. à soupe',
  'c. à soupe':'c. à soupe','c.à soupe':'c. à soupe','càs':'c. à soupe','cs':'c. à soupe','cas':'c. à soupe',
  'cuillère à café':'c. à café','cuillères à café':'c. à café','cuillère(s) à café':'c. à café',
  'c. à café':'c. à café','c.à café':'c. à café','càc':'c. à café','cc':'c. à café','cac':'c. à café',
  'tasse':'tasse','tasses':'tasse','verre':'verre','verres':'verre','bol':'bol','bols':'bol',
  'boîte':'boîte','boite':'boîte','conserve':'boîte',
  'pincée':'pincée','pincee':'pincée','pincées':'pincée',
  'sachet':'sachet','sachets':'sachet',
  'tranche':'tranche','tranches':'tranche','feuille':'feuille','feuilles':'feuille',
  'botte':'botte','bottes':'botte','gousse':'gousse','gousses':'gousse',
  'goutte':'goutte','gouttes':'goutte',
  'bouquet':'bouquet','bouquets':'bouquet',
  'louche':'louche','louches':'louche','paquet':'paquet','paquets':'paquet',
  'branche':'branche','branches':'branche','brin':'brin','brins':'brin',
  'filet':'filet','trait':'trait',
  'poignée':'poignée','poignées':'poignée','poignee':'poignée','poignees':'poignée',
  'pot':'pot','pots':'pot',
  'boule':'boule','boules':'boule',
  'cube':'cube','cubes':'cube',
  'cuillere':'cuillere','cuilleres':'cuillere',
  'cuillère':'cuillere','cuillères':'cuillere',
};

const STRIP_QUALIFIERS_FALLBACK = new Set([
  'cru','crue','crus','crues','cuit','cuite','cuits','cuites',
  'bouilli','bouillie','grille','grilee','roti','rotie',
  'surgele','surgelee','surgeles','surgelees','congele','congelee',
  'seche','sechee','deshydrate','deshydratee','frais','fraiche',
  'preemballe','appertise','egoutte','egouttee',
  'bio','nature','naturel','hache','hachee','rape','rapee',
  'mur','mure','moyen','moyenne','environ','facultatif','facultative',
  'emince','emincee','presse','pressee',
]);

// \u2500\u2500\u2500 Blacklist LanguaL (facettes E\u00b7H\u00b7J) \u2014 priorit\u00e9 sur la whitelist CIQUAL \u2500\u2500\u2500\u2500\u2500
// Exclus intentionnellement (discriminants bridge) : hache/ee, rape/ee,
// frais/fraiche, fume/fumee, pelee, confite.
const CULINARY_QUALIFIERS = new Set([
  // Facette H \u2014 \u00e9tat de cuisson
  'cru','crue','crus','crues',
  'cuit','cuite','cuits','cuites',
  'bouilli','bouillie','bouillis','bouillies',
  'grille','grilee','grilles','grillees',
  'roti','rotie','rotis','roties',
  'saute','sautee','sautes','sautees',
  'poele','poelee','poeles','poelees',
  'pane','panee','panes','panees',
  'dore','doree','dores','dorees',
  'caramelise','caramelisee','caramelises','caramelisees',
  'blanchi','blanchie','blanchis','blanchies',
  'marine','marinee','marines','marinees',
  'torrefie','torrefiee','torrefies','torrefiees',
  'surgele','surgelee','surgeles','surgelees',
  'congele','congelee','congeles','congelees',
  'seche','sechee','seches','sechees',
  'deshydrate','deshydratee','deshydrates','deshydratees',
  // Facette H \u2014 transformation m\u00e9canique
  'emince','emincee','eminces','emincees',
  'coupe','coupee','coupes','coupees',
  'pile','pilee','piles','pilees',
  'ecrase','ecrasee','ecrases','ecrasees',
  'broye','broyee','broyes','broyees',
  'moulu','moulue','moulus','moulues',
  'presse','pressee','presses','pressees',
  'concasse','concassee','concasses','concassees',
  // Facette E \u2014 forme physique
  'entier','entiere','entiers','entieres',
  'effile','effilees','effiles',
  'finement','grossierement',
  // Facette J \u2014 conditionnement
  'egoutte','egouttee','egouttees','egouttes',
  'appertise','appertisee',
  'preemballe','preemballee',
  // Qualificatifs g\u00e9n\u00e9raux
  'bio',
  'nature','naturel','naturelle','naturels','naturelles',
  'mur','mure','murs','mures',
  'moyen','moyenne','moyens','moyennes',
  'facultatif','facultative','facultatifs','facultatives',
]);

function _normWord(w) {
  return w.replace(/\u0153/g,'oe').replace(/\u00e6/g,'ae')
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}

// Discriminants bridge absents de DISCRIMINANTS_GLOBAUX \u2014 ne jamais stripper
const FORCE_KEEP = new Set([
  'frais','fraiche',     // "fromage frais", "cr\u00e8me fra\u00eeche"
  'hache','hachee',      // "boeuf hach\u00e9"
  'rape','rapee',        // "fromage r\u00e2p\u00e9"
  'confite','confites',  // "tomate confite"
]);

function _shouldStrip(word) {
  const n = _normWord(word);
  if (n.length <= 2) return false;
  if (FORCE_KEEP.has(n)) return false;          // bridge discriminants \u2014 jamais stripp\u00e9s
  if (CULINARY_QUALIFIERS.has(n)) return true;  // blacklist LanguaL \u2014 priorit\u00e9 sur CIQUAL
  if (typeof DISCRIMINANTS_GLOBAUX !== 'undefined') return !DISCRIMINANTS_GLOBAUX.has(n);
  return STRIP_QUALIFIERS_FALLBACK.has(n);
}

const LEADING_NOISE = /^(?:de\s+(?:l[ae](?=\s)|l[\u2019']|la(?=\s)|les(?=\s))?\s*|d[\u2019']\s*|d\s+|du\s+|des\s+|le\s+|la\s+|les\s+|l[\u2019']\s*|quelques?\s+|environ\s+|à\s+)/i;

const FRACTIONS = {'½':0.5,'⅓':0.333,'⅔':0.667,'¼':0.25,'¾':0.75,'⅕':0.2,'⅖':0.4,'⅗':0.6,'⅘':0.8,'⅙':0.167,'⅚':0.833,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875};

function cleanIngredientName(raw) {
  let name = raw.toLowerCase().trim();
  // Si commence par une parenthèse, la supprimer avant tout
  name = name.replace(/^\s*\([^)]*\)\s*/, '');
  name = name.replace(/\s+ou\b.*$/, '');
  name = name.replace(/\s+et\b.*$/, '');
  // Tronquer à la première virgule (évite "cumin, sel, poivre" → "cumin, sel, poivre")
  name = name.replace(/,.*$/, '').trim();
  // Tronquage au '/' seulement si ce n'est pas une fraction (chiffre/chiffre)
  name = name.replace(/(?<!\d)\/(?!\d).*$/, '').trim();

  // Tronquage aux groupes prépositionnels finalistes
  // ex: "pour la décoration", "pour le service", "selon le goût"
  name = name.replace(/\s+(?:pour|selon|en option|si désiré|si desire|au goût|au gout)\b.*$/i, '').trim();
  name = name.replace(/\b(au naturel|en boite|en boîte|de type\s+\S+)\b/gi, '');
  name = name.replace(/\s+\d+\s*%$/, '').trim();
  name = name.replace(/\([^)]*\)/g, '');
  name = name.replace(/\s*\([^)]*$/, '').trim(); // parenthèse non fermée (ex: "(en conserve ou…")

  // Strip fraction résiduelle en tête : "/2 sachet" → "sachet"
  // Se produit quand "1 /2" (avec espace) n'est pas reconnu comme fraction
  name = name.replace(/^\/\d+\s*/g, '').trim();

  // Strip modificateurs d'unité en tête de nom (avant règle de position)
  // ex: "bombées de cacao" → "cacao"
  name = name.replace(/^(?:bomb[eé]e?s?|rase?s?|comble?s?|bien pleines?|pleines?)\s+(?:de\s+|d['\u2019]\s*)?/i, '');

  // Tronquer les expressions composées avec "+" (ex: "beurre + 1 noix de beurre" → "beurre")
  name = name.replace(/\s*\+.*$/, '').trim();
  // Tronquer les approximations "environ" (ex: "poulets à d'environ 1,5 kg" → "poulets")
  name = name.replace(/\s+(?:(?:à\s+)?d['\u2019]?\s*)?environ\b.*$/i, '').trim();
  // Qualificatifs de préparation : "en petits morceaux", "en poudre"
  name = name.replace(/\s+en\s+(?:petits?|gros|fins?)\s+\w+\b.*$/i, '').trim();
  name = name.replace(/\s+en\s+(?:poudre|bloc|cube)s?\b.*$/i, '').trim();
  // Taille qualifiers : "de belle taille", "de petite taille"
  name = name.replace(/\s+de\s+(?:petite|belle|grande|grosse|moyenne)s?\s+taille\b.*$/i, '').trim();
  // Variantes produit : "à l'huile", "au sel/naturel"
  name = name.replace(/\s+à\s+l['\u2019]?\s*huile\b.*$/i, '').trim();
  name = name.replace(/\s+au\s+(?:sel|naturel|vinaigre|sirop)\b.*$/i, '').trim();
  // 1ère passe LEADING_NOISE — avant le filtre de mots pour éviter rawName="de"
  // quand le substantif n’est pas dans DISCRIMINANTS_GLOBAUX
  let prev;
  do { prev = name; name = name.replace(LEADING_NOISE, ''); } while (name !== prev);

  // Préfixes nominaux — après LEADING_NOISE pour voir "extrait de…" sans le "d’" initial
  name = name.replace(/^extrait\s+de\s+/i, '').trim();     // "extrait de vanille" → "vanille"
  name = name.replace(/^cerneaux?\s+de\s+/i, '').trim();   // "cerneaux de noix" → "noix"
  name = name.replace(/^jeunes?\s+/i, '').trim();          // "jeunes oignons" → "oignons"

  const words = name.split(/[\s'']+/).filter(Boolean);
  name = words.filter((w, i) => {
    if (i === 0) return true;                  // nom de base — toujours conservé
    if (!_shouldStrip(w)) return true;         // discriminant CIQUAL — conservé
    return false;                              // non-discriminant — strippé
  }).join(' ');
  // 2ème passe — après le filtre pour les préfixes révélés par stripping
  do { prev = name; name = name.replace(LEADING_NOISE, ''); } while (name !== prev);
  // "quelques" seul restant après strip des discriminants
  name = name.replace(/^quelques?\s*/i, '').trim();
  // Strip prépositions résiduelles en fin (laissées par le filtre de mots)
  name = name.replace(/\s+à\s*$/, '').trim();
  name = name.replace(/\s+en\s*$/, '').trim();
  return name.replace(/[,;:]+$/, '').replace(/\s{2,}/g, ' ').trim();
}

function parseIngredientString(str) {
  const original = str.trim();
  let s = original.replace(/\u2019/g,"'").replace(/\s+/g,' ').trim();
  s = s.replace(/\b(c[àa][cs]|c\.\s*à\s*caf[eé]|c\.\s*à\s*soupe)\./gi, '$1');
  s = s.replace(/^(?:le\s+|la\s+|les?\s+|l[''])\s*/i, '');
  s = s.replace(/^quelques?\s+/i, '');
  s = s.replace(/^(?:petite?s?|grande?s?|gross[eo]s?|bonne?s?)\s+/i, '');

  let qty = null;
  const qtyP = [
    /^(\d+(?:[,.]\d+)?)\s+à\s+(\d+(?:[,.]\d+)?)\s*/,
    /^(\d+(?:[,.]\d+)?)\s*[-–]\s*(\d+(?:[,.]\d+)?)\s*/,
    /^(\d+)\s*([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*/,
    /^([½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])\s*/,
    /^(\d+\s*\/\s*\d+)\s*/,
    /^(\d+(?:[,.]\d+)?)\s*/,
  ];

  const uneM = s.match(/^(une?)\s+/i);
  if (uneM) { qty = 1; s = s.slice(uneM[0].length); }

  let m;
  if (!qty && (m=s.match(qtyP[0]))) { qty=(parseFloat(m[1].replace(',','.'))+parseFloat(m[2].replace(',','.'))) /2; s=s.slice(m[0].length); }
  else if (!qty && (m=s.match(qtyP[1]))) { qty=(parseFloat(m[1].replace(',','.'))+parseFloat(m[2].replace(',','.'))) /2; s=s.slice(m[0].length); }
  else if (!qty && (m=s.match(qtyP[2]))) { qty=parseInt(m[1])+FRACTIONS[m[2]]; s=s.slice(m[0].length); }
  else if (!qty && (m=s.match(qtyP[3]))) { qty=FRACTIONS[m[1]]; s=s.slice(m[0].length); }
  else if (!qty && (m=s.match(qtyP[4]))) { const p=m[1].split('/'); qty=parseInt(p[0])/parseInt(p[1]); s=s.slice(m[0].length); }
  else if (!qty && (m=s.match(qtyP[5]))) { qty=parseFloat(m[1].replace(',','.')); s=s.slice(m[0].length); }

  s = s.replace(/^(?:petite?s?|grande?s?|gross[eo]s?|bonne?s?)\s+/i, '');

  let unit = null;
  const sortedUnits = Object.keys(UNITS).sort((a,b) => b.length - a.length);
  for (const u of sortedUnits) {
    const escaped = u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    if (new RegExp(`^${escaped}s?(?=\\s|$|,|de\\s|d['\u2019])`,'i').test(s)) {
      unit = UNITS[u];
      s = s.replace(new RegExp(`^${escaped}s?\\s*`,'i'), '');
      break;
    }
  }

  // Strip modificateurs d'unité résiduels (bombées, rases, combles...)
  s = s.replace(/^(?:bomb[eé]e?s?|rase?s?|comble?s?|bien pleines?|pleines?)\s+/i, '');

  let rawName = cleanIngredientName(s);

  // Lookup whitelist sémantique : "spaghetti" → "Pâtes blanches"
  if (typeof whitelistLookup !== 'undefined' && typeof normIngredient !== 'undefined') {
    const canonicalKey = whitelistLookup(normIngredient(rawName));
    if (canonicalKey) {
      const entry = typeof whitelistEntry !== 'undefined' ? whitelistEntry(canonicalKey) : null;
      if (entry) rawName = entry.name;
    }
  }

  return { qty, unit, rawName, original };
}

if (typeof module !== 'undefined') module.exports = { parseIngredientString };

// Tests
const _tests = [
  '200 g de farine tamisée','1 c. à café de sel','3 gousses d\'ail hachées',
  '½ citron','1 ½ tasse de lait','2-3 carottes','150g de lentilles vertes',
  'une pincée de poivre','sel','1 petite càc. de wasabi','5 à 6 feuilles de basilic',
  '250g de truite fumée','50g de lentilles corail','1 oignon rouge',
  '200g d\'épinards frais','1 citron bio','250g de pois chiches cuits',
  '2 càc de miel/ sirop d\'agave',
];

if (typeof process !== 'undefined' && process.argv[1] && process.argv[1].includes('ingredientParser')) {
  console.log('=== Tests parseIngredientString ===\n');
  for (const t of _tests) {
    const r = parseIngredientString(t);
    console.log(`"${t}"\n  → qty: ${r.qty}, unit: ${r.unit}, rawName: "${r.rawName}"\n`);
  }
}
