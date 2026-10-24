<script>
  import { RATIOS } from '../utils/recipe.js';
  import { getBrewingStore } from '../utils/context.js';
  const { waterRatio } = getBrewingStore();


  export let showRecommendation = false;
  export let recommendedRatio = "";
  export let recommendationRemoved = false;
  export let headline = "Bryggförhållande (kaffe:vatten)";
  export let errorId = undefined;

  function changeToRecommendedRatio() {
    switch (recommendedRatio) {
      case "1:16":
        $waterRatio = 16;
        break;
      case "1:15":
        $waterRatio = 15;
        break;
      case "1:14":
        $waterRatio = 14;
        break;
      case "1:13":
        $waterRatio = 13;
        break;
    }
  }

  function removeRecommendation() {
    recommendationRemoved = true;
  }
</script>


<div class="calculator-item mt-8">
  <label class="select-headline" for="waterToCoffeeRatio">{headline}</label>
  <select id="waterToCoffeeRatio" name="waterToCoffeeRatio" bind:value={$waterRatio}  aria-describedby={errorId} aria-invalid={errorId ? true : undefined}>

      {#each RATIOS as ratio}
        <option value={ratio}>1:{ratio}</option>
      {/each}
      </select>

  {#if showRecommendation}
    <div class="recommendation-panel">
      <p class="text-xl mb-4">Föreslaget bryggförhållande: {recommendedRatio}</p>
      <div class="flex flex-wrap gap-3">
        <button type="button" class="recommend-button" on:click={changeToRecommendedRatio}>
          Använd förslaget
        </button>
        <button type="button" class="close-button" on:click={removeRecommendation}>
          Stäng
        </button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .calculator-item {
    select {
      @apply w-full p-4 border-4 border-black bg-white;
      box-shadow: 2px 2px 0px 0px #000000;

      &:focus {
        @apply outline-none -translate-x-1 -translate-y-1;
      }
    }
  }

  .recommendation-panel {
    @apply bg-[#FFE566] border-4 border-black p-4;
    box-shadow: 4px 4px 0px 0px #000000;
  }

  .recommend-button {
    @apply bg-black text-white px-4 py-2 border-4 border-black font-bold hover:-translate-y-1 transition-transform;
  }

  .close-button {
    @apply bg-white px-4 py-2 border-4 border-black font-bold hover:-translate-y-1 transition-transform;
  }

</style>
