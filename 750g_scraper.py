#!/usr/bin/env python3
"""
750g_scraper.py — Cuisinotron3000
Scrape 750g.com pour des recettes healthy/minceur.
Même format de sortie que marmiton_scraper.py.

INSTALL  : pip install beautifulsoup4
USAGE    :
  python 750g_scraper.py --output data/750g_catalog.json
  python 750g_scraper.py --query "salade quinoa" --category repas
"""

import sys, json, time, re, argparse, unicodedata, ssl
import urllib.request, urllib.parse
from bs4 import BeautifulSoup

sys.stdout.reconfigure(line_buffering=True)

BASE_URL = "https://www.750g.com"

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
    ("Houmous maison",          "houmous maison",             "tartinade"),
    ("Tzatziki",                "tzatziki maison",            "tartinade"),
    ("Guacamole",               "guacamole maison",           "tartinade"),
    ("Caviar d'aubergines",     "caviar aubergines",          "tartinade"),
    ("Porridge avoine",         "porridge avoine",            "petitdej"),
    ("Smoothie bowl",           "smoothie bowl fruits",       "petitdej"),
    ("Overnight oats",          "overnight oats",             "petitdej"),
    ("Pancakes protéinés",      "pancakes protéinés",         "petitdej"),
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

# ── Search ────────────────────────────────────────────────────────────

_RECIPE_RE = re.compile(r"-r\d+\.htm$")

def search(query, n=12):
    results, seen = [], set()
    for url in [
        f"{BASE_URL}/recettes/recherche?search={urllib.parse.quote(query)}",
        f"{BASE_URL}/recherche?search={urllib.parse.quote(query)}",
    ]:
        try:
            html = _read(_open(url))
        except Exception as e:
            print(f"    ⚠️  {url}: {e}", flush=True)
            continue
        soup = BeautifulSoup(html, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if not href: continue
            if href.startswith("/"): href = BASE_URL + href
            if not _RECIPE_RE.search(href) or href in seen: continue
            seen.add(href)
            name = ""
            for el in [a.find(re.compile(r"^h[1-4]$")), a]:
                if el:
                    t = el.get_text(" ", strip=True)
                    if t and len(t) > 3:
                        name = t[:80]; break
            results.append({"url": href, "name": name})
            if len(results) >= n: break
        if results: break
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
    # Fallback HTML
    soup = BeautifulSoup(html, "html.parser")
    name = ""
    for sel in ["h1.recipe-title","h1[itemprop='name']","h1"]:
        el = soup.select_one(sel)
        if el: name = el.get_text(" ",strip=True); break
    ingrs = [e.get_text(" ",strip=True) for e in soup.select(
        ".recipe-ingredients__list li,.ingredients li,[itemprop='recipeIngredient']"
    ) if e.get_text(strip=True)]
    stps  = [e.get_text(" ",strip=True) for e in soup.select(
        ".recipe-step-content,.recipe-steps li,[itemprop='recipeInstructions'] p"
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
        "id":            "750g-" + slugify(name),
        "custom":        True,
        "source":        "750g",
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
    p = argparse.ArgumentParser(description="750g.com → Cuisinotron3000")
    p.add_argument("--query",     "-q", default=None)
    p.add_argument("--category",  "-c", default="repas",
                   choices=["repas","tartinade","petitdej","dessert"])
    p.add_argument("--per-query", "-n", type=int, default=PER_QUERY)
    p.add_argument("--output",    "-o", default="data/750g_catalog.json")
    p.add_argument("--merge",     "-m", metavar="EXISTING", default=None)
    p.add_argument("--delay",     "-d", type=float, default=DELAY_SECONDS)
    args = p.parse_args()

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
        json.dump({"customRecipes":recipes,"updated":time.strftime("%Y-%m-%d"),"source":"750g"},
                  f, ensure_ascii=False, indent=2)
    print(f"\n✅  {len(recipes)} recettes → {args.output}", flush=True)
