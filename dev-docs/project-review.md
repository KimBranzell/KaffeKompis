# Kaffekompis project review

Reviewed 25 October 2026, at commit `f9beea3`.

## Direction

Make the recipe the central object of the site. A visitor should be able to find a recipe, adapt it to their dose and equipment, brew from it, record the result, and make one informed change next time. Tools and knowledge should support that sequence.

The existing implementation presents a different hierarchy: the hero promotes tools, the homepage lists tools and blog posts before recipes, and the most developed brewing experience is a separate 4:6 generator. The recipe pages themselves are short Markdown articles. Closing that gap is the highest-value product change.

Keep Astro, static hosting, Markdown content collections, and Svelte for interactions. These suit a personal coffee knowledge library well. A framework rewrite, accounts, and a backend would add work before addressing the main experience.

## What exists and what is worth keeping

- Fifteen generated pages: homepage; recipe index and three recipes; tool index and three tools; blog index and three posts; About and Contact.
- Three brewing methods: pour over, AeroPress, and French press.
- A substantial 4:6 tool with configurable pours, cumulative water targets, preparation countdown, brewing timer, saved parameters, printing, and sharing.
- A taste troubleshooter and a basic coffee/water calculator.
- Astro content collections already validate recipe, blog, and tool metadata. This is a useful foundation for structured recipes.
- A recognizable visual identity: warm colors, bold typography, black outlines, and offset shadows. Keep its character while reducing visual competition during brewing.
- Useful accessibility foundations: Swedish document language, skip link, focus styling, reduced-motion support, labels, and some live announcements.

## Verification and limits

The review covered source, content, styling, build configuration, deployment workflow, tests, and all generated routes.

| Check | Result |
| --- | --- |
| Frozen-lockfile dependency installation | Passed using the pinned pnpm version; dependency inputs unchanged |
| `npm run build` | Passed; 15 pages generated |
| `npm run check` | Passed: 0 errors, 0 warnings, 11 hints |
| `npm test -- --run` | Passed: one file, two tests |
| Direct compilation of all 18 Svelte files, using the project's preprocessor | Two unused custom selects fail with `bind_invalid_expression` |
| Chromium visits at 1440px and 390px | All 30 route/viewport combinations returned HTTP 200; no uncaught page errors during those visits |
| axe checks on those visits | Seven distinct rule failures; shared header failures recur across pages |
| Additional interaction checks | Reproduced zero defaults, decimal sharing corruption, skip-link recipe mutation, temperature inconsistency, invalid-recipe timer start, calculator invalid input, and broken dark colors |

The browser checks used the production build under `/KaffeKompis/`. The local Node runtime was 26.11.1; the older Puppeteer driver required a temporary loader workaround in the review harness. No application code was changed for verification. The review did not exercise native phone sharing, a real screen reader, physical mobile devices, long background/sleep sessions, or the hosted deployment. Automated accessibility checks do not establish overall conformance. Lint was not run.

The build also warns about circular Svelte chunks involving `tick` and the troubleshooter. No resulting runtime error appeared in the route visits; investigate the warning rather than treating it as a confirmed crash. Astro's installed checker excludes standalone `.svelte` files from its file diagnostics, explaining why its successful result missed the unused select errors.

## Fix before expanding the product

Priority **P1** means the next quality release; **P2** means the recipe foundation; **P3** means follow-on work. Effort labels describe relative scope, not calendar promises.

### P1: reliable brewing state

