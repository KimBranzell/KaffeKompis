<script>
  import { onMount } from "svelte";

  import {
    coffeeWeight,
    roastGrade,
    brewingTemperature,
    brewingSchedule,
    currentStep,
    isBrewing,
    totalTime,
    waterWeight,
    waterRatio,
    strength,
    taste,
  } from "./utils/brewingStore";

  import {
    calculateGrindSize,
    calculateRecommendedRatio,
  } from './utils/calculations';

  import CoffeeWeightInput from "./components/CoffeeWeightInput.svelte";
  import RatioSelector from "./components/RatioSelector.svelte";
  import RoastSelector from "./components/RoastSelector.svelte";
  import RecipeSummary from "./components/RecipeSummary.svelte";
  import BrewingInstructions from "./components/BrewingInstructions.svelte";
  import BrewingControls from "./components/BrewingControls.svelte";
  import BrewingTable from "./components/BrewingTable.svelte";
  import PouringTimeline from "./components/PouringTimeline.svelte";
  import StrengthSelector from "./components/StrengthSelector.svelte";
  import TasteSelector from "./components/TasteSelector.svelte";
  import PrintButton from "./components/PrintButton.svelte";
  import ShareButton from "./components/ShareButton.svelte";

  let inputValidationError = "";
  let carouselContainer;
  let initialLoadComplete = false;
  let recommendationRemoved = false;
  let lastRecommendedRatio = "";

  const STORAGE_KEYS = {
    coffeeWeight: "46method.coffeeWeight",
    waterRatio: "46method.waterRatio",
    roastGrade: "46method.roastGrade",
    strength: "46method.strength",
    taste: "46method.taste",
  };

  $: if (typeof window !== "undefined" && initialLoadComplete) {
    localStorage.setItem(STORAGE_KEYS.coffeeWeight, String($coffeeWeight));
    localStorage.setItem(STORAGE_KEYS.waterRatio, String($waterRatio));
    localStorage.setItem(STORAGE_KEYS.roastGrade, $roastGrade);
    localStorage.setItem(STORAGE_KEYS.strength, $strength);
    localStorage.setItem(STORAGE_KEYS.taste, $taste);
  }

  onMount(() => {
    initialLoadComplete = true;
  });

  $: recommendedGrindSize = calculateGrindSize($coffeeWeight);
  $: recommendedRatio = calculateRecommendedRatio($coffeeWeight);
  $: if (recommendedRatio !== lastRecommendedRatio) {
    recommendationRemoved = false;
    lastRecommendedRatio = recommendedRatio;
  }
  $: showRatioRecommendation = recommendedRatio !== `1:${$waterRatio}` && !recommendationRemoved;
  $: generatorDescription = `${$brewingSchedule.length} pours, 1:${$waterRatio}, ${$strength.toLowerCase()} profil och ${$taste.toLowerCase()} start.`;


  $: {
    inputValidationError = "";

    if (isNaN($coffeeWeight) || $coffeeWeight < 6) {
      inputValidationError = "Vi rekommenderar att du använder minst 6 gram kaffe för det här receptet.";
    }
    else if ($coffeeWeight > 76) {
      inputValidationError = "Vi rekommenderar att du använder max 76 gram kaffe för det här receptet.";
    }
    else if ($waterRatio <= 0) {
      inputValidationError = "Vänligen ange ett giltigt värde för vatten till kaffe-ratio.";
    }
  }
</script>

<div
  aria-live="assertive"
  class="sr-only"
>
  {#if $isBrewing}
    Steg {$currentStep + 1} av {$brewingSchedule.length}: hall {$brewingSchedule[$currentStep]?.pour?.toFixed(0) ?? 0} gram vatten
  {/if}
</div>

<div class="four-six-generator" role="main" aria-label="Kaffebryggningssimulator">
  <div class="generator-shell" role="region" aria-label="Bryggningsinställningar">
    <RecipeSummary
      coffeeWeight={$coffeeWeight}
      waterWeight={$waterWeight}
      waterRatio={$waterRatio}
      temperature={$brewingTemperature}
      strength={$strength}
      taste={$taste}
      brewingSchedule={$brewingSchedule}
    />

    <p class="generator-description">{generatorDescription}</p>

    <div class="generator-grid">
    <div class="generator-header">
      <div class="grid h-full gap-6">
        <div class="tools-container" role="group" aria-label="Bryggningsparametrar">
          {#if inputValidationError}
            <div class="validation-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
              <p>{inputValidationError}</p>
            </div>
          {/if}
          <CoffeeWeightInput />
          <RoastSelector />
          <RatioSelector bind:recommendationRemoved showRecommendation={showRatioRecommendation} {recommendedRatio} />
          <StrengthSelector />
          <TasteSelector />
          <div class="button-group grid grid-cols-1 gap-3 mt-6 sm:grid-cols-2">
            <PrintButton />
            <ShareButton strength={$strength} taste={$taste} />
          </div>
        </div>
        <BrewingControls />
      </div>
    </div>

    <BrewingInstructions
      coffeeWeight={$coffeeWeight}
      waterWeight={$waterWeight}
      temperature={$brewingTemperature}
      {recommendedGrindSize}
    />
    </div>
  </div>

  <BrewingTable />

  <PouringTimeline
    bind:carouselContainer
    brewingSchedule={$brewingSchedule}
    currentStep={$currentStep}
    totalTime={$totalTime}
    aria-live="polite"
    role="timer"
    aria-label="Bryggningstidslinje"
  />
</div>



<style lang="scss">
  @reference "../../../styles/styles.css";

  .four-six-generator {
    @apply mx-auto px-4 pb-28 pt-24 md:px-6 md:pb-36 md:pt-32;
  }

  .generator-shell {
    @apply mx-auto flex w-full max-w-[1300px] flex-col gap-6;
  }

  .generator-grid {
    @apply grid gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:items-start;
  }

  .generator-header {
    @apply rounded-[1.75rem] bg-[#FFE566] border-4 border-black p-5 md:p-8;
    box-shadow: 8px 8px 0px 0px #000000;
  }

  .generator-description {
    @apply text-sm font-black uppercase tracking-[0.16em] text-black/55;
  }

  @media (max-width: 1023px) {
    .four-six-generator {
      @apply pb-32 pt-24;
    }
  }

  @media (max-width: 767px) {
    .four-six-generator {
      @apply px-3 pt-22 pb-24;
    }

    .generator-description {
      @apply text-[11px] leading-5;
    }
  }
</style>
