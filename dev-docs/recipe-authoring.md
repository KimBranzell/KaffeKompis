# Structured recipes

Phase two implements the structured workflow for `klassisk-pour-over.md`. Existing AeroPress and French press articles still use their ordinary Markdown instructions until their methods are adapted in phase three.

## One source for brewing quantities

The recipe's optional `brew` frontmatter holds its version, base coffee dose, water ratio, temperature, grind guidance, supported dose range, batch-water limit, expected time range, equipment, preparation, timed steps, taste target, related guides, and sources. The schema is `src/lib/recipes/schema.js` and is validated by Astro during content loading.

For a structured recipe, omit `brewTime`. The duration label is generated from `brew.targetTime` so the cards and recipe page cannot drift apart. Recipes without a plan must retain `brewTime` and their Markdown instructions.

Keep ingredient quantities and step instructions in the plan. Markdown below the frontmatter is for explanation, adjustments, and context, rather than another manually maintained ingredient list.

## Timeline and scaling

- `pour` steps have `atSeconds`, `title`, `instruction`, and a base-dose `waterGrams` amount.
- `wait` steps have no water amount. The current version ends with a drainage wait.
- The first step starts at zero, times strictly increase, and pours must sum to `coffeeGrams × ratio`.
- Scaling changes water amounts and cumulative scale targets. It preserves the recipe's temperature, grind guidance, and suggested step times.
- Dose is supported to one decimal. Cumulative water targets round to a tenth of a gram; individual pours are derived from those targets so rounding cannot change the final total.
- `maxDoseGrams × ratio` must fit within `maxWaterGrams`. Equipment instructions should cover the largest supported batch. A smaller brewer requires a separate supported range, not extrapolation beyond the recipe's limits.

At 20 g / 1:16, the plan uses 320 g water with cumulative targets 50, 140, 230, and 320 g. At 40 g these become 100, 280, 460, and 640 g. The example timings remain 0:00, 0:30, 1:15, 2:00, then drainage from 2:35. They are guidance for the base dose; a larger brew can take longer.

## Brewing and printing

The recipe page server-renders the default quantities, equipment, preparation, and numbered steps. It remains readable without JavaScript. Dose controls and the guided timer activate after hydration.

Starting a brew takes an independent snapshot and locks the dose. The elapsed wall time catches up after background delays. The final drainage stage does not auto-complete at the target time: the brewer confirms when it is physically finished. Stop cancels the timer and unlocks the controls; changing dose clears the previous result.

Printing uses the current quantities and the full step schedule, including when the screen is focused on an active step. It includes coffee dose, water, equipment, preparation, times, cumulative targets, recipe version, and the original recipe URL. Navigation, controls, interactive status, and supplementary articles are hidden in print.

## Knowledge and provenance

`relatedGuides` contains blog entry IDs. A missing ID fails the recipe build. The troubleshooting link carries the recipe method in its URL and the tool validates the method before selecting it.

Provide direct source links and explain adaptations. The current recipe preserves Kaffekompis's original 20 g / 320 g base and adds an explicit four-pour schedule. Hario's guide supports the basic V60 technique; it is not the source of the exact custom dose and timings. `reviewedOn` records a content review, not a claim of physical testing with every bean or grinder.

Increment the recipe version when its brewing quantities or technique change. Historical journal entries and cross-device persistence are phase-three work.
