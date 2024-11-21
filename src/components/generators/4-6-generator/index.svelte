<script>
  import { onDestroy, tick, onMount, afterUpdate } from "svelte";
  import { slide, fade, scale } from "svelte/transition";
  import { linear } from "svelte/easing";

  // Store imports
  import {
    coffeeWeight,
    roastGrade,
    brewingTemperature,
    brewingSchedule,
    currentStep,
    isBrewing,
    totalTime,
    waterWeight,
  } from "./utils/brewingStore";

  import {
    calculateGrindSize
  } from './utils/calculations';

    // Utils imports
  import {
    calculateFirstAndSecondPours,
    calculateSubsequentPours,
  } from "./utils/calculations";
  import {
    formatTime,
    getNumericRatio
  } from "./utils/formatters";
  import {
    encodeRecipeToHash,
    decodeHashToRecipe,
    shareRecipe,
  } from "./utils/recipeSharing";
  import {
    BREWING_CONSTANTS,
    OPTION_SETS
  } from "./utils/constants";
  import {
    waterRatio,
    strength,
    taste
  } from "./utils/brewingStore";

  // Component imports
  import CoffeeWeightInput from "./components/CoffeeWeightInput.svelte";
  import RatioSelector from "./components/RatioSelector.svelte";
  import RoastSelector from "./components/RoastSelector.svelte";
  import BrewingInstructions from "./components/BrewingInstructions.svelte";
  import BrewingControls from "./components/BrewingControls.svelte";
  import BrewingTable from "./components/BrewingTable.svelte";
  import PouringTimeline from "./components/PouringTimeline.svelte";
  import StrengthSelector from "./components/StrengthSelector.svelte";
  import TasteSelector from "./components/TasteSelector.svelte";
  import PrintButton from "./components/PrintButton.svelte";
  import ShareButton from "./components/ShareButton.svelte";

  // Initial state
  let inputValidationError = "";
  let carouselContainer;
  let initialLoadComplete = false;

  // Save preferences when they change
  $: if (typeof window !== "undefined" && initialLoadComplete) {
    localStorage.setItem("coffeeStrength", $strength);
    localStorage.setItem("coffeeTaste", $taste);
    localStorage.setItem("waterRatio", $waterRatio);
  }

  // Mark initial load as complete after first render
  if (typeof window !== "undefined") {
    initialLoadComplete = true;
  }

  $: recommendedGrindSize = calculateGrindSize($coffeeWeight);


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
    Step {$currentStep + 1} of {$brewingSchedule.length}: Pour {$brewingSchedule[$currentStep].amount}g water
  {/if}
</div>

<div class="four-six-generator" role="main" aria-label="Kaffebryggningssimulator">
  <div
    class="u-container pt-40 pb-10 px-4 u-grid mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 w-[1300px]" role="region" aria-label="Bryggningsinställningar"
  >
    <div class="generator-header">
      <div class="u-container u-grid grid h-full">
        <div class="tools-container" role="group" aria-label="Bryggningsparametrar">
          {#if inputValidationError}
            <div class="validation-error bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
              <p>{inputValidationError}</p>
            </div>
          {/if}
          <CoffeeWeightInput />
          <RoastSelector />
          <RatioSelector />
          <StrengthSelector selectedStrength={$strength} on:change={(e) => $strength = e.detail} />
          <TasteSelector selectedTaste={$taste} on:change={(e) => $taste = e.detail} />
          <div class="button-group grid grid-cols-2 gap-4 mt-6">
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
  .four-six-generator {
    @apply mx-auto p-8;
  }

  .generator-header {
    @apply bg-[#FFE566] border-4 border-black p-8;
    box-shadow: 4px 4px 0px 0px #000000;
  }
</style>
