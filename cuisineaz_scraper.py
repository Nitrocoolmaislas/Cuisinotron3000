#!/usr/bin/env python3
"""
cuisineaz_scraper.py — Cuisinotron3000
Scrape cuisineaz.com pour des recettes healthy/minceur.
Même format de sortie que 750g_scraper.py / marmiton_scraper.py.

INSTALL  : pip install beautifulsoup4
USAGE    :
  python cuisineaz_scraper.py --output data/cuisineaz_catalog.json
  python cuisineaz_scraper.py --query "salade quinoa" --category repas

Le motif exact de recherche/URL de cuisineaz.com n'a pas pu être vérifié
en direct (réseau sortant restreint dans l'environnement de dev) — search()
essaie plusieurs URLs candidates et garde la première qui renvoie des liens
correspondant au motif de recette (_RECIPE_RE), même approche défensive que
750g_scraper.py. Si la première exécution en CI (accès réseau complet) ne
remonte aucune recette, ajuster _SEARCH_URLS/_RECIPE_RE d'après le HTML
réel (visible dans les logs de l'action) plutôt que re-deviner à l'aveugle.
"""

import sys, json, time, re, argparse, unicodedata, ssl
import urllib.request, urllib.parse
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://www.cuisineaz.com"

DEFAULT_QUERIES = [
    # (label,                   termes,                       catégorie)
    ("Bowl de quinoa",          "bowl quinoa légumes",        "repas"),
    ("Salade composée minceur", "salade composée minceur",    "repas"),
    ("Poulet rôti légumes",     "poulet rôti légumes",        "repas"),
    ("Soupe de légumes",        "soupe légumes minceur",      "repas"),
    ("Lentilles mijotées",      "lentilles épinards",         "repas"),
    ("Curry de légumes",        "curry légumes light",        "repas"),
    ("Taboulé léger",           "taboulé minceur",            "repas"),
    ("Poisson vapeur",          "poisson vapeur légumes",     "repas"),
    ("Omelette légumes",        "omelette légumes healthy",   "repas"),
    ("Wok de légumes",          "wok légumes tofu",           "repas"),
    ("Salade niçoise",          "salade niçoise",             "repas"),
    ("Gratin de courgettes",    "gratin courgettes light",    "repas"),
    ("Riz sauté légumes",       "riz sauté légumes",          "repas"),
    ("Pâtes complètes légumes", "pâtes complètes légumes",    "repas"),
    ("Chili végétarien",        "chili végétarien",           "repas"),
    ("Ratatouille",             "ratatouille légumes",        "repas"),
    ("Tajine de légumes",       "tajine légumes",             "repas"),
    ("Buddha bowl",             "buddha bowl légumes",        "repas"),
    ("Salade de pâtes",         "salade pâtes légumes",       "repas"),
    ("Soupe de lentilles corail","soupe lentilles corail",    "repas"),
    ("Houmous maison",          "houmous maison",             "tartinade"),
    ("Tzatziki",                "tzatziki maison",            "tartinade"),
    ("Guacamole",               "guacamole maison",           "tartinade"),
    ("Caviar d'aubergines",     "caviar aubergines",          "tartinade"),
    ("Pesto maison",            "pesto maison",                "tartinade"),
    ("Tapenade",                "tapenade olives",             "tartinade"),
    ("Porridge avoine",         "porridge avoine",            "petitdej"),
    ("Smoothie bowl",           "smoothie bowl fruits",       "petitdej"),
    ("Overnight oats",          "overnight oats",             "petitdej"),
    ("Pancakes protéinés",      "pancakes protéinés",         "petitdej"),
    ("Granola maison",          "granola maison",              "petitdej"),
    ("Chia pudding",            "chia pudding",                 "petitdej"),
    ("Compote de pommes",       "compote pommes légère",       "dessert"),
    ("Salade de fruits",        "salade fruits frais",         "dessert"),
    ("Tarte aux fruits légère", "tarte fruits légère",         "dessert"),
    ("Mousse au chocolat légère","mousse chocolat légère",     "dessert"),
    ("Sorbet aux fruits",       "sorbet fruits maison",        "dessert"),
    ("Cookies à l'avoine",      "cookies avoine",               "dessert"),
    ("Crumble aux fruits léger","crumble fruits léger",        "dessert"),
    ("Fruits rôtis au miel",    "fruits rôtis miel",           "dessert"),
]

