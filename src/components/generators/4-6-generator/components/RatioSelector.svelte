<script>
  import { waterRatio } from '../utils/brewingStore';


  export let showRecommendation = false;
  export let recommendedRatio = "";
  export let recommendationRemoved = false;
  export let headline = "Vatten/Kaffe-ratio";

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


<div class="calculator-item">
  <label class="select-headline" for="ratio-select">{headline}</label>
  <select id="waterToCoffeeRatio" name="waterToCoffeeRatio" bind:value={$waterRatio} defaultValue={15}>
    {#if $waterRatio}
      {#each Array(7).fill().map((_, i) => i + 12) as ratio}
        <option value={ratio}>1:{ratio}</option>
      {/each}
    {/if}
  </select>

  {#if showRecommendation}
    <div class="recommendation-panel">
      <p class="text-xl mb-4">Rekommenderad ratio: {recommendedRatio}</p>
      <div class="flex gap-4">
        <button class="recommend-button" on:click={changeToRecommendedRatio}>
          Använd rekommenderad ratio
        </button>
        <button class="close-button" on:click={removeRecommendation}>
          Stäng
        </button>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .calculator-item {
    select {
      @apply w-full p-4 border-4 border-black bg-white;
      box-shadow: 2px 2px 0px 0px #000000;
      transform-origin: top;
      animation: selectAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

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

  @keyframes selectAppear {
    0% {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
</style>
