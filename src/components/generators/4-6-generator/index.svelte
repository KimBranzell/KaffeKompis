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

  // Component imports
  import CoffeeWeightInput from "./components/CoffeeWeightInput.svelte";
  import RatioSelector from "./components/RatioSelector.svelte";
  import RoastSelector from "./components/RoastSelector.svelte";
  import BrewingInstructions from "./components/BrewingInstructions.svelte";
  import BrewingControls from "./components/BrewingControls.svelte";
  import BrewingTable from "./components/BrewingTable.svelte";
  import PouringTimeline from "./components/PouringTimeline.svelte";
  import CustomSelect from "./components/CustomSelect.svelte";
  import StrengthSelector from "./components/StrengthSelector.svelte";
  import TasteSelector from "./components/TasteSelector.svelte";
  import PrintButton from "./components/PrintButton.svelte";
  import ShareButton from "./components/ShareButton.svelte";

  // Utils imports
  import {
    calculateFirstAndSecondPours,
    calculateSubsequentPours,
  } from "./utils/calculations";
  import { formatTime, getNumericRatio } from "./utils/formatters";
  import {
    encodeRecipeToHash,
    decodeHashToRecipe,
    shareRecipe,
  } from "./utils/recipeSharing";
  import { BREWING_CONSTANTS, OPTION_SETS } from "./utils/constants";
  import { waterRatio, strength, taste } from "./utils/brewingStore";

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
</script>

<div class="four-six-generator">
  <div
    class="u-container pt-40 pb-10 px-4 u-grid mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 w-[1300px]"
  >
    <div class="generator-header">
      <div class="u-container u-grid">
        <CoffeeWeightInput />
        <RoastSelector />
        <RatioSelector />
        <StrengthSelector selectedStrength={$strength} on:change={(e) => $strength = e.detail} />
        <TasteSelector selectedTaste={$taste} on:change={(e) => $taste = e.detail} />
        <div class="button-group grid grid-cols-2 gap-4 mt-6">
          <PrintButton />
          <ShareButton strength={$strength} taste={$taste} />
        </div>
        <BrewingControls />
      </div>
    </div>

    <BrewingInstructions
      coffeeWeight={$coffeeWeight}
      waterWeight={$waterWeight}
      temperature={$brewingTemperature}
    />
  </div>

  <BrewingTable />

  <PouringTimeline
    bind:carouselContainer
    brewingSchedule={$brewingSchedule}
    currentStep={$currentStep}
    totalTime={$totalTime}
  />
</div>

<style lang="scss">
  .four-six-generator {
    @apply mx-auto p-8;
  }

  .generator-header {
    @apply bg-[#FFE566] border-4 border-black p-8 mb-12;
    box-shadow: 4px 4px 0px 0px #000000;
  }

  .action-button {
    @apply px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }

  .select-container {
    @apply mb-6;
  }

  .select-headline {
    @apply text-lg font-bold mb-2;
  }
</style>
