#!/usr/bin/env python3
"""
marmiton_scraper.py — Cuisinotron3000
══════════════════════════════════════════════════════════════════════
INSTALL  : pip install python-marmiton beautifulsoup4
USAGE    :
  # Requêtes par défaut (génère data/marmiton_catalog.json)
  python marmiton_scraper.py --output data/marmiton_catalog.json

  # Requête custom
  python marmiton_scraper.py --query "tarte aux poireaux" --category repas
  python marmiton_scraper.py --query "houmous" --category tartinade

  # Options
  python marmiton_scraper.py --per-query 3
  python marmiton_scraper.py --merge recettes_clara_custom.json

  # Combiner
  python marmiton_scraper.py --query "pad thai" --category repas --per-query 5
══════════════════════════════════════════════════════════════════════
"""

import sys, json, time, re, argparse, unicodedata, ssl
import urllib.request, urllib.parse
from marmiton import Marmiton, RecipeNotFound
from bs4 import BeautifulSoup

# Force output non-bufferisé (Termux, CI, etc.)
sys.stdout.reconfigure(line_buffering=True)


# ══════════════════════════════════════════════
#  CONFIG PAR DÉFAUT
# ══════════════════════════════════════════════

DEFAULT_QUERIES = [
    # (label,               termes,              type_plat,        catégorie)
    ("Soupe de légumes",    "soupe legumes",      "platprincipal",  "repas"),
    ("Poulet rôti",         "poulet roti",        "platprincipal",  "repas"),
    ("Pâtes bolognaise",    "pates bolognaise",   "platprincipal",  "repas"),
    ("Curry de légumes",    "curry legumes",      "platprincipal",  "repas"),
    ("Risotto",             "risotto",            "platprincipal",  "repas"),
    ("Omelette",            "omelette",           "platprincipal",  "repas"),
    ("Quiche lorraine",     "quiche lorraine",    "platprincipal",  "repas"),
    ("Salade niçoise",      "salade nicoise",     "platprincipal",  "repas"),
    ("Gratin dauphinois",   "gratin dauphinois",  "accompagnement", "repas"),
    ("Wok de légumes",      "wok legumes",        "platprincipal",  "repas"),
    ("Soupe de lentilles",  "soupe lentilles",    "platprincipal",  "repas"),
    ("Houmous",             "houmous",            None,             "tartinade"),
    ("Tapenade",            "tapenade",           None,             "tartinade"),
    ("Guacamole",           "guacamole",          None,             "tartinade"),
    ("Tzatziki",            "tzatziki",           None,             "tartinade"),
    ("Pesto maison",        "pesto maison",       None,             "tartinade"),
    ("Porridge",            "porridge avoine",    None,             "petitdej"),
    ("Pancakes",            "pancakes",           None,             "petitdej"),
    ("Granola maison",      "granola maison",     None,             "petitdej"),
    ("Muffins banane",      "muffins banane",     None,             "petitdej"),
    ("Overnight oats",      "overnight oats",     None,             "petitdej"),
]

CATEGORY_LABELS = {
    "repas":     "Repas chauds",
    "tartinade": "Tartinades & Dips",
    "petitdej":  "Petits-déjeuners",
    "dessert":   "Desserts",
}

# Filtre "type de plat" Marmiton (param dt) par catégorie
CATEGORY_DT = {
    "repas":     "platprincipal",
    "dessert":   "dessert",
    "tartinade": None,
    "petitdej":  None,
}

DELAY_SECONDS = 2.5
PER_QUERY     = 4

BROWSER_HEADERS = {
    "User-Agent":            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    "Accept":                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language":       "fr,fr-FR;q=0.9,en;q=0.3",
    "Connection":            "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}


# ══════════════════════════════════════════════
#  HTTP
# ══════════════════════════════════════════════

def _open(url):
    ctx = ssl._create_unverified_context()
    req = urllib.request.Request(url, headers=BROWSER_HEADERS)
    opener = urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx))
    return opener.open(req, timeout=20)

def _read(resp):
    raw = resp.read()
    for enc in ("utf-8", "latin-1", "cp1252"):
        try:
            return raw.decode(enc)
        except Exception:
            continue
    return raw.decode("utf-8", errors="replace")

def _next_data(html):
    tag = BeautifulSoup(html, "html.parser").find("script", {"id": "__NEXT_DATA__"})
    if tag and tag.string:
        return json.loads(tag.string)
    return None

def _json_ld(html):
    for tag in BeautifulSoup(html, "html.parser").find_all("script", {"type": "application/ld+json"}):
        try:
            data = json.loads(tag.string or "")
            for item in (data if isinstance(data, list) else [data]):
                if item.get("@type") == "Recipe":
                    return item
        except Exception:
            continue
    return None


# ══════════════════════════════════════════════
#  SEARCH + GET
# ══════════════════════════════════════════════

