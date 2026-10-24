<script>
  import { getBrewingStore } from '../utils/context.js';
  import { DOSE_LIMITS } from '../utils/recipe.js';
  const { coffeeWeight } = getBrewingStore();
  export let errorId = undefined;
  function changeCoffeeWeight(delta) {
    const current = Number.isFinite($coffeeWeight) ? $coffeeWeight : 20;
    $coffeeWeight = Math.round(Math.min(DOSE_LIMITS.max, Math.max(DOSE_LIMITS.min, current + delta)) * 10) / 10;
  }
</script>

<div class="calculator-item">
  <label for="coffeeWeightGrams">Kaffevikt (gram)</label>
  <input id="coffeeWeightGrams" name="coffeeWeightGrams" type="number" inputmode="decimal"
    bind:value={$coffeeWeight} min={DOSE_LIMITS.min} max={DOSE_LIMITS.max} step={DOSE_LIMITS.step}
    aria-describedby={errorId ?? 'coffee-weight-hint'} aria-invalid={errorId ? 'true' : undefined} />
  <p id="coffee-weight-hint" class="mt-2 text-sm">6–76 g, i steg om 0,1 g.</p>
  <div class="dose-buttons">
    {#each [-10, -1, 1, 10] as delta}
      <button type="button" on:click={() => changeCoffeeWeight(delta)}
        aria-label={`${delta < 0 ? 'Minska' : 'Öka'} kaffevikten med ${Math.abs(delta)} gram`}>
        {delta > 0 ? '+' : '−'}{Math.abs(delta)} g
      </button>
    {/each}
  </div>
</div>

<style lang="scss">
  @reference '../../../../styles/styles.css';
  label { @apply block text-xl font-bold mb-2; }
  input { @apply w-full min-w-0 p-4 border-4 border-black bg-white text-black; box-shadow: 4px 4px 0 #000; }
  .dose-buttons { @apply grid grid-cols-4 gap-2 py-4; }
  button { @apply min-w-0 border-2 border-black bg-main py-3 text-sm font-bold text-black; box-shadow: 2px 2px 0 #000; }
</style>
