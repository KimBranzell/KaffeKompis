<script>
  let coffeeToWaterRatio = 16;
  let water = 320;
  let coffee = 20;
  let lastEdited = 'coffee';
  let error = '';
  let errorField = '';
  const format = new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2 });
  const inputValue = value => Number.isFinite(value) ? Number(value.toFixed(2)) : '';

  function recalculate() {
    error = '';
    errorField = '';
    const amount = lastEdited === 'coffee' ? coffee : water;
    if (!Number.isFinite(coffeeToWaterRatio) || coffeeToWaterRatio < 1 || coffeeToWaterRatio > 30
      || Math.abs(coffeeToWaterRatio * 10 - Math.round(coffeeToWaterRatio * 10)) > 1e-8) {
      error = 'Ange ett bryggförhållande från 1:1 till 1:30 med högst en decimal.';
      errorField = 'ratio';
    } else if (!Number.isFinite(amount) || amount <= 0) {
      error = `Ange en ${lastEdited === 'coffee' ? 'kaffevikt' : 'vattenvikt'} som är större än noll.`;
      errorField = lastEdited;
    }
    const result = lastEdited === 'coffee' ? coffee * coffeeToWaterRatio : water / coffeeToWaterRatio;
    if (!error && (!Number.isFinite(result) || result <= 0)) {
      error = 'Mängden är för stor eller för liten för att räknas ut. Ange en annan vikt.';
      errorField = lastEdited;
    }
    if (lastEdited === 'coffee') water = error ? undefined : result;
    else coffee = error ? undefined : result;
  }
  function editAmount(field, event) {
    lastEdited = field;
    if (field === 'coffee') coffee = event.currentTarget.valueAsNumber;
    else water = event.currentTarget.valueAsNumber;
    recalculate();
  }
  function editRatio(event) {
    coffeeToWaterRatio = event.currentTarget.valueAsNumber;
    recalculate();
  }
</script>

<section class="mx-auto w-full max-w-3xl space-y-8 px-4 py-12" aria-labelledby="calculator-title">
  <header class="space-y-4">
    <p class="section-kicker">Bryggverktyg</p>
    <h1 id="calculator-title" class="section-title">Kaffe till vatten-kalkylator</h1>
    <p class="section-copy">Ange hur mycket kaffe eller vatten du vill använda. När du ändrar bryggförhållandet behålls mängden du senast skrev in.</p>
  </header>
  <div class="paper-surface calculator-panel">
    <div class="amounts">
      <div>
        <label for="coffee">Kaffe (gram)</label>
        <input id="coffee" type="number" inputmode="decimal" min="0.01" step="any" value={inputValue(coffee)} on:input={event => editAmount('coffee', event)}
          aria-invalid={errorField === 'coffee' ? 'true' : undefined} aria-describedby={errorField === 'coffee' ? 'calculator-error' : undefined} />
      </div>
      <div>
        <label for="water">Vatten (gram)</label>
        <input id="water" type="number" inputmode="decimal" min="0.01" step="any" value={inputValue(water)} on:input={event => editAmount('water', event)}
          aria-invalid={errorField === 'water' ? 'true' : undefined} aria-describedby={errorField === 'water' ? 'calculator-error' : undefined} />
      </div>
    </div>
    <div>
      <label for="ratio">Bryggförhållande (1:x)</label>
      <input id="ratio" type="number" inputmode="decimal" min="1" max="30" step="0.1" value={coffeeToWaterRatio} on:input={editRatio}
        aria-invalid={errorField === 'ratio' ? 'true' : undefined} aria-describedby={errorField === 'ratio' ? 'calculator-error' : 'ratio-hint'} />
      <p id="ratio-hint" class="mt-2 text-sm">1:16 betyder 16 gram vatten per gram kaffe.</p>
    </div>
    <div>
      <label for="strength">Justera mängden vatten per gram kaffe</label>
      <input id="strength" type="range" min="1" max="30" step="0.1" value={Number.isFinite(coffeeToWaterRatio) ? coffeeToWaterRatio : 16} on:input={editRatio}
        aria-valuetext={`1 till ${coffeeToWaterRatio}`} />
      <div class="range-labels"><span>Mer koncentrerat</span><span>Mer utspätt</span></div>
    </div>
    {#if error}
      <p id="calculator-error" class="validation-error" role="alert">{error}</p>
    {:else}
      <output class="result accent-panel" aria-live="polite" aria-atomic="true">
        <strong>{format.format(coffee)} g kaffe + {format.format(water)} g vatten</strong>
        <span>Bryggförhållande 1:{format.format(coffeeToWaterRatio)}</span>
      </output>
    {/if}
  </div>
</section>

<style>
  .calculator-panel { display: grid; gap: 1.75rem; padding: clamp(1rem, 4vw, 2rem); border: 3px solid #111; box-shadow: 6px 6px 0 #111; }
  .amounts { display: grid; gap: 1.5rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
  label { display: block; margin-bottom: .5rem; font-weight: 800; }
  input[type=number] { width: 100%; min-width: 0; padding: .8rem; border: 2px solid currentColor; background: var(--surface); color: inherit; }
  input[type=range] { width: 100%; accent-color: #c65408; min-height: 44px; }
  .range-labels { display: flex; gap: 1rem; justify-content: space-between; font-size: .875rem; }
  .result { display: grid; gap: .5rem; border: 2px solid #111; background: #ffe680; padding: 1rem; overflow-wrap: anywhere; }
</style>
