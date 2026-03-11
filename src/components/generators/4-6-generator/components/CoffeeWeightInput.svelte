<script>
  import { onMount } from 'svelte';
  import { coffeeWeight } from '../utils/brewingStore';

  const id = crypto.randomUUID();

  let liveMessage = '';
  let liveTimeout = null;
  let lastAnnounced = 0;

  onMount(() => {
    lastAnnounced = $coffeeWeight;
  });

  function changeCoffeeWeight(delta) {
    const oldValue = $coffeeWeight;
    const rawNew = oldValue + delta;
    const newValue = Math.min(100, Math.max(1, rawNew));
    if (newValue !== oldValue) {
      $coffeeWeight = newValue;
      const change = Math.abs(newValue - oldValue);
      const verb = delta > 0 ? 'Ökade' : 'Minskade';
      liveMessage = `${verb} med ${change} g till ${newValue} g.`;
      lastAnnounced = newValue;
      clearTimeout(liveTimeout);
      liveTimeout = setTimeout(() => (liveMessage = ''), 2500);
    }
  }

  function onInputChange(e) {
    const parsed = Number(e.target.value);
    if (isNaN(parsed)) return;
    const clamped = Math.min(100, Math.max(1, parsed));
    if (clamped !== lastAnnounced) {
      const diff = clamped - lastAnnounced;
      const change = Math.abs(diff);
      const verb = diff > 0 ? 'Ökade' : 'Minskade';
      liveMessage = `${verb} med ${change} g till ${clamped} g.`;
      lastAnnounced = clamped;
      clearTimeout(liveTimeout);
      liveTimeout = setTimeout(() => (liveMessage = ''), 2500);
    }
    $coffeeWeight = clamped;
  }
</script>

<div class="calculator-item">
  <label for="coffeeWeightGrams">
    Kaffevikt (gram)
  </label>
  <input
    id="coffeeWeightGrams"
    name="coffeWeightGrams"
    type="number"
    bind:value={$coffeeWeight}
    min="1"
    max="100"
    on:input={onInputChange}
    aria-describedby={`${id}-coffee-weight-live`}
  />

  <div class="grid gap-4 py-4 grid-flow-col grid-cols-[2fr_1fr_1fr_2fr]">
    <button
      class="text-2xl touch-manipulation"
      on:click={() => changeCoffeeWeight(-1)}
      aria-label="Minska kaffevikten med 1 gram"
    >−</button>
    <button
      class="text-2xl touch-manipulation"
      on:click={() => changeCoffeeWeight(-10)}
      aria-label="Minska kaffevikten med 10 gram"
    >−10g</button>
    <button
      class="text-2xl touch-manipulation"
      on:click={() => changeCoffeeWeight(10)}
      aria-label="Öka kaffevikten med 10 gram"
    >+10g</button>
    <button
      class="text-2xl touch-manipulation"
      on:click={() => changeCoffeeWeight(1)}
      aria-label="Öka kaffevikten med 1 gram"
    >+</button>
  </div>

  <div id={`${id}-coffee-weight-live`} class="sr-only" role="status" aria-live="polite" aria-atomic="true">
    {liveMessage}
  </div>
</div>

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .calculator-item {
    @apply mb-6;

    label {
      @apply block text-xl font-bold mb-2;
    }

    input {
      @apply w-full p-4 border-4 border-black bg-white;
      box-shadow: 4px 4px 0px 0px #000;
      &:focus {
        @apply outline-none -translate-x-1 -translate-y-1;
      }
    }
  }

  button {
    @apply px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }
</style>
