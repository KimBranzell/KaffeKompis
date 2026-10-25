<script>
  import { onMount } from 'svelte';
  import { calculateBatch, estimateCoffeeMeasures, validCoffeeMeasureFactor, COFFEE_MEASURE_LIMITS } from '../../lib/recipes/batch.js';
  import { formatGrams } from '../../lib/recipes/brewing.js';

  export let plan;
  let ready = false;
  let mode = 'water';
  let waterMl = plan.waterMl;
  let cups = 4;
  let cupMl = 250;
  let gramsPerLitre = plan.gramsPerLitre;
  let capacityMl = plan.capacityMl;
  let gramsPerScoop = plan.gramsPerScoop;
  let gramsPerDl = plan.gramsPerDl;
  const formatMeasure = value => new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 }).format(value);
  onMount(() => ready = true);
  $: calculated = calculateBatch(plan, { mode, waterMl, cups, cupMl, gramsPerLitre, capacityMl });
  $: ({ errors, result } = calculated);
  $: scoopValid = validCoffeeMeasureFactor(gramsPerScoop, 'scoop');
  $: dlValid = validCoffeeMeasureFactor(gramsPerDl, 'dl');
  $: measures = result ? estimateCoffeeMeasures(result.coffeeGrams, { gramsPerScoop, gramsPerDl }) : null;

  function preset(amount) { mode = 'water'; waterMl = amount; }
</script>