| Finding and evidence | User impact | Suggested fix |
| --- | --- | --- |
| `utils/brewingStore.js:21`: `Number(localStorage.getItem(key))` turns a missing key into `0`. A fresh browser displays 0g coffee, 0g water, and ratio 1:0. | The main brewing tool starts in an invalid state. | Handle absent/empty storage before parsing; validate positive finite numbers and supported ranges; catch storage failures and use defaults. |
| `utils/recipeSharing.js`: 20.5g at 1:15 decodes as 20g at 1:65; 20.1g becomes 20g at 1:25. | A shared recipe can brew differently from its original. | Use a versioned serialization format with explicit decimal precision and schema validation; preserve decoding of valid older links. |
| Every hash is parsed as a recipe. `#main-content` decodes as 1g, ratio 1:4, light roast, strong profile. Activating the skip link changes the recipe and resets timer state. | Normal page navigation changes brewing parameters. | Give recipe parameters a dedicated namespace, such as `?recipe=...`; leave anchors for document navigation. Reject malformed data rather than filling in arbitrary defaults. |
| `RoastSelector.svelte` uses 93/88/83°C; the store uses 94/92/90°C. The same selected roast can show different temperatures depending on interaction or initialization. | Saved/shared brews are not reproducible. | Define roast presets once. Derive temperature from that definition, or save an explicit temperature override and include it in sharing. |
| The dose input permits 1–100g, the parent recommends 6–76g, and the Start button accepts an invalid recipe. A fresh zero recipe still starts the countdown and timer. | Validation describes an error without preventing the broken workflow. | Decide supported limits once. Distinguish advisory recommendations from invalid values. Block invalid brewing and sharing; connect errors to the actual input. |
| Timer time advances by adding 0.1 on each interval callback. Its duration is captured at start, while the displayed schedule can still change. | Delayed callbacks can lose time; editing a running recipe can make instructions disagree with the timer. | Measure elapsed time from timestamps, with an explicit policy for pause and device sleep. Snapshot the recipe at Start; keep editing and active-session state separate. |

The coffee input receives `errorId` from its parent but does not declare or attach it. The ratio input has error attributes, so the two controls currently expose different validation behavior.

Timer follow-up: centralize ownership of the interval and session state. A hash change currently resets stores without cancelling the interval owned by `BrewingControls.svelte`. Use explicit states such as idle, preparing, brewing, paused, completed, and cancelled, with cleanup on transitions and unmount. Announce step changes rather than repeatedly announcing elapsed time.