def search(query_dict):
    url  = "https://www.marmiton.org/recettes/recherche.aspx?" + urllib.parse.urlencode(query_dict)
    html = _read(_open(url))
    results = []

    # 1. __NEXT_DATA__
    nd = _next_data(html)
    if nd:
        try:
            hits = (nd.get("props",{}).get("pageProps",{})
                      .get("searchResults",{}).get("hits",[]))
            if not hits:
                hits = nd.get("props",{}).get("pageProps",{}).get("recipes",[])
            for h in hits:
                slug = h.get("urlFriendlyName") or h.get("url") or ""
                if slug and not slug.startswith("/"):
                    slug = "/recettes/" + slug
                if slug:
                    results.append({"url": slug, "name": h.get("name") or h.get("title","")})
        except Exception:
            pass

    # 2. Liens <a>
    if not results:
        seen = set()
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("/recettes/recette_") and href not in seen:
                seen.add(href)
                d = {"url": href}
                try: d["name"] = a.find("h4").get_text().strip()
                except: pass
                results.append(d)

    # 3. Regex brute
    if not results:
        seen = set()
        for u in re.findall(r"/recettes/recette_[^\s\"'<>]+", html):
            if u not in seen:
                seen.add(u)
                results.append({"url": u, "name": ""})

    return results


def get_recipe(uri):
    url = "https://www.marmiton.org" + (uri if uri.startswith("/") else "/" + uri)
    try:
        html = _read(_open(url))
    except urllib.error.HTTPError as e:
        raise RecipeNotFound if e.code == 404 else e

    # 1. JSON-LD schema.org
    ld = _json_ld(html)
    if ld:
        def ld_min(prop):
            val = ld.get(prop, "")
            if not val: return 0
            m = re.search(r"(?:(\d+)H)?(?:(\d+)M)?", str(val))
            return (int(m.group(1) or 0)*60 + int(m.group(2) or 0)) if m else 0

        def ld_steps(data):
            steps = []
            for s in data.get("recipeInstructions", []):
                text = s if isinstance(s, str) else (s.get("text") or s.get("name",""))
                if text.strip(): steps.append(text.strip())
            return steps

        def ld_servings(data):
            y = data.get("recipeYield","")
            if isinstance(y, list): y = y[0] if y else ""
            m = re.search(r"(\d+)", str(y))
            return int(m.group(1)) if m else 2

        return {
            "name":            ld.get("name","").strip(),
            "ingredients":     [str(i).strip() for i in ld.get("recipeIngredient",[]) if str(i).strip()],
            "steps":           ld_steps(ld),
            "author_tip":      (ld.get("description") or "").strip(),
            "prep_time":       str(ld_min("prepTime")),
            "cook_time":       str(ld_min("cookTime")),
            "recipe_quantity": str(ld_servings(ld)),
        }

    # 2. Fallback python-marmiton
    soup = BeautifulSoup(html, "html.parser")
    def safe(fn, default):
        try: return fn(soup)
        except: return default
    return {
        "name":            safe(Marmiton._get_name,            ""),
        "ingredients":     safe(Marmiton._get_ingredients,     []),
        "steps":           safe(Marmiton._get_steps,           []),
        "author_tip":      safe(Marmiton._get_author_tip,      ""),
        "prep_time":       safe(Marmiton._get_prep_time,       ""),
        "cook_time":       safe(Marmiton._get_cook_time,       ""),
        "recipe_quantity": safe(Marmiton._get_recipe_quantity, ""),
    }


# ══════════════════════════════════════════════
#  CONVERSION
# ══════════════════════════════════════════════

def slugify(text):
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")

def parse_minutes(s):
    if not s: return 0
    s = str(s).strip().lower()
    m = re.search(r"(\d+)\s*h\s*(\d*)", s)
    if m: return int(m.group(1))*60 + (int(m.group(2)) if m.group(2) else 0)
    m = re.search(r"(\d+)", s)
    return int(m.group(1)) if m else 0

def parse_servings(s):
    m = re.search(r"(\d+)", str(s) if s else "")
    return int(m.group(1)) if m else 2

def to_cuisinotron(recipe, category, source_url=""):
    name = recipe.get("name","").strip()
    return {
        "id":            slugify(name),
        "custom":        True,
        "category":      category,
        "categoryLabel": CATEGORY_LABELS.get(category, "Repas chauds"),
        "name":          name,
        "description":   "",
        "prepTime":      parse_minutes(recipe.get("prep_time","")),
        "cookTime":      parse_minutes(recipe.get("cook_time","")),
        "servings":      parse_servings(recipe.get("recipe_quantity","")),
        "ingredients":   [i.strip() for i in recipe.get("ingredients",[]) if i.strip()],
        "steps":         [s.strip() for s in recipe.get("steps",[]) if s.strip()],
        "notes":         recipe.get("author_tip","").strip() or None,
        "sourceUrl":     source_url,
    }