<section class="batch-recipe" aria-labelledby="batch-title">
  <header class="batch-heading">
    <div><p class="section-kicker">Vardagskaffe</p><h2 id="batch-title">Räkna din kanna.</h2></div>
    <button type="button" class="print-batch" disabled={!ready || !result} on:click={() => window.print()}>Skriv ut</button>
  </header>

  <div class="batch-grid">
    <div class="batch-panel accent-panel">
      <fieldset disabled={!ready}>
        <legend class="sr-only">Beräkna kaffe och vatten till elbryggaren</legend>
        <div class="input-mode" role="group" aria-label="Räkna med">
          <label><input type="radio" name="batch-mode" value="water" bind:group={mode} /> Vattenmängd</label>
          <label><input type="radio" name="batch-mode" value="cups" bind:group={mode} /> Antal koppar</label>
        </div>
        {#if mode === 'water'}
          <label for="batch-water">Vatten i tanken (ml)</label>
          <input id="batch-water" type="number" min={plan.minWaterMl} max={plan.maxWaterMl} step="1" bind:value={waterMl} aria-invalid={errors.amount ? 'true' : undefined} aria-describedby={errors.amount ? 'batch-amount-error' : 'batch-amount-hint'} />
        {:else}
          <div class="cup-inputs">
            <div><label for="batch-cups">Antal koppar</label><input id="batch-cups" type="number" min="1" max="16" step="1" bind:value={cups} aria-invalid={errors.amount ? 'true' : undefined} aria-describedby={errors.amount ? 'batch-amount-error' : 'batch-amount-hint'} /></div>
            <div><label for="batch-cup-size">Koppstorlek</label><select id="batch-cup-size" bind:value={cupMl} aria-invalid={errors.cupSize ? 'true' : undefined} aria-describedby={errors.cupSize ? 'batch-cup-error' : 'batch-amount-hint'}>
              <option value={125}>125 ml · bryggarkopp</option><option value={200}>200 ml · kopp</option><option value={250}>250 ml · mugg</option>
            </select></div>
          </div>
        {/if}
        <p id="batch-amount-hint" class="hint">Koppar × koppstorlek är mängden vatten du fyller på. Koppmarkeringar varierar mellan bryggare. Färdig dryck blir mindre eftersom vatten stannar i kaffet.</p>
        {#if errors.amount}<p id="batch-amount-error" class="validation-error" role="alert">{errors.amount}</p>{/if}
        {#if errors.cupSize}<p id="batch-cup-error" class="validation-error" role="alert">{errors.cupSize}</p>{/if}
        <div class="batch-presets" role="group" aria-label="Välj vattenmängd">
          {#each [500, 750, 1000, 1250].filter(amount => amount >= plan.minWaterMl && amount <= plan.maxWaterMl) as amount}
            <button type="button" disabled={amount > capacityMl || !!errors.capacity} aria-pressed={result?.waterMl === amount} on:click={() => preset(amount)}>{formatGrams(amount)} ml</button>
          {/each}
        </div>
        <label for="batch-strength">Dosering (g kaffe per liter vatten)</label>
        <input id="batch-strength" type="number" min="50" max="75" step="1" bind:value={gramsPerLitre} aria-invalid={errors.strength ? 'true' : undefined} aria-describedby={errors.strength ? 'batch-strength-error' : 'batch-strength-hint'} />
        <p id="batch-strength-hint" class="hint">Börja med {plan.gramsPerLitre} g/l. Prova lite lägre eller högre dosering efter smak, en ändring i taget.</p>
        {#if errors.strength}<p id="batch-strength-error" class="validation-error" role="alert">{errors.strength}</p>{/if}
        <label for="batch-capacity">Bryggarens maxvolym (ml)</label>
        <input id="batch-capacity" type="number" min={plan.minWaterMl} max={plan.maxWaterMl} step="1" bind:value={capacityMl} aria-invalid={errors.capacity ? 'true' : undefined} aria-describedby={errors.capacity ? 'batch-capacity-error' : 'batch-capacity-hint'} />
        <p id="batch-capacity-hint" class="hint">Kontrollera din maskins tank, kanna och filterkorg. Följ även manualens minsta bryggmängd. Receptet räknar på {plan.minWaterMl}–{plan.maxWaterMl} ml; förvalet är ingen uppgift om din maskin.</p>
        {#if errors.capacity}<p id="batch-capacity-error" class="validation-error" role="alert">{errors.capacity}</p>{/if}
        <details class="measure-settings">
          <summary>Anpassa dina kaffemått</summary>
          <p class="hint">Kaffemått och malning varierar. Använd strukna, löst fyllda mått. Om du kan väga vid ett tillfälle, väg flera mått och dela vikten med antalet för att justera uppskattningen.</p>
          <label for="batch-scoop-grams">Gram per kaffemått</label>
          <input id="batch-scoop-grams" type="number" min={COFFEE_MEASURE_LIMITS.scoop.min} max={COFFEE_MEASURE_LIMITS.scoop.max} step="0.01" bind:value={gramsPerScoop} aria-invalid={!scoopValid ? 'true' : undefined} aria-describedby={!scoopValid ? 'batch-scoop-error' : 'batch-measure-hint'} />
          {#if !scoopValid}<p id="batch-scoop-error" class="validation-error" role="alert">Ange 1–20 g per kaffemått med högst två decimaler.</p>{/if}
          <label for="batch-dl-grams">Gram per dl malet kaffe</label>
          <input id="batch-dl-grams" type="number" min={COFFEE_MEASURE_LIMITS.dl.min} max={COFFEE_MEASURE_LIMITS.dl.max} step="0.01" bind:value={gramsPerDl} aria-invalid={!dlValid ? 'true' : undefined} aria-describedby={!dlValid ? 'batch-dl-error' : 'batch-measure-hint'} />
          {#if !dlValid}<p id="batch-dl-error" class="validation-error" role="alert">Ange 10–80 g per dl malet kaffe med högst två decimaler.</p>{/if}
          <p id="batch-measure-hint" class="hint">Förvalen {formatMeasure(plan.gramsPerScoop)} g/mått och {formatMeasure(plan.gramsPerDl)} g/dl är uppskattningar. Ett större kaffemått kan till exempel rymma mer kaffe. Justeringarna ändrar omräkningen, inte receptets kaffevikt.</p>
        </details>
      </fieldset>
      <noscript><p>Standardreceptet nedan gäller {plan.waterMl} ml vatten. Aktivera JavaScript för att ändra batchen.</p></noscript>
    </div>

    <div class="batch-right">
      {#if result}
        <section class="batch-result paper-surface" aria-labelledby="batch-result-title">
          <h3 id="batch-result-title">Din batch</h3>
          <div role="status" aria-live="polite" aria-atomic="true">
            <dl class="batch-metrics">
              <div><dt>Dosera kaffe</dt><dd><span data-batch-coffee>{formatGrams(result.coffeeGrams)}</span> g</dd></div>
              <div><dt>Fyll på kallt vatten</dt><dd><span data-batch-water>{formatGrams(result.waterMl)}</span> ml</dd></div>
            </dl>
            <p class="hint water-dl">= <span data-batch-water-dl>{formatMeasure(result.waterMl / 100)}</span> dl vatten</p>
            {#if measures}
              <dl class="batch-metrics coffee-measures">
                <div><dt>Strukna kaffemått</dt><dd>≈ <span data-batch-scoops>{formatGrams(measures.scoops)}</span></dd></div>
                <div><dt>dl malet kaffe</dt><dd>≈ <span data-batch-coffee-dl>{formatMeasure(measures.coffeeDl)}</span> dl</dd></div>
              </dl>
              <p class="hint measure-assumptions" data-measure-assumptions>Räknat med {formatMeasure(gramsPerScoop)} g/mått och {formatMeasure(gramsPerDl)} g/dl. Volymmåtten är ungefärliga och påverkas av kaffe, malning och hur du fyller måttet.</p>
            {:else}<p class="hint missing-measures">Ange giltiga värden under ”Anpassa dina kaffemått” för att se volymmåtten. Kaffevikten i gram gäller fortfarande.</p>{/if}
            <p class="hint"><strong data-batch-strength>{result.gramsPerLitre} g/l</strong> · beräknat på vatten till tanken.</p>
          </div>
          <p class="hint">Angiven maxvolym: {formatGrams(capacityMl)} ml. {plan.yieldNote}</p>
          <p class="grind-note"><strong>Malning:</strong> {plan.grind}</p>
          <p class="hint"><strong>Temperatur och tid:</strong> Bryggaren styr uppvärmning och flöde. Fyll på kallt vatten och låt programmet bli färdigt.</p>
        </section>
      {:else}<p class="paper-surface invalid-result">Fyll i giltiga mängder för att se ditt recept.</p>{/if}
      <section class="batch-preparation paper-surface" aria-labelledby="batch-prep-title">
        <h3 id="batch-prep-title">Innan du börjar</h3>
        <ul>{#each plan.equipment as item}<li>{item}</li>{/each}</ul>
        <ol>{#each plan.preparation as item}<li>{item}</li>{/each}</ol>
        <p class="hint"><strong>Sikta på:</strong> {plan.taste}</p>
      </section>
    </div>
  </div>
  <section class="batch-instructions" aria-labelledby="batch-steps-title">
    <h3 id="batch-steps-title">Så brygger du</h3>
    <ol class="batch-steps">{#each plan.steps as step}<li class="paper-surface"><h4>{step.title}</h4><p>{step.instruction}</p></li>{/each}</ol>
  </section>
</section>

<style>
  .batch-recipe { display: grid; gap: 2rem; }
  .batch-heading { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; }
  h2 { margin-top: .5rem; font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; line-height: 1.2; }
  h3 { font-size: 1.4rem; font-weight: 900; line-height: 1.3; }
  h4 { font-size: 1.15rem; font-weight: 900; }
  .batch-grid { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 1.5rem; align-items: start; }
  .batch-panel, .batch-result, .batch-preparation, .invalid-result { min-width: 0; padding: clamp(1rem, 3vw, 2rem); border: 3px solid #111; border-radius: 1rem; box-shadow: 5px 5px 0 #111; }
  .batch-panel { background: #ffe680; }
  .batch-right { display: grid; gap: 1.5rem; min-width: 0; }
  fieldset { min-width: 0; margin: 0; padding: 0; border: 0; }
  label { display: block; margin: 1.5rem 0 .5rem; font-weight: 800; line-height: 1.5; }
  input[type='number'], select { width: 100%; min-width: 0; border: 2px solid #111; padding: .65rem; background: white; color: #111; font-size: 1.1rem; font-weight: 800; min-height: 48px; }
  .input-mode { display: flex; flex-wrap: wrap; gap: .5rem 1rem; }
  .input-mode label { display: flex; align-items: center; gap: .5rem; min-height: 44px; margin: 0; cursor: pointer; }
  input[type='radio'] { width: 20px; height: 20px; accent-color: #111; }
  .cup-inputs { display: grid; grid-template-columns: minmax(0, .65fr) minmax(0, 1fr); gap: .75rem; }
  .hint { margin-top: .75rem; font-size: .875rem; line-height: 1.65; }
  .batch-presets { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin-top: 1rem; }
  button { min-height: 48px; padding: .65rem .8rem; border: 2px solid #111; font-weight: 800; }
  .batch-presets button { background: white; color: #111; }
  .batch-presets button[aria-pressed='true'] { background: #111; color: white; }
  .print-batch { border-color: currentColor; }
  button:disabled { opacity: .5; }
  .batch-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; margin-top: 1rem; }
  dt { font-size: .75rem; font-weight: 800; text-transform: uppercase; }
  dd { font-size: clamp(1.5rem, 4vw, 2rem); font-weight: 900; }
  .grind-note { margin-top: 1rem; line-height: 1.7; }
  .measure-settings { margin-top: 1.5rem; border-top: 2px dashed #111; padding-top: 1rem; }
  summary { cursor: pointer; min-height: 44px; font-weight: 800; padding: .5rem 0; }
  .coffee-measures { border-top: 1px dashed currentColor; padding-top: .75rem; }
  .coffee-measures dd { font-size: 1.4rem; }
  .water-dl { margin-top: .25rem; }
  .batch-preparation ul { list-style: disc; padding-left: 1.25rem; margin: 1rem 0; }
  .batch-preparation ol, .batch-steps { list-style: decimal; padding-left: 1.5rem; }
  li { line-height: 1.7; }
  li + li { margin-top: .75rem; }
  li::marker { font-weight: 900; }
  .batch-steps { margin-top: 1rem; }
  .batch-steps li { padding: 1rem; border: 2px solid #111; }
  .batch-steps p { margin-top: .5rem; }
  @media screen and (max-width: 700px) {
    .batch-grid { grid-template-columns: minmax(0, 1fr); }
    .batch-right { display: contents; }
    .batch-result, .invalid-result { grid-row: 1; }
    .batch-panel { grid-row: 2; }
    .batch-preparation { grid-row: 3; }
    .cup-inputs { grid-template-columns: minmax(0, 1fr); gap: 0; }
  }
  @media print {
    .batch-panel, .print-batch, .missing-measures { display: none !important; }
    .batch-recipe { gap: .5rem; font-size: 10pt; }
    .batch-heading .section-kicker { display: none; }
    .batch-grid { display: block; }
    .batch-right { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 1rem; }
    .batch-result, .batch-preparation, .batch-steps li { background: white; color: black; padding: .75rem; border: 1px solid #333; box-shadow: none; break-inside: avoid; }
    h2 { font-size: 11pt; margin: 0; } h3 { font-size: 12pt; } h4 { font-size: 11pt; }
    dd { font-size: 16pt; }
    dt { font-size: 8pt; white-space: nowrap; }
    .batch-metrics { margin-top: .5rem; }
    .hint { font-size: 9pt; line-height: 1.4; margin-top: .5rem; }
    li, .grind-note { line-height: 1.4; }
    .grind-note { margin-top: .5rem; font-size: 9pt; }
    .batch-preparation ul { margin: .5rem 0; }
    li + li { margin-top: .4rem; }
    .batch-steps { margin-top: .5rem; }
    .batch-steps li { padding: .5rem; }
    .batch-steps p { margin-top: .25rem; }
    .coffee-measures { margin-top: .5rem; padding-top: .5rem; }
    .coffee-measures dd { font-size: 13pt; }
    .measure-assumptions { font-size: 8.5pt; }
  }
</style>