CATEGORY_LABELS = {
    "repas":     "Repas chauds",
    "tartinade": "Tartinades & Dips",
    "petitdej":  "Petits-déjeuners",
    "dessert":   "Desserts",
}

DELAY_SECONDS = 2.5
PER_QUERY     = 4

BROWSER_HEADERS = {
    "User-Agent":      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Accept":          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr,fr-FR;q=0.9,en;q=0.3",
    "Connection":      "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# ── HTTP ──────────────────────────────────────────────────────────────

def _open(url):
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers=BROWSER_HEADERS)
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
    return opener.open(req, timeout=20)

def _read(resp):
    raw = resp.read()
    for enc in ("utf-8", "latin-1", "cp1252"):
        try: return raw.decode(enc)
        except: continue
    return raw.decode("utf-8", errors="replace")

def _json_ld(html):
    for tag in BeautifulSoup(html, "html.parser").find_all("script", {"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "")
            for item in (data if isinstance(data, list) else [data]):
                if item.get("@type") == "Recipe":
                    return item
                for g in item.get("@graph", []):
                    if g.get("@type") == "Recipe":
                        return g
        except Exception:
            continue
    return None

# ── Discovery (diagnostic) ──────────────────────────────────────────────
# Le motif réel de recherche/URL du site n'a pas pu être vérifié depuis
# l'environnement de dev (réseau sortant restreint sur ce domaine) — cette
# commande tourne sur le runner GitHub Actions (accès internet complet) pour
# remonter dans les logs de quoi corriger search()/_RECIPE_RE sans deviner.

def discover():
    print(f"🔎  Diagnostic {BASE_URL}\n", flush=True)

    sitemap_urls = []
    try:
        robots = _read(_open(BASE_URL + "/robots.txt"))
        print(f"── /robots.txt ({len(robots)} octets) ──", flush=True)
        print(robots[:2000], flush=True)
        sitemap_urls = re.findall(r"(?im)^Sitemap:\s*(\S+)", robots)
        print(f"   Sitemaps déclarés : {sitemap_urls}\n", flush=True)
    except Exception as e:
        print(f"── /robots.txt : {e} ──\n", flush=True)

    for sm_url in sitemap_urls[:2]:
        try:
            xml = _read(_open(sm_url))
        except Exception as e:
            print(f"── {sm_url} : {e} ──\n", flush=True)
            continue
        is_index = "<sitemapindex" in xml[:500]
        locs = re.findall(r"<loc>([^<]+)</loc>", xml)
        print(f"── {sm_url} ({len(xml)} octets) — {'INDEX' if is_index else 'URLSET'}, {len(locs)} <loc> ──", flush=True)
        for l in locs[:15]:
            print(f"     {l}", flush=True)
        recipe_locs = [l for l in locs if _RECIPE_RE.search(l)]
        print(f"   → {len(recipe_locs)} correspondent au motif recette, échantillon :", flush=True)
        for l in recipe_locs[:10]:
            print(f"     {l}", flush=True)
        print("", flush=True)

        # Si c'est un index, suivre un sous-sitemap dont le nom évoque les
        # recettes (sinon le premier) pour voir la structure d'une feuille.
        if is_index and locs:
            leaf = next((l for l in locs if re.search(r"recette", l, re.I)), locs[0])
            try:
                leaf_xml = _read(_open(leaf))
                leaf_locs = re.findall(r"<loc>([^<]+)</loc>", leaf_xml)
                leaf_recipes = [l for l in leaf_locs if _RECIPE_RE.search(l)]
                print(f"── sous-sitemap {leaf} ({len(leaf_xml)} octets) — {len(leaf_locs)} <loc>, {len(leaf_recipes)} recettes ──", flush=True)
                for l in leaf_locs[:15]:
                    print(f"     {l}", flush=True)
                print("", flush=True)
            except Exception as e:
                print(f"── sous-sitemap {leaf} : {e} ──\n", flush=True)

    for path in ("/", "/recettes"):
        try:
            html = _read(_open(BASE_URL + path))
        except Exception as e:
            print(f"── {path} : {e} ──\n", flush=True)
            continue
        soup = BeautifulSoup(html, "html.parser")
        title = soup.title.get_text(strip=True) if soup.title else ""
        print(f"── {path} ({len(html)} octets) — <title>: {title} ──", flush=True)

        forms = soup.find_all("form")
        for f in forms[:5]:
            action = f.get("action", "")
            inputs = [i.get("name") for i in f.find_all("input") if i.get("name")]
            print(f"   <form action=\"{action}\"> inputs={inputs}", flush=True)

        hrefs = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if re.search(r"recette", href, re.I):
                hrefs.append(href)
        seen = set()
        print(f"   {len(hrefs)} liens contenant 'recette', échantillon :", flush=True)
        for h in hrefs:
            if h in seen: continue
            seen.add(h)
            print(f"     {h}", flush=True)
            if len(seen) >= 25: break
        print("", flush=True)

# ── Search ────────────────────────────────────────────────────────────
# cuisineaz.com interdit explicitement le crawl de sa recherche (robots.txt :
# Disallow /recettes/recherche*, sous toutes ses variantes — confirmé en
# CI, cf. --discover). En revanche il publie lui-même un sitemap pour le
# crawl (Sitemap: dans robots.txt) : c'est ce canal, explicitement autorisé,
# qu'on utilise pour découvrir les recettes, avec un filtrage par mot-clé
# fait localement sur le slug de chaque URL plutôt qu'une requête distante.

# Recettes cuisineaz.com : URLs en /recettes/<slug>-<id>.aspx (confirmé sur
# les 10000 <loc> du premier sous-sitemap recettes, 100% de correspondance).
_RECIPE_RE = re.compile(r"/recettes/[^/?#]+-\d+\.aspx$")

_SITEMAP_INDEX = f"{BASE_URL}/xml/sitemap.xml"
_sitemap_urls_cache = None

def _load_sitemap_recipe_urls():
    global _sitemap_urls_cache
    if _sitemap_urls_cache is not None:
        return _sitemap_urls_cache

    sub_sitemaps = []
    try:
        idx_xml = _read(_open(_SITEMAP_INDEX))
        sub_sitemaps = [l for l in re.findall(r"<loc>([^<]+)</loc>", idx_xml) if "recette" in l.lower()]
    except Exception as e:
        print(f"    ⚠️  sitemap index : {e}", flush=True)

    urls = []
    # 3 sous-sitemaps recettes (30000 URLs) — plus que le nécessaire strict,
    # mais un seul (10000) faisait ressortir trop de doublons sur les mots
    # fréquents ("maison", "légère"...) une fois DEFAULT_QUERIES élargi.
    # Les 10 sous-sitemaps recettes existants représentent ~35 Mo au total ;
    # 3 restent largement raisonnables pour un run hebdomadaire.
    for sm in sub_sitemaps[:3]:
        try:
            xml = _read(_open(sm))
        except Exception as e:
            print(f"    ⚠️  {sm} : {e}", flush=True)
            continue
        urls.extend(l for l in re.findall(r"<loc>([^<]+)</loc>", xml) if _RECIPE_RE.search(l))

    _sitemap_urls_cache = urls
    print(f"    📚  {len(urls)} URLs recettes chargées depuis le sitemap\n", flush=True)
    return urls

def search(query, n=12):
    pool = _load_sitemap_recipe_urls()
    if not pool:
        return []
    words = [w for w in slugify(query).split("-") if len(w) > 2]
    if not words:
        return []
    # Majorité des mots plutôt que tous : une requête à 3 mots ("bowl quinoa
    # légumes") ne matchera presque jamais un slug réel mot-pour-mot.
    threshold = max(1, (len(words) + 1) // 2)

    scored = []
    for url in pool:
        slug = slugify(urllib.parse.unquote(url))
        matched = sum(1 for w in words if w in slug)
        if matched >= threshold:
            scored.append((matched, url))
    scored.sort(key=lambda x: -x[0])

    results = []
    for matched, url in scored[:n]:
        # Nom provisoire pour l'affichage log — get_recipe() récupère le vrai
        # titre (JSON-LD) au moment de la récupération de chaque recette.
        stem = url.rsplit("/", 1)[-1]
        name = re.sub(r"-\d+\.aspx$", "", stem).replace("-", " ").capitalize()
        results.append({"url": url, "name": name})
    return results

# ── Get recipe ────────────────────────────────────────────────────────

def _dur(iso):
    if not iso: return 0
    m = re.search(r"(?:(\d+)H)?(?:(\d+)M)?", str(iso))
    return (int(m.group(1) or 0)*60 + int(m.group(2) or 0)) if m else 0

def _srv(y):
    if isinstance(y, list): y = y[0] if y else ""
    m = re.search(r"(\d+)", str(y))
    return int(m.group(1)) if m else 2

def _steps(instructions):
    out = []
    for s in (instructions or []):
        if isinstance(s, str):
            if s.strip(): out.append(s.strip())
        elif isinstance(s, dict):
            if s.get("@type") == "HowToSection":
                for sub in s.get("itemListElement", []):
                    t = (sub.get("text") or sub.get("name","")) if isinstance(sub,dict) else str(sub)
                    if t.strip(): out.append(t.strip())
            else:
                t = (s.get("text") or s.get("name","")).strip()
                if t: out.append(t)
    return out

def _img(i):
    if isinstance(i, list): i = i[0] if i else ""
    if isinstance(i, dict): return i.get("url","")
    return str(i) if i else ""

def get_recipe(url):
    html = _read(_open(url))
    ld   = _json_ld(html)
    if ld:
        return {
            "name":        (ld.get("name") or "").strip(),
            "description": (ld.get("description") or "").strip(),
            "ingredients": [str(i).strip() for i in ld.get("recipeIngredient",[]) if str(i).strip()],
            "steps":       _steps(ld.get("recipeInstructions",[])),
            "prepTime":    _dur(ld.get("prepTime")),
            "cookTime":    _dur(ld.get("cookTime") or ld.get("totalTime")),
            "servings":    _srv(ld.get("recipeYield")),
            "image":       _img(ld.get("image")),
        }
    # Fallback HTML — motif de classes non vérifié en direct (cf. note en tête
    # de fichier), à ajuster d'après le HTML réel si JSON-LD absent en pratique.
    soup = BeautifulSoup(html, "html.parser")
    name = ""
    for sel in ["h1.m-recipe-header__title", "h1[itemprop='name']", "h1"]:
        el = soup.select_one(sel)
        if el: name = el.get_text(" ",strip=True); break
    ingrs = [e.get_text(" ",strip=True) for e in soup.select(
        ".m-recipe-ingredients__item,.ingredients li,[itemprop='recipeIngredient']"
    ) if e.get_text(strip=True)]
    stps  = [e.get_text(" ",strip=True) for e in soup.select(
        ".m-recipe-steps__item,.recipe-steps li,[itemprop='recipeInstructions'] p"
    ) if e.get_text(strip=True)]
    if not name or not ingrs:
        raise ValueError("Structure inconnue (pas de JSON-LD ni markup connu)")
    return {"name":name,"description":"","ingredients":ingrs,"steps":stps,
            "prepTime":0,"cookTime":0,"servings":2,"image":""}

# ── Conversion ────────────────────────────────────────────────────────

def slugify(text):
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+","-",text).strip("-")

def to_cuisinotron(recipe, category, source_url):
    name = recipe.get("name","").strip()
    return {
        "id":            "cuisineaz-" + slugify(name),
        "custom":        True,
        "source":        "cuisineaz",
        "category":      category,
        "categoryLabel": CATEGORY_LABELS.get(category,"Recettes healthy"),
        "name":          name,
        "description":   recipe.get("description",""),
        "prepTime":      recipe.get("prepTime",0),
        "cookTime":      recipe.get("cookTime",0),
        "servings":      recipe.get("servings",2),
        "ingredients":   [i.strip() for i in recipe.get("ingredients",[]) if i.strip()],
        "steps":         [s.strip() for s in recipe.get("steps",[]) if s.strip()],
        "image":         recipe.get("image",""),
        "sourceUrl":     source_url,
    }

def is_valid(r):
    return len(r["name"])>2 and len(r["ingredients"])>=2 and len(r["steps"])>=1

# ── Scraper ───────────────────────────────────────────────────────────

def scrape(queries, per_query, delay):
    results, seen = [], set()
    for (label, query, category) in queries:
        print(f"\n🔍  {label}  [{CATEGORY_LABELS.get(category,category)}]", flush=True)
        found = search(query, n=per_query*3)
        if not found:
            print("    ─  Aucun résultat", flush=True)
            continue
        count = 0
        for item in found:
            if count >= per_query: break
            url = item["url"]
            print(f"    ⬇  {item.get('name',url)[:55]}", flush=True)
            try:
                detail = get_recipe(url)
                r      = to_cuisinotron(detail, category, url)
                if not is_valid(r):
                    print(f"       ⛔  Incomplet ({len(r['ingredients'])} ing, {len(r['steps'])} étapes)", flush=True)
                    continue
                if r["id"] in seen:
                    print(f"       ↩  Doublon ignoré", flush=True)
                    continue
                seen.add(r["id"])
                results.append(r)
                count += 1
                print(f"       ✅  {len(r['ingredients'])} ing · {len(r['steps'])} étapes · {r['prepTime']+r['cookTime']} min", flush=True)
            except Exception as e:
                print(f"       ⚠️  {e}", flush=True)
            time.sleep(delay)
    return results

def load_existing(path):
    try:
        with open(path,"r",encoding="utf-8") as f:
            raw = json.load(f)
        if isinstance(raw,dict): return raw.get("customRecipes",raw.get("catalog",[]))
        elif isinstance(raw,list): return raw
    except FileNotFoundError: pass
    return []

# ── Main ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    p = argparse.ArgumentParser(description="cuisineaz.com → Cuisinotron3000")
    p.add_argument("--query",     "-q", default=None)
    p.add_argument("--category",  "-c", default="repas",
                   choices=["repas","tartinade","petitdej","dessert"])
    p.add_argument("--per-query", "-n", type=int, default=PER_QUERY)
    p.add_argument("--output",    "-o", default="data/cuisineaz_catalog.json")
    p.add_argument("--merge",     "-m", metavar="EXISTING", default=None)
    p.add_argument("--delay",     "-d", type=float, default=DELAY_SECONDS)
    p.add_argument("--discover",  action="store_true",
                   help="Diagnostic (robots.txt, sitemap, page d'accueil) — n'écrit rien, imprime dans les logs")
    args = p.parse_args()

    if args.discover:
        discover()
        sys.exit(0)

    if args.query:
        queries = [(args.query.capitalize(), args.query, args.category)]
        print(f"🥗  Recherche custom : \"{args.query}\"", flush=True)
    else:
        queries = DEFAULT_QUERIES
        print(f"🥗  {len(queries)} requêtes × {args.per_query} = ~{len(queries)*args.per_query} recettes visées", flush=True)

    print(f"    Délai : {args.delay}s | Sortie : {args.output}", flush=True)
    recipes = scrape(queries, per_query=args.per_query, delay=args.delay)

    if args.merge:
        existing     = load_existing(args.merge)
        existing_ids = {r["id"] for r in existing if isinstance(r,dict)}
        added        = [r for r in recipes if r["id"] not in existing_ids]
        recipes      = existing + added
        print(f"\n📦  Merge : {len(existing)} existantes + {len(added)} nouvelles = {len(recipes)}", flush=True)

    with open(args.output,"w",encoding="utf-8") as f:
        json.dump({"customRecipes":recipes,"updated":time.strftime("%Y-%m-%d"),"source":"cuisineaz"},
                  f, ensure_ascii=False, indent=2)
    print(f"\n✅  {len(recipes)} recettes → {args.output}", flush=True)