def is_valid(r):
    return len(r["name"]) > 2 and len(r["ingredients"]) >= 2 and len(r["steps"]) >= 1


# ══════════════════════════════════════════════
#  SCRAPER
# ══════════════════════════════════════════════

def scrape(queries, per_query, delay):
    results, seen = [], set()

    for (label, term, dt, category) in queries:
        print(f"\n🔍  {label}  [{CATEGORY_LABELS.get(category, category)}]", flush=True)

        opts = {"aqt": term, "sort": "markdesc"}
        if dt: opts["dt"] = dt

        try:
            found = search(opts)
        except Exception as e:
            print(f"    ⚠️  Erreur recherche : {e}", flush=True)
            continue

        if not found:
            print("    ─  Aucun résultat", flush=True)
            continue

        count = 0
        for item in found:
            if count >= per_query: break
            url = item.get("url","")
            if not url: continue

            print(f"    ⬇  {item.get('name', url)[:55]}", flush=True)
            try:
                detail    = get_recipe(url)
                source_url = "https://www.marmiton.org" + (url if url.startswith("/") else "/" + url)
                r          = to_cuisinotron(detail, category, source_url=source_url)

                if not is_valid(r):
                    print(f"       ⛔  Incomplet ({len(r['ingredients'])} ing, {len(r['steps'])} étapes)", flush=True)
                    continue
                if r["id"] in seen:
                    print(f"       ↩  Doublon ignoré", flush=True)
                    continue

                seen.add(r["id"])
                results.append(r)
                count += 1
                t = r["prepTime"] + r["cookTime"]
                print(f"       ✅  {len(r['ingredients'])} ing · {len(r['steps'])} étapes · {t} min", flush=True)

            except RecipeNotFound:
                print(f"       ⛔  404", flush=True)
            except Exception as e:
                print(f"       ⚠️  {e}", flush=True)

            time.sleep(delay)

    return results


def load_existing(path):
    try:
        with open(path, "r", encoding="utf-8") as f:
            raw = json.load(f)
        if isinstance(raw, dict):
            return raw.get("customRecipes", raw.get("catalog", []))
        elif isinstance(raw, list):
            return raw
    except FileNotFoundError:
        pass
    return []


# ══════════════════════════════════════════════
#  MAIN
# ══════════════════════════════════════════════

if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Marmiton → Cuisinotron3000",
        formatter_class=argparse.RawTextHelpFormatter
    )
    parser.add_argument("--query",     "-q", default=None,
                        help="Requête custom (ex: \"tarte aux poireaux\")\n"
                             "Remplace les requêtes par défaut si spécifié.")
    parser.add_argument("--category",  "-c", default="repas",
                        choices=["repas","tartinade","petitdej","dessert"],
                        help="Catégorie pour --query (défaut: repas)")
    parser.add_argument("--per-query", "-n", type=int, default=PER_QUERY,
                        help=f"Recettes max par requête (défaut: {PER_QUERY})")
    parser.add_argument("--output",    "-o", default="recettes_clara_custom.json")
    parser.add_argument("--merge",     "-m", metavar="EXISTING", default=None,
                        help="Merger avec un fichier existant (sans doublons)")
    parser.add_argument("--delay",     "-d", type=float, default=DELAY_SECONDS,
                        help=f"Délai entre requêtes en secondes (défaut: {DELAY_SECONDS})")
    args = parser.parse_args()

    # Construire la liste de requêtes
    if args.query:
        label = args.query.capitalize()
        dt = CATEGORY_DT.get(args.category)
        queries = [(label, args.query, dt, args.category)]
        print(f"🍳  Recherche custom : \"{args.query}\" [{CATEGORY_LABELS.get(args.category)}]", flush=True)
    else:
        queries = DEFAULT_QUERIES
        total = len(queries) * args.per_query
        print(f"🍳  {len(queries)} requêtes × {args.per_query} = ~{total} recettes visées", flush=True)

    print(f"    Délai : {args.delay}s | Sortie : {args.output}", flush=True)

    recipes = scrape(queries, per_query=args.per_query, delay=args.delay)

    # Merge si demandé
    if args.merge:
        existing     = load_existing(args.merge)
        existing_ids = {r["id"] for r in existing if isinstance(r, dict)}
        added        = [r for r in recipes if r["id"] not in existing_ids]
        recipes      = existing + added
        print(f"\n📦  Merge : {len(existing)} existantes + {len(added)} nouvelles = {len(recipes)}", flush=True)

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump({"customRecipes": recipes, "updated": time.strftime("%Y-%m-%d")}, f,
                  ensure_ascii=False, indent=2)

    print(f"\n✅  {len(recipes)} recettes → {args.output}", flush=True)
