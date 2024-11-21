<script>
  import { coffeeWeight } from '../utils/brewingStore';

  function incrementCoffeeWeight(increment) {
    const newValue = $coffeeWeight + increment;
    if (newValue <= 100) {
      $coffeeWeight = newValue;
    }
  }

  function decrementCoffeeWeight(decrement) {
    const newValue = $coffeeWeight - decrement;
    if (newValue >= 1) {
      $coffeeWeight = newValue;
    }
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
  />

  <div class="grid gap-4 py-4 grid-flow-col grid-cols-[2fr_1fr_1fr_2fr]">
    <button class="text-2xl" on:click={() => decrementCoffeeWeight(1)}>−</button>
    <button class="text-2xl" on:click={() => decrementCoffeeWeight(10)}>−10g</button>
    <button class="text-2xl" on:click={() => incrementCoffeeWeight(10)}>+10g</button>
    <button class="text-2xl" on:click={() => incrementCoffeeWeight(1)}>+</button>
  </div>
</div>

<style lang="scss">
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
