<script>
  import { onMount, setContext } from 'svelte';
  import { BREWING_CONTEXT } from './utils/context.js';
  import { createBrewingStore } from './utils/brewingStore.js';
  import { calculateGrindSize, calculateRecommendedRatio } from './utils/calculations.js';
  import CoffeeWeightInput from './components/CoffeeWeightInput.svelte';
  import RatioSelector from './components/RatioSelector.svelte';
  import RoastSelector from './components/RoastSelector.svelte';
  import RecipeSummary from './components/RecipeSummary.svelte';
  import BrewingInstructions from './components/BrewingInstructions.svelte';
  import BrewingControls from './components/BrewingControls.svelte';
  import BrewingTable from './components/BrewingTable.svelte';
  import PouringTimeline from './components/PouringTimeline.svelte';
  import StrengthSelector from './components/StrengthSelector.svelte';
  import TasteSelector from './components/TasteSelector.svelte';
  import PrintButton from './components/PrintButton.svelte';
  import ShareButton from './components/ShareButton.svelte';

  const store = createBrewingStore();
  setContext(BREWING_CONTEXT, store);
  const { displayRecipe, waterWeight, brewingTemperature, brewingSchedule, validationError, isLocked, loadNotice } = store;
  let recommendationRemoved = false;
  let lastRecommendedRatio = '';
  onMount(() => store.connectBrowser(window));

  $: recommendedGrindSize = calculateGrindSize($displayRecipe.weight || 20);
  $: recommendedRatio = calculateRecommendedRatio($displayRecipe.weight);
  $: if (recommendedRatio !== lastRecommendedRatio) {
    recommendationRemoved = false;
    lastRecommendedRatio = recommendedRatio;
  }
  $: showRecommendation = !$validationError && recommendedRatio !== `1:${$displayRecipe.ratio}` && !recommendationRemoved;
</script>

<section class="four-six-generator" aria-labelledby="generator-title">
  <div class="generator-shell">
    <header class="space-y-4">
      <p class="section-kicker">Bryggverktyg</p>
      <h1 id="generator-title" class="section-title">Tetsu Kasuyas 4:6-metod</h1>
      <p class="section-copy">Anpassa receptet och följ hällningarna med timern. Stoppa timern om du vill ändra inställningarna.</p>
    </header>
    {#if $loadNotice}<p class="notice" role="status">{$loadNotice}</p>{/if}
    <RecipeSummary coffeeWeight={$displayRecipe.weight} waterWeight={$waterWeight}
      waterRatio={$displayRecipe.ratio} temperature={$brewingTemperature}
      strength={$displayRecipe.strength} taste={$displayRecipe.taste} brewingSchedule={$brewingSchedule} />
    <div class="generator-grid">
      <div class="generator-header accent-panel">
        {#if $validationError}
          <p class="validation-error" role="alert" id="{$validationError.field}-error">{$validationError.message}</p>
        {/if}
        <fieldset disabled={$isLocked} class="tools-container">
          <legend class="sr-only">Bryggningsinställningar</legend>
          <CoffeeWeightInput errorId={$validationError?.field === 'weight' ? 'weight-error' : undefined} />
          <RoastSelector />
          <RatioSelector bind:recommendationRemoved {showRecommendation} {recommendedRatio}
            errorId={$validationError?.field === 'ratio' ? 'ratio-error' : undefined} />
          <StrengthSelector />
          <TasteSelector />
        </fieldset>
        {#if $isLocked}<p class="mt-4 font-semibold">Inställningarna är låsta under bryggningen.</p>{/if}
        <div class="button-group grid grid-cols-1 gap-3 mt-6 sm:grid-cols-2">
          <PrintButton />
          <ShareButton />
        </div>
        <BrewingControls />
      </div>
      <BrewingInstructions coffeeWeight={$displayRecipe.weight} waterWeight={$waterWeight}
        temperature={$brewingTemperature} {recommendedGrindSize} />
    </div>
    <BrewingTable />
  </div>
  <PouringTimeline />
</section>

<style lang="scss">
  @reference '../../../styles/styles.css';
  .four-six-generator { @apply mx-auto px-4 pb-48 pt-12 md:px-6; }
  .generator-shell { @apply mx-auto flex w-full max-w-[1300px] min-w-0 flex-col gap-8; }
  .generator-grid { @apply grid min-w-0 gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:items-start; }
  .generator-header { @apply min-w-0 rounded-[1.75rem] bg-[#FFE566] border-4 border-black p-4 md:p-8; box-shadow: 6px 6px 0 #000; }
  fieldset { min-width: 0; border: 0; padding: 0; margin: 0; }
  .notice { @apply border-2 border-current p-4; }
</style>
