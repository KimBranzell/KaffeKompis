# Dependency security triage — 25 October 2026

The review began at commit `8820953`. GitHub reported 144 open Dependabot alerts: 4 critical, 79 high, 51 medium, and 10 low. Manifest and lockfile entries duplicate some advisories: the four critical GitHub alerts represented two distinct advisories.

The registry audit of the complete local dependency tree also identified two critical tinypool advisories. Its baseline was **184 findings: 4 critical, 93 high, 72 moderate, and 15 low**, across 1,181 dependency entries. Different advisory coverage, dependency paths, and duplication mean this count should not be compared directly with GitHub's alert total.

## Exposure and decisions

| Area | Assessment | Remediation |
| --- | --- | --- |
| Astro / Sharp AVIF image handling | The published site is static and has no server-side image endpoint or visitor uploads. Processing an untrusted AVIF during a build would still expose the build environment. | Astro 5.18 → 7.4.2, supported Svelte integration 9.1.1, Sharp 0.35.5. |
| Vitest / tinypool / old Vite | CI uses run mode and does not expose Vitest UI. The vulnerable test-server and worker code should nevertheless be removed. | Vitest 1.6 → 5.0.5, Vite 8.3.5; old worker dependencies removed. |
| Browser downloader/archive utilities | Test tooling, not code delivered to visitors. Full Puppeteer brought obsolete archive/download dependencies, including advisories without patches. | Use puppeteer-core 25.16.0 and an explicitly installed Chrome/Chromium. No browser downloads happen as an install side effect. |
| Dormant PWA integration | No page linked a manifest or registered a service worker. The Astro 5-only integration blocked the patched Astro upgrade and brought the old Workbox/Rollup chain. | Remove the dormant integration. Preserve public icons and existing online behavior. Phase-three offline support requires a compatible implementation. |
| Unused React/UI experiments and hooks | No active page used the React navigation anymore. Old SvelteKit stores and select/test scaffolding were unused. | Remove unused integrations, packages, source files, and inactive Husky/lint-staged configuration. Keep functional checks and tests. |
| Transitive parser/URL/glob tooling | Mostly build/editor tooling; stale lockfile resolutions retained old patches. | Refresh compatible transitive versions; no URL/parser/glob overrides were needed. |
| esbuild | One low-severity Windows development-server advisory remained because Vite requested an affected 0.27 release. | Narrow override `esbuild@>=0.27.0 <0.28.1` → `^0.28.1`; validate the resulting build/test tooling. Remove the override when Vite's supported dependency range includes the fix. |

## Result

After removal, upgrades, compatible transitive refreshes, and the esbuild override, `pnpm audit --json` reports **zero known vulnerabilities at every severity**, across **561 dependency entries**. No advisories were suppressed or dismissed. This is a point-in-time registry result, not a guarantee against undisclosed issues. Existing GitHub alert state will be recomputed when the updated manifest and lockfile reach its dependency graph.

Node is pinned to 22.23.4 to satisfy the patched Astro integration's engine requirement. TypeScript stays on its compatible 5.9 line. The content schema imports Zod from `astro/zod` as required by the current API.

## Validation

- Static build and Astro/Svelte checks.
- Existing 40 calculation, persistence, sharing, and timer tests.
- Browser route, theme, navigation, calculator, sharing, storage, and timer regressions.
- `pnpm audit --json` exits successfully with zero findings.

## Primary references

- [Astro AVIF advisory](https://github.com/withastro/astro/security/advisories/GHSA-26w7-cxv4-gfx2)
- [Vitest UI advisory](https://github.com/vitest-dev/vitest/security/advisories/GHSA-5xrq-8626-4rwp)
- [Astro 6 migration](https://docs.astro.build/en/guides/upgrade-to/v6/) and [Astro 7 migration](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Vitest migration guide](https://vitest.dev/guide/migration/)

The advisory metadata returned by GitHub and the registry differed on some backport patch numbers. The installed Astro 7.4.2 and Vitest 5.0.5 are beyond both reported fixed ranges.
