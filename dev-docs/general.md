# Roadmap

## Stage 1 — trustworthy current site

Implemented:

- Valid initial and saved 4:6 settings, including recovery when storage is unavailable.
- Validated, versioned recipe links with decimal doses; compatibility with valid older links.
- Recipe URLs isolated from skip links and other page anchors.
- One set of roast temperatures and consistent input limits.
- A timer based on elapsed wall time, with a fixed recipe during preparation and brewing.
- Accessible mobile/desktop navigation, fixed-header spacing, numbered recipe steps, and readable themes.
- A validated coffee/water calculator, corrected Swedish copy, and useful About/Contact pages.
- Regression tests, Svelte compiler checks, production-aware browser/accessibility checks, and check/test gates before deployment.

The review at `project-review.md` records the original findings; its first-stage defects describe the pre-change baseline.

## Dependency triage

Completed: patched framework and tooling, removed unused dependency chains, and reached zero known registry advisories. See `security-triage.md` for scope, exposure, versions, and the temporary esbuild override.

## Stage 2 — one excellent recipe

Implemented:

- Structured pour-over quantities, equipment requirements, preparation, timed steps, provenance, and adjustment advice.
- Validated dose scaling, cumulative targets, a shared detail layout, and printing of the current quantities.
- Focused brewing sessions with fixed active parameters, wall-clock timing, and manual confirmation after drainage.
- Recipes first on the homepage, a featured V60 entry point, related guides, and method-aware troubleshooting links.

See `recipe-authoring.md` for the model, supported scaling range, session behavior, and fallback without JavaScript.

## Stage 3 — repeat and learn

- Extend the recipe model to AeroPress and French press.
- Add favorites and a local brew journal with export/import.
- Support repeating and comparing saved brews.
- Complete PWA registration, offline availability, and a non-disruptive update flow.

See `project-review.md` for the detailed rationale and acceptance criteria.
