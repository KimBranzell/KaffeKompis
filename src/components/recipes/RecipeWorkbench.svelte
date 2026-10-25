<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { scaleBrewPlan, validRecipeDose, formatBrewTime, formatGrams } from '../../lib/recipes/brewing.js';
  import { createRecipeSession } from '../../lib/recipes/session.js';

  export let plan;
  let dose = plan.coffeeGrams;
  let lastDose = dose;
  let ready = false;
  let showSchedule = false;
  let activeHeading;
  let resultHeading;
  let startButton;
  const session = createRecipeSession();
  const { status, locked, elapsedSeconds, activeBrew, currentStep } = session;

  onMount(() => {
    ready = true;
    const refresh = () => session.refresh();
    document.addEventListener('visibilitychange', refresh);
    return () => document.removeEventListener('visibilitychange', refresh);
  });
  onDestroy(session.destroy);

  $: validDose = validRecipeDose(plan, dose);
  $: scaled = scaleBrewPlan(plan, dose);
  $: displayed = $locked ? $activeBrew : scaled;
  $: activeStep = $activeBrew?.steps[$currentStep];
  $: nextStep = $activeBrew?.steps[$currentStep + 1];
  $: if (dose !== lastDose && !$locked) {
    session.reset();
    lastDose = dose;
  }
  $: announcement = $status === 'brewing'
    ? `Steg ${$currentStep + 1} av ${$activeBrew.steps.length}: ${activeStep.title}. ${activeStep.kind === 'pour' ? `Häll ${formatGrams(activeStep.waterGrams)} gram till totalt ${formatGrams(activeStep.targetGrams)} gram på vågen.` : activeStep.instruction}`
    : $status === 'completed' ? `Bryggningen är klar efter ${formatBrewTime($elapsedSeconds)}.`
    : $status === 'stopped' ? 'Timern är stoppad. Du kan ändra receptet eller börja om.' : '';

  async function start() {
    if (!session.start(plan, dose)) return;
    showSchedule = false;
    await tick();
    activeHeading?.focus({ preventScroll: true });
    activeHeading?.closest('.active-brew')?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  async function finishBrew(action) {
    action();
    await tick();
    resultHeading?.focus({ preventScroll: true });
    resultHeading?.closest('.session-result')?.scrollIntoView({ block: 'start', behavior: 'auto' });
  }

  async function reset() {
    session.reset();
    await tick();
    startButton?.focus({ preventScroll: true });
    startButton?.scrollIntoView({ block: 'center', behavior: 'auto' });
  }
</script>

<section class="recipe-workbench" class:is-brewing={$locked} aria-labelledby="workbench-title">
  <header class="workbench-heading">
    <div><p class="section-kicker">Ditt recept</p><h2 id="workbench-title">Anpassa och brygg.</h2></div>
    <button type="button" class="button secondary print-recipe" disabled={!ready || !validDose} on:click={() => window.print()}>Skriv ut</button>
  </header>

  <div class="setup-grid">
    <div class="dose-panel accent-panel">
      <fieldset disabled={!ready || $locked}>
        <legend class="sr-only">Anpassa kaffemängden</legend>
        <label for="recipe-dose">Kaffe (gram)</label>
        <div class="dose-input-row">
          <input id="recipe-dose" type="number" inputmode="decimal" min={plan.minDoseGrams} max={plan.maxDoseGrams} step="0.1" bind:value={dose}
            aria-invalid={!validDose ? 'true' : undefined} aria-describedby={!validDose ? 'recipe-dose-error' : 'recipe-dose-hint'} />
          <span>g kaffe</span>
        </div>
        <p id="recipe-dose-hint" class="hint">{plan.minDoseGrams}–{plan.maxDoseGrams} g för det här receptet och en V60 02.</p>
        <div class="dose-presets" role="group" aria-label="Välj kaffemängd">
          {#each [15, 20, 30, 40].filter(value => validRecipeDose(plan, value)) as preset}
            <button type="button" class:selected={dose === preset} aria-pressed={dose === preset} on:click={() => dose = preset}>{preset} g</button>
          {/each}
        </div>
      </fieldset>
      {#if !validDose}
        <p id="recipe-dose-error" class="validation-error" role="alert">Ange {plan.minDoseGrams}–{plan.maxDoseGrams} g kaffe med högst en decimal. Receptets gräns är {plan.maxWaterGrams} g vatten.</p>
      {/if}
      {#if displayed}
        <dl class="brew-metrics">
          <div class="print-dose"><dt>Kaffe</dt><dd>{formatGrams(displayed.coffeeGrams)} g</dd></div>
          <div><dt>Bryggvatten</dt><dd><span data-recipe-water>{formatGrams(displayed.waterGrams)}</span> g</dd></div>
          <div><dt>Förhållande</dt><dd>1:{formatGrams(plan.ratio)}</dd></div>
          <div><dt>Temperatur</dt><dd>{plan.temperatureC}°C</dd></div>
          <div><dt>Tidsmål vid {plan.coffeeGrams} g</dt><dd>{formatBrewTime(plan.targetTime.minSeconds)}–{formatBrewTime(plan.targetTime.maxSeconds)}</dd></div>
        </dl>
      {/if}
      <p class="grind-note"><strong>Malning:</strong> {plan.grind}</p>
      <p class="hint">Vattenmängderna skalas med dosen. Tider och temperatur behålls som riktmärken; en större bryggning kan ta längre tid.</p>
      <div class="brew-actions">
        <button type="button" class="button primary" data-start-recipe bind:this={startButton} disabled={!ready || !validDose || $locked} on:click={start}>
          {$status === 'completed' || $status === 'stopped' ? 'Brygg igen' : 'Starta bryggning'}
        </button>
      </div>
      {#if $locked}<p class="hint session-hint">Dosen är låst medan du brygger. Stoppa timern för att ändra receptet.</p>{/if}
      <noscript><p class="hint">Följ standardreceptet nedan. Aktivera JavaScript för att ändra dos och använda timern.</p></noscript>
    </div>

    <div class="preparation paper-surface">
      <h3>Innan du börjar</h3>
      <ul class="equipment-list">{#each plan.equipment as item}<li>{item}</li>{/each}</ul>
      <ol class="preparation-list">{#each plan.preparation as instruction}<li>{instruction}</li>{/each}</ol>
      <p class="hint"><strong>Vid grunddosen {plan.coffeeGrams} g:</strong> {plan.yieldNote}</p>
      <p class="taste-note"><strong>Sikta på:</strong> {plan.taste}</p>
    </div>
  </div>

  <p class="sr-only" role="status" aria-atomic="true">{announcement}</p>
  {#if $locked && activeStep}
    <section class="active-brew paper-surface" aria-labelledby="active-step-heading">
      <div class="active-brew-top"><p class="section-kicker">Bryggläge · Steg {$currentStep + 1} av {$activeBrew.steps.length}</p>
        <time class="brew-clock" role="timer" aria-live="off" aria-label="Förfluten bryggtid">{formatBrewTime($elapsedSeconds)}</time>
      </div>
      <h3 id="active-step-heading" bind:this={activeHeading} tabindex="-1">{activeStep.title}</h3>
      {#if activeStep.kind === 'pour'}
        <p class="active-pour">Häll <strong>{formatGrams(activeStep.waterGrams)} g</strong></p>
        <p class="scale-target accent-panel">Vågen ska visa <strong data-active-target>{formatGrams(activeStep.targetGrams)} g</strong></p>
      {:else}<p class="active-pour">Låt kaffet rinna färdigt.</p>{/if}
      <p class="active-instruction">{activeStep.instruction}</p>
      {#if nextStep}
        <p class="next-step">Nästa steg vid {formatBrewTime(nextStep.atSeconds)}: {nextStep.title.toLowerCase()}{nextStep.kind === 'pour' ? `, ${formatGrams(nextStep.waterGrams)} g vatten` : ''}.</p>
      {:else}
        <p class="next-step">Timern fortsätter tills du bekräftar att kaffet har runnit igenom.</p>
        <button type="button" class="button primary" data-complete-recipe on:click={() => finishBrew(session.complete)}>Bryggningen är klar</button>
      {/if}
      <button type="button" class="button secondary" data-stop-recipe on:click={() => finishBrew(session.stop)}>Stoppa timer</button>
      <button type="button" class="schedule-toggle" aria-expanded={showSchedule} aria-controls="recipe-steps" on:click={() => showSchedule = !showSchedule}>{showSchedule ? 'Dölj hela schemat' : 'Visa hela schemat'}</button>
    </section>
  {/if}
  {#if $status === 'completed' || $status === 'stopped'}
    <div class="session-result paper-surface">
      <h3 bind:this={resultHeading} tabindex="-1">{$status === 'completed' ? 'Dags att smaka.' : 'Timern är stoppad.'}</h3>
      <p>{$status === 'completed' ? 'Bryggningen tog' : 'Förfluten tid:'} <strong>{formatBrewTime($elapsedSeconds)}</strong>. {$status === 'completed' ? 'Låt koppen svalna lite och välj sedan en justering om det behövs.' : 'Starta igen för en ny bryggning från början.'}</p>
      <button type="button" class="schedule-toggle" data-reset-recipe on:click={reset}>Nollställ timer</button>
    </div>
  {/if}

  <section class="full-schedule" class:collapsed={$locked && !showSchedule} aria-labelledby="schedule-title">
    <h3 id="schedule-title">Hällningsschema</h3>
    <p class="hint">Vågens totalvikt är kumulativ. Nollställ inte vågen mellan hällningarna.</p>
    {#if displayed}
      <ol id="recipe-steps" class="recipe-steps">
        {#each displayed.steps as step, index}
          <li class="paper-surface" class:current={$locked && index === $currentStep} aria-current={$locked && index === $currentStep ? 'step' : undefined}>
            <div class="step-row"><div class="step-time">{formatBrewTime(step.atSeconds)}</div>
            <div class="step-content"><h4>{step.title}</h4>
              {#if step.kind === 'pour'}<p class="step-amount">Häll <strong data-pour>{formatGrams(step.waterGrams)} g</strong> · vågen ska visa <strong data-target>{formatGrams(step.targetGrams)} g</strong></p>{/if}
              <p>{step.instruction}</p>
            </div></div>
          </li>
        {/each}
      </ol>
    {:else}<p>Fyll i en giltig dos för att se mängder och hällningar.</p>{/if}
  </section>
</section>

<style>
  .recipe-workbench { display: grid; gap: 2rem; }
  .workbench-heading { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
  h2 { font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 900; line-height: 1.2; margin-top: .5rem; }
  h3 { font-size: 1.4rem; font-weight: 900; line-height: 1.3; }
  .setup-grid { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 1.5rem; }
  .dose-panel, .preparation, .active-brew, .session-result { min-width: 0; padding: clamp(1rem, 3vw, 2rem); border: 3px solid #111; border-radius: 1rem; box-shadow: 5px 5px 0 #111; }
  .dose-panel { background: #ffe680; }
  fieldset { min-width: 0; border: 0; margin: 0; padding: 0; }
  label { display: block; font-size: 1.1rem; font-weight: 800; margin-bottom: .5rem; }
  .dose-input-row { display: flex; align-items: center; gap: .75rem; }
  input { width: 145px; min-width: 0; border: 3px solid #111; background: white; color: #111; font-size: 2rem; font-weight: 900; padding: .4rem .75rem; }
  .hint { font-size: .875rem; line-height: 1.65; margin-top: .75rem; }
  .dose-presets { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; margin-top: 1rem; }
  .dose-presets button { min-height: 44px; padding: .3rem; border: 2px solid #111; background: white; color: #111; font-weight: 800; }
  .dose-presets button.selected { background: #111; color: white; }
  .brew-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin: 1.5rem 0; }
  dt { font-size: .75rem; text-transform: uppercase; font-weight: 800; letter-spacing: .05em; }
  dd { font-size: clamp(1.25rem, 3vw, 1.75rem); font-weight: 900; }
  .grind-note { line-height: 1.7; }
  .button { min-height: 48px; padding: .75rem 1rem; border: 2px solid #111; font-weight: 800; line-height: 1.3; }
  .primary { background: #111; color: white; box-shadow: 3px 3px 0 #b65a12; }
  .secondary { background: var(--surface); color: hsl(var(--foreground)); border-color: currentColor; }
  button:disabled { opacity: .55; }
  .brew-actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; }
  .equipment-list { list-style: disc; padding-left: 1.25rem; margin: 1rem 0 1.5rem; line-height: 1.7; }
  .preparation-list { list-style: decimal; padding-left: 1.25rem; line-height: 1.7; }
  li + li { margin-top: .5rem; }
  .preparation-list li::marker { font-weight: 800; }
  .taste-note { border-top: 2px dashed currentColor; padding-top: 1rem; margin-top: 1.25rem; line-height: 1.7; }
  .active-brew, .session-result { scroll-margin-top: calc(var(--header-height) + 1rem); }
  .active-brew-top { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; }
  .brew-clock { font-variant-numeric: tabular-nums; font-size: 2rem; font-weight: 900; }
  #active-step-heading { scroll-margin-top: calc(var(--header-height) + 1rem); font-size: clamp(1.75rem, 4vw, 2.75rem); }
  .active-pour { font-size: 1.5rem; margin-top: 1rem; }
  .active-pour strong { font-size: 2rem; }
  .scale-target { display: inline-block; background: #ffe680; border: 2px solid #111; padding: .75rem 1rem; margin-top: 1rem; font-size: 1.25rem; }
  .active-instruction, .next-step { margin: 1.25rem 0; font-size: 1.05rem; line-height: 1.8; }
  .next-step { border-top: 2px dashed currentColor; padding-top: 1rem; }
  .schedule-toggle { display: block; min-height: 44px; text-decoration: underline; text-underline-offset: .2em; margin-top: .75rem; }
  .session-result p { margin-top: .75rem; line-height: 1.8; }
  .collapsed { display: none; }
  .recipe-steps { display: grid; gap: 1rem; list-style: decimal; padding-left: 1.5rem; margin-top: 1.5rem; }
  .recipe-steps li::marker { font-weight: 900; }
  .print-dose { display: none; }
  .recipe-steps li { padding: 1.25rem; border: 3px solid #111; margin: 0; }
  .step-row { display: grid; grid-template-columns: 70px minmax(0, 1fr); gap: 1rem; }
  .recipe-steps li.current { border-color: #b65a12; }
  .step-time { font-size: 1.15rem; font-weight: 900; font-variant-numeric: tabular-nums; }
  h4 { font-weight: 900; font-size: 1.15rem; }
  .step-amount { margin: .4rem 0; }
  .step-content > p { line-height: 1.7; }
  @media (max-width: 700px) {
    .setup-grid { grid-template-columns: minmax(0, 1fr); }
    .step-row { grid-template-columns: minmax(0, 1fr); gap: .5rem; }
  }
  @media print {
    .recipe-workbench { gap: 1rem; font-size: 10pt; }
    .print-recipe, fieldset, .brew-actions, .active-brew, .session-result, .session-hint, .schedule-toggle, noscript { display: none !important; }
    .full-schedule.collapsed { display: block !important; }
    .full-schedule { break-before: page; }
    .setup-grid { grid-template-columns: 1fr 1fr; gap: 1rem; }
    .dose-panel, .preparation, .recipe-steps li { background: white; color: black; border: 1px solid #333; box-shadow: none; break-inside: avoid; padding: .75rem; }
    .step-row { grid-template-columns: 55px 1fr; }
    .workbench-heading h2 { font-size: 1.2rem; }
    h3 { font-size: 12pt; }
    h4 { font-size: 11pt; }
    .step-time { font-size: 10pt; }
    .brew-metrics { margin: 0 0 .75rem; gap: .75rem; }
    dd { font-size: 16pt; }
    .equipment-list { margin: .5rem 0 .75rem; line-height: 1.4; }
    .preparation-list, .grind-note, .taste-note, .step-content > p { line-height: 1.4; }
    .taste-note { padding-top: .5rem; margin-top: .5rem; }
    .hint { font-size: 9pt; line-height: 1.4; margin-top: .5rem; }
    .recipe-steps { display: block; margin-top: .75rem; }
    .recipe-steps li { margin-bottom: .5rem; }
    .recipe-steps li.current { border-color: #333; }
    .print-dose { display: block; }
  }
</style>
