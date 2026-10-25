# ☕ Kaffekompis — din bryggarvän

Kaffekompis samlar bryggrecept, praktiska verktyg och kunskap om kaffe. Projektet byggs med Astro och Svelte och publiceras som en statisk webbplats på GitHub Pages.

Här finns recept för elbryggare, pour over, French press och AeroPress, en 4:6-generator med bryggtimer och delningsbara recept, kalkylatorer och bryggfelsökning. De tre manuella recepten har justerbar dos, guidat bryggläge och utskrift med aktuella mängder. I immersionsrecepten bekräftar du när omrörningen är klar, så att hela dragtiden räknas från rätt ögonblick. Elbryggaren har en batchkalkylator med vatten eller koppar som indata, vald dosering och kontroll mot angiven maskinkapacitet. Kaffet visas i gram och ungefärliga kaffemått och dl malet kaffe, med justerbara omräkningsvärden.

## Kom igång

Använd Node 22.23.4 eller senare (se `.nvmrc`) och pnpm-versionen i `package.json`.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Produktionsbygget använder `/KaffeKompis/` som basadress. Lokalt utvecklingsläge använder `/`.

## Kontrollera ändringar

```sh
pnpm audit
pnpm check
pnpm exec vitest run
pnpm build
pnpm test:browser
```

`check` kör Astros diagnostik och kompilerar alla Svelte-komponenter, även sådana som inte importeras av en sida. Enhetstesterna täcker bland annat lagrade inställningar, receptdelning, ankarlänkar och timersessioner. GitHub Actions kontrollerar säkerhetsadvisories på hög nivå och kör check, enhetstester och build före publicering.

Webbläsartesterna använder `puppeteer-core` och en separat installerad Chrome/Chromium. Ange en befintlig installation, exempelvis:

```sh
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium pnpm test:browser
```

Om Chrome ligger på sin vanliga systemplats kan drivrutinen hitta den utan miljövariabeln. Inga webbläsare laddas ned automatiskt vid installation.

`test:browser` serverar produktionsbygget under rätt basadress och kontrollerar samtliga sidor vid 390 och 1440 pixlar i båda färgteman. Det testar också meny, teman, decimaldelning, timer, blockerad lagring, kalkylator och layout vid 320 pixlar. Recepttesterna kontrollerar de manuella metodernas skalning, bryggläge, omrörning, full dragtid och manuell avslutning. Batchtesterna täcker vatten, koppstorlekar, dosering och maxvolym. Alla fyra recept kontrolleras för utskrift och läsbarhet utan JavaScript. Utskriftsprov sparas som `reports/pour-over-40g.pdf`, `reports/aeropress-15g.pdf`, `reports/french-press-45g.pdf` och `reports/electric-filter-1250ml.pdf`. `pnpm a11y` kör sidgranskningen utan interaktionstesterna. Resultat sparas i den ignorerade katalogen `reports/`. Valfria skärmbilder sparas om `BROWSER_SCREENSHOTS` anger en katalog.

## Recept och kunskap

Recept ligger i `src/content/recipes/`, artiklar i `src/content/blog/` och verktygsmetadata i `src/content/tools/`. Scheman definieras i `src/content.config.ts`. [Guide till strukturerade recept](dev-docs/recipe-authoring.md) beskriver planens fält, validering, exakta grundmängder och metodernas tidslinjer. Bryggförhållandet räknas fram från kaffe och vatten; avrundningen i etiketten styr aldrig skalningen.

4:6-verktyget stöder 6–76 g kaffe med en decimal och bryggförhållanden 1:12–1:18. Rostningstemperaturer och validering finns i `utils/recipe.js` under generatorn. Receptlänkar använder parametern `recipe`; vanliga sidankare ändrar aldrig receptet. Giltiga äldre länkar läses och uppgraderas vid sidladdning.

Timern fortsätter att mäta tid när sidan ligger i bakgrunden och uppdaterar visningen när du återvänder. Brygginställningarna låses tills timern stoppas eller är färdig. Sparade preferenser är frivilliga: verktyget fungerar även om webbläsaren blockerar lagring.

## Säkerhet och verktyg

[Triagen](dev-docs/security-triage.md) dokumenterar uppgraderingen från Astro 5 till 7, borttagna oanvända beroendekedjor och auditresultatet. Kör `pnpm audit` för ett aktuellt resultat. Den begränsade esbuild-override-regeln kan tas bort när Vites eget versionsintervall inkluderar den patchade versionen.

Den tidigare PWA-integrationen registrerades aldrig av sidorna och har tagits bort vid säkerhetsuppgraderingen. Offlinefunktioner införs med en kompatibel implementation i fas tre. Produktionsbasen delas av Astro och webbläsartesterna via `site.config.mjs`.

## Fortsatt utveckling

[Projektgranskningen](dev-docs/project-review.md) beskriver den ursprungliga analysen. [Roadmap](dev-docs/general.md) visar genomförda och kommande steg.
