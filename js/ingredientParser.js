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
  'branche':'branche','branches':'branche','brin':'brin','brins':'brin',
  'filet':'filet','trait':'trait',
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

function _normWord(w) {
  return w.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
}

function _shouldStrip(word) {
  const n = _normWord(word);
  if (n.length <= 2) return false;
  if (typeof DISCRIMINANTS_GLOBAUX !== 'undefined') return !DISCRIMINANTS_GLOBAUX.has(n);
  return STRIP_QUALIFIERS_FALLBACK.has(n);
}

const LEADING_NOISE = /^(?:de\s+(?:l[ae](?=\s)|l[\u2019']|la(?=\s)|les(?=\s))?\s*|d[\u2019']\s*|du\s+|des\s+|le\s+|la\s+|les\s+|l[\u2019']\s*|quelques?\s+|environ\s+|à\s+)/i;

const FRACTIONS = {'½':0.5,'⅓':0.333,'⅔':0.667,'¼':0.25,'¾':0.75,'⅕':0.2,'⅖':0.4,'⅗':0.6,'⅘':0.8,'⅙':0.167,'⅚':0.833,'⅛':0.125,'⅜':0.375,'⅝':0.625,'⅞':0.875};

function cleanIngredientName(raw) {
  let name = raw.toLowerCase().trim();
  name = name.replace(/\s+ou\b.*$/, '');
  name = name.replace(/\s*\/.*$/, '');
  name = name.replace(/\b(au naturel|en boite|en boîte|de type\s+\S+)\b/gi, '');
  name = name.replace(/\s+\d+\s*%$/, '').trim();
  name = name.replace(/\([^)]*\)/g, '');
  const words = name.split(/\s+/).filter(Boolean);
  name = words.filter((w, i) => {
    if (i === 0) return true;                  // nom de base — toujours conservé
    if (!_shouldStrip(w)) return true;         // discriminant CIQUAL — conservé
    return false;                              // non-discriminant — strippé
  }).join(' ');
  let prev;
  do { prev = name; name = name.replace(LEADING_NOISE, ''); } while (name !== prev);
  return name.replace(/[,;:]+$/, '').replace(/\s{2,}/g, ' ').trim();
}

function parseIngredientString(str) {
  const original = str.trim();
  let s = original.replace(/\u2019/g,"'").replace(/\s+/g,' ').trim();
  s = s.replace(/\b(c[àa][cs]|c\.\s*à\s*caf[eé]|c\.\s*à\s*soupe)\./gi, '$1');
  s = s.replace(/^(?:le\s+|la\s+|les?\s+|l[''])\s*/i, '');
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

  return { qty, unit, rawName: cleanIngredientName(s), original };
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