Browser callbacks can run later than their requested interval, which is why callback counting is unsuitable as the time source. See [MDN's interval timing documentation](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval).

### P1: navigation, readability, and theme

- **Build a real mobile menu.** At 390px the recipe link starts around x=548px and the theme control around x=802px, outside the viewport. A document-level overflow check misses this because the fixed header does not expand the page width. At desktop widths the Tools trigger loses its text through `m750:hidden` and has no accessible name. Put Recept first, give every control a visible label, and provide a usable touch/keyboard menu.
- **Fix the fixed-header offset in the shared layout.** `scroll-margin-top` helps anchor scrolling but does not reserve initial layout space. At 390px recipe section content starts at y=56px under an 88px header; Contact and About start at y=0. The ratio calculator's first label starts at y=3px. Use one header-height variable for layout and scroll offsets.
- **Restore recipe list markers.** The production recipe page has `list-style-type: none` on its ordered instructions. Tailwind's reset removes markers and `.article-content` does not restore them. Numbering is essential when following brewing steps.
- **Repair dark mode before promoting it.** In the dark recipe view, inherited text computes to `rgb(250,250,250)` inside a white article panel; the body also keeps its light gradient. Use semantic surface/text/border tokens together across the whole page. The theme control itself uses CSS variables that the active stylesheet does not define.
- **Remove horizontal overflow in the 4:6 tool.** At 390px the page expands to 503px. Check the roast buttons, dose controls, button rows, and fixed timeline. Make active instructions fit the viewport without requiring horizontal scanning.
- **Fix shared semantics.** The theme button sits directly inside a `ul[role=list]` without a list item, triggering axe on every page. The generator nests `role=main` inside the layout's main landmark. Its timeline is not keyboard focusable. Recipe/tool index cards jump from h1 to h3. The generator, calculator, About, and Contact have no h1.
- **Finish the calculator's presentation.** It currently renders `coffeeToWaterRatio är: [object Object]`, mixes English and Swedish, and has almost no page framing. Zero ratio produces an empty calculated coffee field; negative and empty values lack useful feedback. Its strength slider is not bound to the ratio input, and its Weak/Strong direction conflicts with increasing the water ratio. Track the last edited quantity, validate inputs, keep values numeric internally, and format only for display.

Do not treat seven axe rule types as seven isolated defects: two come from shared header markup and repeat throughout the site. Conversely, the automated light-theme audit did not detect the off-screen navigation or the dark-theme text problem.

### P1: content accuracy and trust

- Restore Swedish characters across interface text, metadata, recipes, and posts. Fix typos such as “Grv malning.” Use consistent terminology: hällning, bryggförhållande, malningsgrad, and a short explanation of bloom/drawdown where useful.
- Make the existing three recipes complete before adding many more. The AeroPress recipe says “inverted or regular” without separate instructions and advertises 2:00 while its explicit wait and press add up to 1:30; clarify the timing and choose a concrete procedure. The pour-over recipe leaves the final pours to “2 to 3” rather than giving an easily repeatable schedule.
- Add equipment, brewer size/capacity, dose, ratio, temperature, grind description, expected yield, preparation, a complete procedure, taste target, and adjustment advice consistently. Mark time as a target range when appropriate.
- Separate a source method from your adaptations. The 4:6 tool names Tetsu Kasuya and Brewing Habits but provides no source links or explanation of which choices are personal adaptations.
- Label grind/click suggestions as starting points with provenance. The conversion table ends at 950μm/30 clicks, while the dose calculation can recommend 1200μm; 40g and 76g both return 30 clicks despite different recommendations. Show an out-of-range state rather than implying an exact match. Allow personal calibration later.
- Clarify the troubleshooter's decision order. It says to change one variable, but shows changes to grind, temperature, and technique together. Its “prioritized” array puts generic recommendations before method, flow, and roast adjustments. Display one primary experiment, the reason, and optional alternatives. Ask flow questions only when meaningful for the selected method; the likely-cause block currently depends on taste alone.
- Replace the About placeholder and `this is title` browser title. Give Contact an actual supported contact route or remove its prominent navigation entry until useful.

## P2: make recipes useful at the kitchen counter

### The recipe page

Design one reusable recipe page around three stages:

1. **Prepare:** method/equipment, coffee dose, water and ratio, temperature, grind, expected time, and prerequisites. Let the reader edit dose and see recalculated water targets.
2. **Brew:** show the current action, cumulative scale target, elapsed time, and next action. Keep optional explanation behind expandable sections. Support readable manual instructions without JavaScript.
3. **Improve:** offer “Hur smakade det?”, a short note, and one adjustment for the next attempt. Link to the relevant explanation or troubleshooting state.

For example, changing the current pour-over recipe from 20g to 40g at 1:16 should change total water from 320g to 640g and its initial 50g pour to 100g. Times and grind should remain method-specific recommendations; do not scale them linearly. Check brewer capacity before presenting a larger batch as supported.

Provide a printable view that includes only the recipe, parameters, and steps. The existing 4:6 Print button calls `window.print()` without a print stylesheet, so it prints the whole tool interface.

### Structure the recipe data

The current recipe schema contains title, description, method, difficulty, brewTime, and featured. Dose, water, temperature, and instructions live only in prose, preventing reliable scaling, filtering, timers, and shared summaries.

Extend the existing collection incrementally. A useful small model includes:

| Data | Purpose |
| --- | --- |
| Stable recipe ID and version | Keep saved sessions and shared recipes reproducible when the article changes |
| Method and equipment IDs, supported dose/capacity | Discovery and sensible scaling bounds |
| Default coffee dose, numeric ratio, temperature, grind guidance | Generate the summary and calculator from the same values |
| Steps with action kind and optional timing/water targets | Render prose, checklists, cumulative targets, and brewing mode |
| Source URL, author, adaptation notes, last verified date | Make the knowledge library trustworthy and maintainable |
| Expected taste and related guide/recipe references | Connect brewing to learning and adjustment |

Keep explanatory prose in Markdown. Avoid storing the same dose and water figures both in frontmatter and manually maintained ingredient lists. Use typed, validated data for quantities; generate their presentation. Astro's [collection schemas](https://docs.astro.build/en/reference/modules/astro-content/) already support the validation needed for this approach; no CMS is required to start.

Build the model against one complete pour-over recipe first, then check that it accommodates steeping/stirring/pressing in the existing immersion recipes. Extract reusable behavior from those real cases instead of designing an elaborate universal recipe engine upfront.

### Discovery and knowledge organization

- Move recipes directly under the hero and make “Hitta ett recept” or “Börja brygga” the primary call to action. Replace collection counts with a useful starting choice or recently used recipe.
- Start the recipe index with method choices and a few visible defaults. With three recipes, a simple method filter is enough. Add dose, brewer, taste, and time filters when the collection warrants them.
- Put evergreen material under **Kunskap** rather than making publication date the main organizing principle. Suggested entry points: malning, bryggförhållande, temperatur, vatten, rostning, and felsökning. Keep chronological posts for updates and experiments.
- Cross-link purposefully: recipe → relevant guide → troubleshooting → the next recipe adjustment. The current content types mostly lead to separate destinations.
- Add aliases such as presskanna/French press and handbryggning/pour over when introducing search. Search recipe and guide content together, with clear result types and a useful no-results state.
- Make cards easier to scan: method, dose/yield, and time before difficulty badges and descriptive marketing copy. Consider a linked recipe title instead of repeating “Se recept” as the only link label.

## Refactor in support of that experience

| Refactor | Reason and boundary |
| --- | --- |
| Split brewing calculations, browser persistence, sharing, and active-session control | The current store mixes initialization, global state, derived recipes, hash listeners, and timer resets. Keep calculations pure and independently testable. |
| Create a store/session per mounted brewing experience | Prevent future recipe instances or multiple widgets from sharing a module-level singleton. Clean up subscriptions and hash listeners. |
| Add a validated, versioned persistence adapter | Define precedence explicitly: shared recipe, saved preferences, defaults. A saved preference must never silently overwrite the active shared recipe. Journal data needs export and migration support. |
| Consolidate presets, method labels, ranges, storage keys, and time/ratio formatting | These are repeated across the generator, cards, routes, and utilities. The roast mismatch is a concrete consequence. |
| Keep Astro + Svelte; evaluate removing React from navigation | React currently serves the Radix navigation. The production build emits an approximately 183KB React client chunk plus a 56KB navigation chunk before gzip. A simpler accessible Astro/Svelte menu could remove a second runtime from all pages. Validate equivalent keyboard behavior before replacing it. |
| Consolidate active styles and introduce semantic design tokens | `styles.css` is active; older global CSS/SCSS, duplicate shadow rules, and legacy styles create ambiguity. Define surface, text, border, spacing, and control styles once. Avoid extracting a component for every wrapper. |
| Finish Tailwind configuration deliberately | `@config` is valid compatibility support in v4; its presence alone is not a migration bug. Review the `safelist` option, which v4 does not support, duplicate `border` definitions, and breakpoint intent. Existing `m500`/`m750` rules apply above their named widths and currently shrink/hide header content there. See the [Tailwind upgrade guide](https://tailwindcss.com/docs/upgrade-guide). |
| Remove verified unused experiments | `src/store.js` imports SvelteKit's `$app/env` in an Astro project. `src/utils.js` has a boolean called as a function and a missing `get` import. Both custom select copies fail compilation. The root `test.svelte` is stale test code, references a missing component/testing package, and is not part of the passing Vitest suite. Check imports before deleting. |
| Audit dependency use and runtime versions | Several fonts, utility packages, UI dependencies, and a directly pinned Vite deserve a usage/compatibility check. The lockfile contains several Vite versions; this is evidence to inspect, not proof of a defect. Pin a supported Node version for development and CI before planning upgrades. |

The unused fonts under `public/` total approximately 4.9MB and are copied into builds. That is an artifact-size finding, not evidence that visitors download all of them. Inspect actual requests and imported font subsets before optimizing runtime font performance.

## Publishing, metadata, and quality checks

- **Complete PWA wiring.** The build produces a manifest, registration script, and service worker, but the rendered pages contain no manifest link and fresh browser visits register no service worker. The layout's PWA markup is commented out. The Astro integration documents the required layout registration in its [Astro guide](https://vite-pwa-org.netlify.app/frameworks/astro). Add an update policy that will not interrupt a running brew, and test offline use only after the ordinary online experience works.
- **Fix asset metadata.** The layout references `apple-touch-icon.png` and `mask-icon.svg`, which are absent from `public/`; the PWA asset list also names an absent favicon.ico. Set the manifest language to Swedish and align theme/background colors with the site.
- **Complete discoverability metadata.** Titles and descriptions already exist. Add canonical URLs that include the production base path, `og:url`, a suitable social image, article metadata, a sitemap, and an intentional not-found page. Add Recipe structured data when the recipe fields and visible content can support it accurately; don't invent ratings or imagery for metadata.
- **Make checks part of release validation.** The deployment workflow builds and deploys but has no explicit type-check/test gates. Keep pure calculation tests, add Svelte diagnostics, and cover the handful of flows with actual failure potential: fresh load, recipe scaling, sharing round trips, anchors, timer transitions, and saved-data recovery.
- **Repair the accessibility runner before trusting it as a gate.** The duplicate runners serve `dist` at `/` even though production asset URLs use `/KaffeKompis/`, omit recipe routes, and save violations without failing on them. There is an unused server-readiness helper. Consolidate to one runner, use a production-aware preview URL, include recipe/detail pages and both themes, and define which failures block release.
- **Refresh project documentation.** `dev-docs/general.md` still lists content collections, landing pages, and troubleshooting as future work, although they exist. Document setup, Node/pnpm versions, checks, recipe authoring, sources, and the revised roadmap. Revisit the old time estimates after agreeing on acceptance criteria.

## New features, in suggested order

| Feature | Why it fits | Small first version | Priority / effort |
| --- | --- | --- | --- |
| Recipe scaling | Makes the existing collection usable for different cups | Edit coffee dose; update water and cumulative targets within equipment limits | P2 / medium |
| Focused brewing mode | Applies the strongest part of the 4:6 tool to recipes | Current step, large scale target, timer, next action, reset/completion; optional wake lock and sound where supported | P2 / medium–large |
| Favorites and recent recipes | Makes a personal knowledge library faster to reuse | Browser-local favorites and recent recipe links with clear device-local wording | P3 / small |
| Brew journal | Connects recipes to accumulated personal coffee knowledge | Save recipe version, actual dose/water/grind/time, beans, outcome, and one note; export/import JSON | P3 / medium |
| “Brew again” and compare | Turns saved knowledge into a repeatable experiment | Duplicate a journal entry and show changed parameters beside the last outcome | P3 / medium; depends on journal |
| Bean and grinder profiles | Reduces repetitive entry and supports calibration | A few saved beans and a personal grinder setting; avoid claiming universal click conversions | P3 / medium |
| Connected troubleshooting | Makes advice actionable in context | Pass the current method/recipe to the troubleshooter; choose one next adjustment and record its result | P3 / medium |
| Offline favorite recipes | Useful at the kitchen counter | Cache selected recipes and required assets; show availability and update state clearly | P3 / medium; depends on PWA repair |
| Knowledge search and glossary | Helps the collection remain usable as it grows | Static search plus aliases and short contextual definitions | P3 / medium; defer until content grows |
| Bypass and iced-coffee tools | Adds adjacent, concrete brewing value | Numeric calculations with explicit input water, ice, concentrate, and final drink definitions | Later / medium |

Prefer local storage for small preferences and IndexedDB if journal records become substantial. Local records need export/import before they hold meaningful personal history. Add account sync only if cross-device use becomes a real requirement. Community ratings, AI-generated recipes, extensive equipment catalogs, and a CMS would increase maintenance without resolving the current core experience.

## A practical sequence

### Milestone 1: trustworthy current site

Fix defaults, share parsing/anchor isolation, temperature definitions, invalid-start behavior, navigation, layout offsets, numbered instructions, dark colors, and calculator errors. Correct the shared accessibility markup and placeholders. Add regression checks for these observed failures.

Acceptance: a fresh visitor sees a valid recipe; decimal recipes survive sharing; the skip link leaves brewing data untouched; primary links and controls are usable at 390px and desktop; both themes remain readable; production pages retain numbered steps.

### Milestone 2: one excellent recipe

Complete the pour-over content, introduce validated quantities and steps, build scaling and the shared recipe layout, and add a focused brewing session. Put recipes first on the homepage. Connect that recipe to one useful knowledge page and its troubleshooting path.

Acceptance: a visitor can find, scale, prepare, brew, and print that recipe without separately transcribing values into a calculator. Recipe text remains useful without JavaScript. Editing setup cannot silently alter an active session.

### Milestone 3: repeat and learn

Apply the recipe model to AeroPress and French press. Add favorites, a small journal with export/import, and “brew again.” Feed the saved method and outcome into one suggested adjustment. Complete PWA/offline support after online flows are stable.

Acceptance: the user can return to an earlier brew, reproduce its parameters, record one change, and compare the outcome. Changes to the published recipe do not rewrite the historical session.

The strongest first deliverable is a dependable, scalable recipe experience for the existing three recipes. It creates the foundation for both a better public reference and a useful personal record of what you have learned.
