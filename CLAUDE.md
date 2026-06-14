# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Cuisinotron3000** ("Carnet de Recettes · Clara") is a client-side French recipe management web app. It suggests dishes based on the user's ingredient stock. Features include: recipe browsing by category and feasibility, ingredient inventory management, weekly meal planner with shopping list, nutritional analysis, Google Drive sync, Colruyt (Belgian supermarket) catalog integration, and bookmarklet-based recipe importing.

There is no build step. This is pure vanilla HTML/CSS/JavaScript — open `index.html` in a browser or serve with a local HTTP server (required for Drive/API calls due to CORS):

```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

There are no tests, no linter, no package manager, and no CI pipeline.

## Architecture

### Module Load Order

`index.html` loads scripts in strict dependency order (documented in inline comments). The layers are:

1. **Data** — `js/recipes.js` (static recipe DB), `js/bridge.js` (FR↔NL ingredient name mapping), `data/ciqual_fr.js` (451KB ANSES nutritional DB), `data/whitelist_canonique.js` (147KB Colruyt SKU canonical map), `data/ciqual_discriminants.js`
2. **Utilities** — `js/utils.js` (normalization, `normIngredient()`, `CANONICAL_MAP`), `js/ingredientParser.js` (qty/unit extraction via `parseIngredientString()`)
3. **Feature modules** — each self-contained, no ES module imports; all globals:
   - `js/stock.js` — ingredient inventory, reads/writes `localStorage`
   - `js/custom_recipes.js` — user-created recipe CRUD + form UI
   - `js/planner.js` — weekly meal planner, shopping list generation
   - `js/colruyt.js` — Colruyt catalog fetched from GCS, cached in IndexedDB
   - `js/nutrition.js` — macro calculations using CIQUAL data
   - `js/drive.js` — Google Drive OAuth2 + JSON file sync
   - `js/importer.js` — URL/bookmarklet recipe import (parses JSON-LD)
   - `js/bridgeWizard.js` — ingredient mapping wizard UI
   - `js/contributor.js` — exports custom data for GitHub contributions
   - `js/app.js` — recipe grid rendering, filtering, feasibility logic (depends on all of the above)

### Ingredient Matching Pipeline

The core logic that connects user stock to recipes and Colruyt products:

```
raw ingredient string
  → parseIngredientString()   [ingredientParser.js] → { qty, unit, rawName }
  → normIngredient(rawName)   [utils.js]            → lowercased, no accents, no punctuation
  → CANONICAL_MAP lookup      [utils.js]            → resolves variants to a canonical key
  → bridgeLookupFull()        [bridge.js]           → FR name → NL Colruyt product SKU
  → Colruyt IndexedDB cache   [colruyt.js]          → product details + price
```

Feasibility (`checkFeasibility()` in `app.js`) matches recipe ingredients against `stock` keys using `normIngredient()` plus substring fuzzy matching. ≥85% match = "faisable", ≥50% = "partial".

### Persistence

All user data lives in `localStorage`:
- `stock` — ingredient inventory object
- `custom_recipes` — user-added recipes (merged into `RECIPES` array at init)
- `planner` — weekly meal plan
- `customBridgeMappings` — user-defined FR→NL ingredient overrides

Colruyt product catalog is cached in **IndexedDB** (`colruyt-products` store) via the `idb` library (loaded from CDN).

Google Drive sync (optional) stores three JSON files: `recettes_clara_stock.json`, `recettes_clara_custom.json`, `recettes_clara_planner.json`. Requires `GOOGLE_CLIENT_ID` in `js/drive.js:4`.

### Globals & Conventions

- All functions and data are global (no ES modules, no bundler)
- Functions: `camelCase` — `openModal`, `renderGrid`, `checkFeasibility`
- Constants: `UPPER_SNAKE_CASE` — `RECIPES`, `INGREDIENT_BRIDGE`, `GOOGLE_CLIENT_ID`
- CSS variables: kebab-case with warm color palette — `--sage`, `--terracotta-light`, `--cream`
- Internal/private helpers: `_prefixed` — `_idbGetColruyt`
- Event handlers are inline `onclick` attributes in HTML (no `addEventListener` delegation)
- Each JS file starts with a comment block listing its name and dependencies

### CSS Structure

- `css/style.css` — main layout (sidebar 260px + main 1fr grid), card components, modals
- `css/importer.css` — import panel styles
- `css/bridge-wizard.css` — ingredient mapping wizard modal

Z-index layering: modals > sticky header/sidebar > cards.
