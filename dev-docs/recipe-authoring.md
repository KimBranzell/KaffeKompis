# Structured recipes

The three manual recipes use the structured workflow: `klassisk-pour-over.md`, `stark-aeropress.md`, and `french-press-morgon.md`. They share scaling, preparation, brewing controls, and printing, with method-specific steps and equipment limits. `vardagskaffe-elbryggare.md` uses a separate batch calculator for an electric brewer.

## One source for brewing quantities

The recipe's optional `brew` frontmatter holds its version, exact base coffee and water doses, brewer label, dose presets, temperature, grind guidance, supported dose range, batch-water limit, total time range, equipment, preparation, timed steps, taste target, related guides, and sources. The schema is `src/lib/recipes/schema.js` and is validated by Astro during content loading.

The ratio is derived from `waterGrams / coffeeGrams`. This preserves the original 18 g / 200 g AeroPress and 30 g / 500 g French press recipes. Non-terminating ratios display with an approximation sign and two decimal places; scaling uses the original quantities rather than that rounded label. Presets must fit the supported range and use at most one decimal.

For a structured recipe, omit `brewTime`. The duration label is generated from `brew.targetTime` so the cards and recipe page cannot drift apart. Recipes without a plan must retain `brewTime` and their Markdown instructions.

Keep ingredient quantities and step instructions in the plan. Markdown below the frontmatter is for explanation, adjustments, and context, rather than another manually maintained ingredient list.

## Timeline and scaling

- `pour` steps have `atSeconds`, `title`, `instruction`, and a base-dose `waterGrams` amount.
- `wait`, `stir`, `steep`, and `press` steps have no water amount. Use `wait` for final pour-over drainage and `press` for final immersion pressing and serving.
- The first step is a pour at zero, times strictly increase, and pours must sum to the base `waterGrams`.
- Scaling changes water amounts and cumulative scale targets. It preserves the recipe's temperature, grind guidance, and suggested step times.
- Dose is supported to one decimal. Cumulative water targets round to a tenth of a gram; individual pours are derived from those targets so rounding cannot change the final total.
- `maxDoseGrams × waterGrams / coffeeGrams` must fit within `maxWaterGrams`. Equipment instructions should cover the largest supported batch, including headroom. A smaller brewer requires a separate supported range, not extrapolation beyond the recipe's limits.

At 20 g / 1:16, the plan uses 320 g water with cumulative targets 50, 140, 230, and 320 g. At 40 g these become 100, 280, 460, and 640 g. The example timings remain 0:00, 0:30, 1:15, 2:00, then drainage from 2:35. They are guidance for the base dose; a larger brew can take longer.

| Recipe | Supported dose | Water at base dose | Preparation and timing |
| --- | --- | --- | --- |
| V60 02 | 15–40 g | 320 g at 20 g | Four pours, then drainage; total target 3:30–4:00 |
| AeroPress Original, upright | 12–18 g | 200 g at 18 g | Pour, stir and insert plunger, confirm, steep 60 seconds, press; total target 2:00–2:30 |
| French press, at least 1 litre | 15–45 g | 500 g at 30 g | Pour, stir and fit lid, confirm, steep 240 seconds, press and serve; total target 5:15–5:45 |

The AeroPress range intentionally limits this concentrated recipe to a small upright batch. French press requires room above the largest 750 g water batch. These are recipe limits, not universal brewer capacities.

## Brewing and printing

The recipe page server-renders the default quantities, equipment, preparation, and numbered steps. It remains readable without JavaScript. Dose controls and the guided timer activate after hydration.

Starting a brew takes an independent snapshot and locks the dose. The elapsed wall time catches up after background delays. The final drainage or pressing stage does not auto-complete at the target time: the brewer confirms when it is physically finished. Stop cancels the timer and unlocks the controls; changing dose clears the previous result.

Stirring is a manual boundary. A delayed callback cannot skip it. Confirming that stirring and the lid/plunger are ready starts the full steep duration, calculated from the next two steps' scheduled times. Later targets shift by the actual confirmation time, while total elapsed time continues. The printed timeline keeps the original suggested times. The screen shows time remaining to the next action. Do not infer completion from the clock alone.

Printing uses the current quantities and the full step schedule, including when the screen is focused on an active step. It includes coffee dose, water, equipment, preparation, times, cumulative targets, recipe version, and the original recipe URL. Navigation, controls, interactive status, and supplementary articles are hidden in print.

## Electric filter batches

An `electric-filter` recipe uses `batch` instead of `brew`, with a machine-dependent `brewTime` label. `batchRecipeSchema` shares provenance, equipment, preparation, and taste fields with the manual model. Its numeric fields are base `waterMl`, `gramsPerLitre`, calculator `minWaterMl`/`maxWaterMl`, editable default `capacityMl`, and estimated `gramsPerScoop`/`gramsPerDl`. The default water must fit the default capacity and the recipe range. Batch steps have titles and instructions rather than scheduled pours.

`calculateBatch` in `src/lib/recipes/batch.js` calculates `coffeeGrams = waterMl × gramsPerLitre / 1000`, rounded to a tenth. The current recipe defaults to 60 g/l, with a taste adjustment range of 50–75 g/l. The calculator supports whole millilitres or 1–16 whole cups with an explicit 125/200/250 ml size. Cup amounts describe water input, not a promise of beverage yield. Water and cup modes keep their own visible inputs; switching modes recalculates from the newly selected controls.

`estimateCoffeeMeasures` converts that gram result into level scoops and decilitres of ground coffee. Defaults are 6 g/scoop and 40 g/dl; they are explicit estimates rather than universal unit conversions. The scoop starting value falls within Löfbergs's stated 6–8 g range; the dl value is the site's editable assumption. Both factors are adjustable for the current page under “Anpassa dina kaffemått”: 1–20 g/scoop and 10–80 g/dl, with up to two decimal places. They do not change the gram dose or water calculation. Invalid factors hide volume estimates while the valid gram recipe remains usable. Coffee scoops display to one decimal and coffee dl to two, always marked approximate. Water also displays its exact ml-to-dl conversion separately.

Capacity is entered by the user, not detected. Batches above it are rejected rather than silently reduced. The recipe's 500–2000 ml calculation range does not override a machine's minimum batch size, filter basket limits, or manual. The default 1250 ml capacity is an example. Fill with cold water; brewing temperature and duration belong to the machine. There is no simulated control of its program or timed hand-pour workflow.

`BatchRecipe.svelte` renders the default 1 litre / 60 g recipe without JavaScript, including 10 approximate scoops or 1.5 dl ground coffee. Printing includes the currently calculated coffee, water, valid volume estimates and their conversion factors, dose per litre, entered capacity, preparation, instructions, version, and source recipe URL. Invalid batch amounts clear the result and disable the print button. Invalid volume calibration omits those estimates from print without invalidating the gram recipe. The tool index links to this same recipe/calculator so there is one implementation.

## Knowledge and provenance

`relatedGuides` contains blog entry IDs. A missing ID fails the recipe build. The troubleshooting link carries the recipe method in its URL and the tool validates the method before selecting it.

Provide direct source links and explain adaptations. The V60 recipe preserves Kaffekompis's original 20 g / 320 g base and adds an explicit four-pour schedule. Hario's guide supports the basic V60 technique; it is not the source of the exact custom dose and timings. AeroPress's own instructions and Bodum's French press manual support the respective techniques; the site's existing quantities and custom timelines remain identified as adaptations. `reviewedOn` records a content review, not a claim of physical testing with every bean or grinder.

Increment the recipe version when its brewing quantities or technique change. Favorites, historical journal entries, export/import, and offline support remain future work.
