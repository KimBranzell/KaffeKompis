<script>
  import { onDestroy, tick, onMount, afterUpdate } from 'svelte';
  import { slide, fade, scale } from 'svelte/transition';
  import { linear } from 'svelte/easing';
  import CustomSelect from '../customSelect/customSelect.svelte';
  import {
    coffeeWeight,
    waterRatio,
    roastGrade,
    brewingTemperature,
    brewingSchedule,
    currentStep,
    isBrewing,
    totalTime,
    waterWeight
  } from './stores/brewingStore';
  import RoastSelector from './components/RoastSelector.svelte';
  import BrewingInstructions from './components/BrewingInstructions.svelte';
  import PouringTimeline from './components/PouringTimeline.svelte';

  /**
   * Constants used in the 4:6 coffee brewing generator.
   * These values represent the initial delay and pour fractions used in the 4:6 brewing method.
   */

  const INITIAL_DELAY_SECONDS = 0;          // Initial delay before starting the brewing process
  const FIRST_POUR_RATIO = 0.4;             // Ratio of water used in the first pour
  const SECOND_POUR_RATIO = 0.6;            // Ratio of water used in the second pour
  const ACIDIC_POUR_FRACTION = 2 / 3;       // Pour fraction for acidic taste profile
  const SWEET_POUR_FRACTION = 1 / 3;        // Pour fraction for sweet taste profile
  const EVEN_POUR_FRACTION = 1 / 2;         // Pour fraction for balanced taste profile

  // Generator initial state
  let coffeeStrength = "Balanced";          // Set initial strength to "balanced"
  let coffeeTaste = "Balanced";             // Set initial taste to "balanced"
  let inputValidationError = "";            // Set input validation error to empty string
  let time = INITIAL_DELAY_SECONDS;         // Set total brewing time to 0
  let pouringProgress = 0;                  // Set pouring progress to 0
  let currentPourAmount = 0;                // Track the current pour amount
  let carouselContainer;                    // Reference to the carousel container element
  let activeStep = 0;                       // Track the active step in the brewing process
  let completedSteps = new Set();           // Set to track completed steps
  let incrementValue = 1;                   // Default increment/decrement value

  // Recipe timer
  let prepTime = 5;                         // 5 seconds for preparation
  let isPouring = false;                    // State to track if pouring has started
  let isPrepping = false;                   // State to track if preparation has started
  let intervalId = null;                    // Interval ID for the timer
  let totalBrewingTime;                     // Total brewing time for the recipe

  let debouncedUpdateCoffeeWeight;          // Debounced function to update coffee weight
  let debouncedUpdateWaterToCoffeeRatio;    // Debounced function to update water to coffee ratio

  let progressWidth = 0;                    // This will represent the width of the progress bar

  const strengthOptions = [
    { value: 'Strong', label: 'Starkt' },
    { value: 'Balanced', label: 'Balanserat' },
    { value: 'Weak', label: 'Svagt' }
  ];

  const tasteOptions = [
    { value: 'Acidic', label: 'Syrligt' },
    { value: 'Balanced', label: 'Balanserat' },
    { value: 'Sweet', label: 'Sött' }
  ];


  /**
   * Debounces a function, ensuring that it is only called after a specified delay since the last time it was called.
   *
   * @param {Function} fn - The function to be debounced.
   * @param {number} delay - The delay in milliseconds to wait before calling the function.
   * @returns {Function} - A new function that is debounced.
   */
  function debounce(fn, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args);
      }, delay);
    };
  }

  /**
   * Starts a preparation timer that counts down for a specified duration, then starts the main timer.
   * The `prepTime` variable is decremented every second until it reaches 0, at which point the preparation timer is cleared and the main timer is started.
   * The `isPrepping` flag is set to `true` while the preparation timer is running, and `false` once it has completed.
   */
  function startPrepTimer() {
    isPrepping = true;
    intervalId = setInterval(() => {
      if (prepTime > 1) {
        prepTime--;
      } else {
        clearInterval(intervalId);
        isPrepping = false;
        startTimer();
      }
    }, 1000);
  }

  /**
   * Starts a timer that updates the current step and progress bar every second.
   * The timer is cleared if it was previously running.
   */
  function startTimer() {
    $isBrewing = true;
    isPouring = true;
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    $totalTime = 0;
    $currentStep = 0;
    intervalId = setInterval(() => {
      $totalTime += 0.1; // Increase by 0.1 seconds (100 milliseconds)
      updateCurrentStep();
      updateProgressBar();
    }, 100); // Update every 100 milliseconds
  }

  /**
   * Updates the current step in the brewing process based on the total time elapsed.
   * This function is responsible for tracking the progress of the brewing schedule and
   * determining the current step in the process.
   */
  function updateCurrentStep() {

    let timeAccumulated = 0;

    for (let i = 0; i < brewingSchedule.length; i++) {
      // Add the duration of the current step to the accumulated time
      timeAccumulated += brewingSchedule[i].time;

      // Check if the total time is less than or equal to the accumulated time
      if (totalTime <= timeAccumulated) {
        if (currentStep !== i) {
          $currentStep = i;
          pouringProgress = 0; // Reset pouring progress on step change
          isPouring = true; // Start pouring on new step
        }
        break;
      }
    }

    // If the total time exceeds the total duration of all steps, stop the timer
    if (totalTime > timeAccumulated) {
      clearInterval(intervalId);
      $isBrewing = false; // Stop brewing
      progressWidth = 0; // Reset progress bar
      isPouring = false; // Stop pouring when brewing is done
    }
  }

  /**
   * Updates the progress bar based on the current step in the brewing schedule.
   * The progress bar width is calculated as a percentage of the time elapsed in the current step.
   */
  function updateProgressBar() {
    if (currentStep < brewingSchedule.length) {
      const step                = brewingSchedule[currentStep];
      const stepStartTime       = step.startTime;
      const stepDuration        = step.time;
      const timeInCurrentStep   = totalTime - stepStartTime;
      const progressPercentage  = (timeInCurrentStep / stepDuration) * 100;
            progressWidth       = Math.min(progressPercentage, 100);

      if (timeInCurrentStep <= 10) {
        pouringProgress         = (timeInCurrentStep / 10) * 100;
        currentPourAmount       = (pouringProgress / 100) * step.pour;
      } else {
        pouringProgress         = 100;
        currentPourAmount       = step.pour;
        if (timeInCurrentStep >= stepDuration) {
          isPouring             = false;
        }
      }
    }
  }

  /**
   * Scrolls the carousel container to the active step, ensuring it is visible.
   * This function is used to keep the active step centered in the carousel view.
   */
  function scrollToActiveStep() {
    if (carouselContainer) {
      const activeStep = carouselContainer.querySelector('.timeline-step.active');
      if (activeStep) {
        if (currentStep === 0) {
          // If it's the first step, scroll to the very beginning
          carouselContainer.scrollTo({
            left: 0,
            behavior: 'auto' // Change to 'auto' for instant scrolling
          });
        } else {
          // For other steps, center the active step
          const offset = carouselContainer.offsetWidth / 2 - activeStep.offsetWidth / 2;
          carouselContainer.scrollTo({
            left: activeStep.offsetLeft - offset,
            behavior: 'auto' // Change to 'auto' for instant scrolling
          });
        }
      }
    }
  }

  /**
   * Increments the coffee weight by the specified amount, up to a maximum of 100.
   *
   * @param {number} increment - The amount to increase the coffee weight by.
   */
  function incrementCoffeeWeight(increment) {
    const newValue = $coffeeWeight + increment;
    if (newValue <= 100) {
      $coffeeWeight = newValue;
    }
  }

  /**
   * Decrements the coffee weight by the specified amount, down to a minimum of 1.
   *
   * @param {number} decrement - The amount to decrease the coffee weight by.
   */
  function decrementCoffeeWeight(decrement) {
    const newValue = $coffeeWeight - decrement;
    if (newValue >= 1) {
      $coffeeWeight = newValue;
    }
  }

  /**
   * Selects the specified roast grade for the coffee.
   *
   * @param {string} grade - The roast grade to select, e.g. 'Light', 'Medium', 'Dark'.
   */
  function selectRoast(grade) {
    $roastGrade = grade;
  }

    // Watch for changes in currentStep and scroll to the active step
  $: {
    scrollToActiveStep();
  }

  onMount(() => {
    scrollToActiveStep();
  });

  afterUpdate(() => {
    scrollToActiveStep();
  });

  /**
   * Cleans up the interval timer when the component is destroyed.
   */
  onDestroy(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  /**
   * Formats a number of seconds as a string in the format "minutes:seconds".
   *
   * @param {number} seconds - The number of seconds to format.
   * @returns {string} The formatted time string.
   */
  $: formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    // Ensuring two-digit seconds with leading zero if necessary
    const formattedSeconds = remainingSeconds.toString().padStart(2, "0");
    return `${minutes}:${formattedSeconds}`;
  };

  /**
   * Calculates the first and second pour amounts based on the coffee taste profile.
   *
   * @param {string} coffeeTaste - The taste profile of the coffee, can be 'Acidic', 'Balanced', or 'Sweet'.
   * @param {number} firstPourWater - The amount of water used for the first pour.
   * @returns {[number, number]} - An array containing the first and second pour amounts.
   */
  function calculateFirstAndSecondPours(coffeeTaste, firstPourWater) {
    switch (coffeeTaste) {
      case "Acidic":
        return [
          firstPourWater * ACIDIC_POUR_FRACTION,
          firstPourWater * SWEET_POUR_FRACTION,
        ];
      case "Balanced":
        return [
          firstPourWater * EVEN_POUR_FRACTION,
          firstPourWater * EVEN_POUR_FRACTION,
        ];
      case "Sweet":
        return [
          firstPourWater * SWEET_POUR_FRACTION,
          firstPourWater * ACIDIC_POUR_FRACTION,
        ];
    }
  }

  /**
   * Calculates the subsequent pour amounts based on the specified coffee strength.
   *
   * @param {string} coffeeStrength - The strength of the coffee, can be 'Strong', 'Balanced', or 'Weak'.
   * @param {number} secondPourWater - The amount of water used for the second pour.
   * @returns {number[]} An array of pour amounts for the subsequent pours.
   */
  function calculateSubsequentPours(coffeeStrength, secondPourWater) {
    switch (coffeeStrength) {
      case "Strong":
        return Array(4).fill(secondPourWater / 4);
      case "Balanced":
        return Array(3).fill(secondPourWater / 3);
      case "Weak":
        return Array(2).fill(secondPourWater / 2);
    }
  }

  /**
   * Calculates the brewing schedule and total brewing time for a coffee brew based on the provided input parameters.
   *
   * This function is responsible for validating the input parameters, calculating the first and second pours, and subsequent pours based on the coffee taste and strength.
   * It then creates a brewing schedule with the calculated pour amounts, total cumulative amounts, and timing for each step.
   * The total brewing time is also calculated and stored.
   *
   * @param {number} coffeeWeightGrams - The weight of the coffee in grams.
   * @param {number} waterToCoffeeRatio - The ratio of water to coffee.
   * @param {string} coffeeTaste - The desired taste profile of the coffee.
   * @param {string} coffeeStrength - The desired strength of the coffee.
   * @param {number} waterWeight - The total weight of the water.
   * @returns {void}
   */
  $: {
    inputValidationError = ""; // Reset inputValidationError at the beginning of the block
    if (
      isNaN($coffeeWeight) ||
      $coffeeWeight < 6
    ) {
      inputValidationError =
        "Vi rekommenderar att du använder minst 6 gram kaffe för det här receptet.";
    } else if ($coffeeWeight > 76) {
      inputValidationError = "Vi rekommenderar att du använder max 76 gram kaffe för det här receptet.";
    } else if ($waterRatio <= 0) {
      inputValidationError =
        "Please enter a valid number for the water to coffee ratio.";
    } else {
      let firstPourWater = $waterWeight * FIRST_POUR_RATIO;
      let secondPourWater = $waterWeight * SECOND_POUR_RATIO;
      let [firstPour, secondPour] = calculateFirstAndSecondPours(
        coffeeTaste,
        firstPourWater
      );
      let subsequentPours = calculateSubsequentPours(
        coffeeStrength,
        secondPourWater
      );

      // Create brewingSchedule and calculate cumulative totals
      let total = 0;
      time = INITIAL_DELAY_SECONDS;
      let startTime = 0;
      $brewingSchedule = [firstPour, secondPour, ...subsequentPours].map(
        (pour, index) => {
          let step = { pour, total: (total += pour), time: 45, startTime };
          startTime += step.time; // Increment startTime for the next step
          return step;
        }
      );
      tick().then(() => {
        totalBrewingTime = $brewingSchedule.reduce(
          (acc, step) => acc + step.time,
          0
        );
      });
    }
  }

  /**
   * Debounces the updates to the coffee weight and water-to-coffee ratio properties.
   * The updates are debounced with a delay of 300 milliseconds to prevent excessive updates.
   */
  $: {
    debouncedUpdateCoffeeWeight = debounce((value) => {
      $coffeeWeight = value;
    }, 100);

    debouncedUpdateWaterToCoffeeRatio = debounce((value) => {
      $waterRatio = value;
    }, 100);
  }

  $: recommendedRatio = calculateRecommendedRatio($coffeeWeight);
  $: showRecommendation = !recommendationRemoved && getNumericRatio(recommendedRatio) !== $waterRatio;

  /**
   * Calculates the recommended water to coffee ratio based on the coffee weight.
   *
   * @param {number} coffeeWeight - The weight of the coffee in grams.
   * @returns {string} - The recommended ratio as a string.
  */
  function calculateRecommendedRatio(coffeeWeight) {
    if (coffeeWeight < 20) return "1:16";
    if (coffeeWeight < 50) return "1:15";
    if (coffeeWeight < 69) return "1:14";
    if (coffeeWeight <= 76) return "1:13";
    return ""; // Default case, should not be reached due to current constraints
  }

  /**
   * Updates the water to coffee ratio based on the recommendation.
  */
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
      default:
        // No action needed for default case
        break;
    }
  }

  /**
   * Extracts the numeric part of a water to coffee ratio string.
   *
   * @param {string} ratioString - The water to coffee ratio string in the format "1:16".
   * @returns {number|null} - The numeric part of the ratio, or null if the input is invalid.
   */
  function getNumericRatio(ratioString) {
      const parts = ratioString.split(':');
      return parts.length > 1 ? parseInt(parts[1], 10) : null;
  }

  /**
   * Removes the recommendation for the current session.
  */
  let recommendationRemoved = false;
  function removeRecommendation() {
    recommendationRemoved = true;
  }


  // Known coffee weights and corresponding grind sizes
  const knownGrindSizes = [
    { coffeeWeight: 6, grindSize: 700 },
    { coffeeWeight: 40, grindSize: 1000 },
    { coffeeWeight: 76, grindSize: 1200 }
  ];

  let recommendedGrindSize = 0; // Initialize recommended grind size

  /**
   * Calculates the recommended grind size based on the provided coffee weight.
   * The function uses a combination of extrapolation and interpolation to determine the grind size.
   * For coffee weights less than 6g or greater than 76g, the function extrapolates the grind size
   * based on the known data points. For coffee weights between 6g and 76g, the function
   * interpolates the grind size based on the known data points.
   *
   * @param {number} coffeeWeight - The weight of the coffee in grams.
   * @returns {number} The recommended grind size.
   */
  function calculateGrindSize(coffeeWeight) {

    /**
    * Use the first two points to extrapolate for weights less than 6g
    */

    if (coffeeWeight < 6) {
      const slope = (knownGrindSizes[1].grindSize - knownGrindSizes[0].grindSize) /
                    (knownGrindSizes[1].coffeeWeight - knownGrindSizes[0].coffeeWeight);
      const extrapolatedGrindSize = knownGrindSizes[0].grindSize +
                                    (coffeeWeight - knownGrindSizes[0].coffeeWeight) * slope;
      return Math.round(extrapolatedGrindSize / 10) * 10;
    }

    /**
    * Use the last two points to extrapolate for weights greater than 76g
    */

    if (coffeeWeight > 76) {
      const lastTwoPoints = knownGrindSizes.slice(-2);
      const slope = (lastTwoPoints[1].grindSize - lastTwoPoints[0].grindSize) /
                    (lastTwoPoints[1].coffeeWeight - lastTwoPoints[0].coffeeWeight);
      const extrapolatedGrindSize = lastTwoPoints[0].grindSize +
                                    (coffeeWeight - lastTwoPoints[0].coffeeWeight) * slope;
      return Math.round(extrapolatedGrindSize / 10) * 10;
    }

    /**
    * Existing interpolation logic for weights between 6g and 76g remains unchanged
    */

    let lowerPoint = knownGrindSizes[0];
    let upperPoint = knownGrindSizes[knownGrindSizes.length - 1];

    for (let i = 0; i < knownGrindSizes.length - 1; i++) {
      if (coffeeWeight >= knownGrindSizes[i].coffeeWeight && coffeeWeight <= knownGrindSizes[i + 1].coffeeWeight) {
        lowerPoint = knownGrindSizes[i];
        upperPoint = knownGrindSizes[i + 1];
        break;
      }
    }

    const weightRange           = upperPoint.coffeeWeight - lowerPoint.coffeeWeight;
    const grindSizeRange        = upperPoint.grindSize - lowerPoint.grindSize;
    const weightDifference      = coffeeWeight - lowerPoint.coffeeWeight;
    const interpolatedGrindSize = lowerPoint.grindSize + (weightDifference / weightRange) * grindSizeRange;

    return Math.round(interpolatedGrindSize / 10) * 10;
  }

  // Update grind size when coffee weight changes
  $: recommendedGrindSize = calculateGrindSize($coffeeWeight);

  /**
   * Prints the current page.
   */
  function handlePrint() {
    window.print();
  }
  /**
   * Encodes a coffee recipe to a compact hash string.
   *
   * The recipe is encoded into a single integer value, which is then converted to a base-36 string. The encoded value includes the following information:
   *
   * - Coffee weight (in grams)
   * - Water to coffee ratio (as a percentage)
   * - Roast level (light, medium, or dark)
   * - Coffee strength (strong, balanced, or weak)
   * - Coffee taste (acidic, balanced, or sweet)
   *
   * This encoded hash can be used to share the recipe with others or to restore the recipe state in the application.
   *
   * @returns {string} The encoded recipe hash.
   */
  function encodeRecipeToHash() {
    const roastMap = { Light: 0, Medium: 1, Dark: 2 };
    const strengthMap = { Strong: 0, Balanced: 1, Weak: 2 };
    const tasteMap = { Acidic: 0, Balanced: 1, Sweet: 2 };

    const packed =
      $coffeeWeight * 1000000 +
      $waterRatio * 10000 +
      roastMap[$roastGrade] * 1000 +
      strengthMap[coffeeStrength] * 100 +
      tasteMap[coffeeTaste] * 10;

    return packed.toString(36);
  }
  /**
   * Decodes a compact hash string back into a coffee recipe.
   *
   * The hash string is expected to be a base-36 encoded integer value that represents the following recipe information:
   *
   * - Coffee weight (in grams)
   * - Water to coffee ratio (as a percentage)
   * - Roast level (light, medium, or dark)
   * - Coffee strength (strong, balanced, or weak)
   * - Coffee taste (acidic, balanced, or sweet)
   *
   * This function decodes the hash string back into an object containing the original recipe details.
   *
   * @param {string} hash - The encoded recipe hash string.
   * @returns {object|null} The decoded recipe object, or null if the hash is invalid.
   */
  function decodeHashToRecipe(hash) {
    try {
      const packed = parseInt(hash, 36);

      const roastMap = { 0: 'Light', 1: 'Medium', 2: 'Dark' };
      const strengthMap = { 0: 'Strong', 1: 'Balanced', 2: 'Weak' };
      const tasteMap = { 0: 'Acidic', 1: 'Balanced', 2: 'Sweet' };

      return {
        weight: Math.floor(packed / 1000000),
        ratio: Math.floor((packed % 1000000) / 10000),
        roast: roastMap[Math.floor((packed % 10000) / 1000)],
        strength: strengthMap[Math.floor((packed % 1000) / 100)],
        taste: tasteMap[Math.floor((packed % 100) / 10)]
      };
    } catch (e) {
      return null;
    }
  }
  /**
   * Shares the current coffee recipe by encoding it into a hash and generating a shareable URL.
   *
   * If the browser supports the Web Share API, it will open the native share dialog with the recipe details.
   * Otherwise, it will copy the shareable URL to the clipboard and display an alert.
   */
  function shareRecipe() {
    const hash = encodeRecipeToHash();
    const shareableUrl = `${window.location.origin}${window.location.pathname}#${hash}`;

    if (navigator.share) {
      navigator.share({
        title: 'Min 4:6-metod på Kaffekompis',
        text: 'Kolla in mitt kafferecept!',
        url: shareableUrl
      });
    } else {
      navigator.clipboard.writeText(shareableUrl)
        .then(() => alert('Länk kopierad! Nu kan du dela receptet med dina vänner.'))
        .catch(err => console.error('Failed to copy URL:', err));
    }
  }
  /**
   * Initializes the 4:6 coffee generator by decoding the recipe hash from the URL, if present.
   *
   * When the component is mounted, it checks if there is a hash in the URL. If so, it decodes the hash
   * into a recipe object and updates the corresponding state variables with the recipe details.
   */
  onMount(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const recipe = decodeHashToRecipe(hash);
      if (recipe) {
        $coffeeWeight = recipe.weight;
        $waterRatio = recipe.ratio;
        $roastGrade = recipe.roast;
        coffeeStrength = recipe.strength;
        coffeeTaste = recipe.taste;
      }
    }
  });

  let initialLoadComplete = false;

  if (typeof window !== 'undefined') {
    const savedStrength = localStorage.getItem('coffeeStrength');
    const savedTaste = localStorage.getItem('coffeeTaste');

    if (savedStrength) {
      coffeeStrength = savedStrength;
    }
    if (savedTaste) {
      coffeeTaste = savedTaste;
    }
    initialLoadComplete = true;
  }
  // Add reactive statements to save changes
  $: {
    if (typeof window !== 'undefined' && coffeeStrength && initialLoadComplete) {
      localStorage.setItem('coffeeStrength', coffeeStrength);
    }
  }

  $: {
    if (typeof window !== 'undefined' && coffeeTaste && initialLoadComplete) {
      localStorage.setItem('coffeeTaste', coffeeTaste);
    }
  }


</script>

<style lang="scss">
  .four-six-generator {
    @apply mx-auto p-8;
  }

  .generator-header {
    @apply bg-[#FFE566] border-3 border-black p-8 mb-12 neo-card-shadow;
  }

  .calculator-item {
    @apply mb-6;

    label {
      @apply block text-xl font-bold mb-2;
    }

    input, select {
      @apply w-full p-4 border-3 border-black bg-white neo-input-shadow;
      &:focus {
        @apply outline-none -translate-x-1 -translate-y-1;
      }
    }
  }



  .coffee-bean {
    @apply w-16 h-16 cursor-pointer p-2 transition-transform;
    &:hover, &.selected {
      @apply -translate-y-1 bg-[#FFA45B];
    }
  }

  table {
    @apply w-full border-3 border-black bg-white neo-card-shadow mb-8;

    th {
      @apply bg-black text-white p-4 text-left;
    }

    td {
      @apply p-4 border-b-2 border-black;
    }
  }

  .active-row {
    @apply bg-[#FFE566];
  }

  .done-row {
    @apply bg-[#C1FF9B];
  }

  .timer-panel {
    @apply fixed bottom-0 left-0 w-full bg-black text-white p-4 text-center text-xl font-bold;
  }

  .progress-bar {
    @apply bg-[#7CB9E8] h-full transition-all;
  }

  .pouring-timeline-carousel {
    @apply fixed bottom-0 left-0 w-full border-t-4 bg-white border-black overflow-x-auto;
    height: 120px;
  }

  .timeline-step {
    @apply inline-block min-w-[300px] border-r-4 h-full p-4 border-black;
    &.active {
      @apply bg-[#FFE566];
    }
  }

  // Utility classes
  .neo-card-shadow {
    box-shadow: 4px 4px 0px 0px #000000;
  }

  .neo-input-shadow {
    box-shadow: 2px 2px 0px 0px #000000;
  }

  .border-3 {
    border-width: 3px;
  }

  .roast-selector {
    @apply mb-8;
  }



  .roast-label {
    @apply font-bold text-lg;
  }

  .temp-label {
    @apply bg-black text-white px-2 py-1 text-sm font-bold;
  }

  // Print styles
  @media print {
    .timer-panel, .pouring-timeline-carousel {
      display: none;
    }
  }

  .timer-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: white;
    text-align: center;
    span {
      z-index: 100;
      position: relative;
      padding: 10px;
      display: block;
    }
  }

  .progress-bar {
    background-color: #4CAF50; /* Green */
    color: white;
    height: 100%;
    line-height: 30px; /* Align text vertically */
    text-align: center;
    transition: width 0.1s linear;
    position: absolute;
  }

  .pouring-progress-bar {
    height: 100%;
    line-height: 30px; /* Align text vertically */
    text-align: center;
    transition: width 0.1s linear;
    position: absolute;
    background-color: blue; /* Different color for pouring progress */
    bottom: 66px;
  }

  .pouring-timeline {
    position: fixed;
    bottom: 60px;
    left: 0;
    width: 100%;
    height: 100px; /* Adjust height as needed */
    background-color: #f0f0f0;
    display: flex;
    flex-direction: row; /* Change to row for horizontal layout */
    justify-content: space-between;
    padding: 10px;
    overflow-x: auto; /* Add horizontal scrolling if needed */
  }

  .timeline-step {
    position: relative;
    display: flex;
    flex-direction: column; /* Keep column for vertical stacking of label and bar */
    align-items: flex-start;
    justify-content: start; /* Adjust alignment */
    min-width: 100px; /* Adjust based on content */
    width: 100%;
    height: 100%;
    transition: box-shadow 250ms linear, background-color 250ms linear;
    &.active {
      transition: box-shadow 250ms linear, background-color 250ms linear;
      box-shadow: 0px -3px 0px green; /* Example style for the active step */
      background-color: #e0f7fa; /* Example background color for the active step */
    }
  }

  .step-label {
    @apply mb-2 font-mono text-sm;

    .pour-section-label,
    .wait-section-label {
      @apply inline-block px-2;
    }
  }

  .step-bar {
  @apply h-12 relative flex w-full h-4/5;
}

  .pour-amount {
    font-size: 12px;
    margin-bottom: 5px;
  }

  .pour-section,
  .wait-section {
    @apply relative h-full;
  }

  .progress-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #4caf50;
    transition: height 0.1s linear;

    &.completed {
      height: 100%;
    }
  }

  .pour-section {
    @apply bg-[#E0E0E0] border-r-2 border-black;
    &:after {
      content: 'Häll';
      @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold;
    }
  }

  .wait-section {
    @apply bg-[#F5F5F5];
    &:after {
      content: 'Vänta';
      @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold;
    }
  }

  .pour-section .progress-bar {
    background-color: #2196f3;
  }

  .timer-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #333;
    color: white;
    text-align: center;
    padding: 10px;
  }


  .step-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
}

.step-label, .pour-amount {
  font-size: 12px;
  margin-top: 5px;
}

.timeline-step {
  flex: 0 0 100%;
  box-sizing: border-box;
  padding: 1rem;
  transition: transform 0.3s ease-in-out;
}

// .timeline-step.active {
//   transform: scale(1.05);
// }

.step-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.step-bar {
  display: flex;
  position: relative;
  height: 30px;
  background-color: #f0f0f0;
  border-radius: 5px;
  overflow: hidden;
}

.pour-section,
.wait-section {
  display: inline-block;
  height: 100%;
}

.progress-bar.completed {
  @apply w-full;
  background-color: #4CAF50; /* Green */
}


.active-row {
  background-color: yellow; /* Highlight color */
  transition: background-color 0.5s ease;
}

.done-row {
  animation: doneEffect 1s forwards;
}

@keyframes doneEffect {
  0% { background-color: yellow; }
  100% { background-color: green; }
}

.calculator-item {
  select {
    @apply w-full p-4 border-3 border-black bg-white neo-input-shadow;
    transform-origin: top;
    animation: selectAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:focus {
      @apply outline-none -translate-x-1 -translate-y-1;
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
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

<div class="four-six-generator ">
  <div class="u-container pt-40 pb-10 px-4 u-grid mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 w-[1300px]">
    <div class="generator-header">
      <div class="u-container u-grid">
        <div class="calculator-item">
            <label for="coffeeWeightGrams">
              Kaffevikt (gram)
            </label>
            <!-- <input id="coffeeWeightGrams" name="coffeWeightGrams" type="number" min="1" max="100" on:input={(e) => debouncedUpdateCoffeeWeight(e.target.value)} /> -->
            <input id="coffeeWeightGrams" name="coffeWeightGrams" type="number" bind:value={$coffeeWeight} min="1" max="100" />

            <div class="grid gap-4 py-4 grid-flow-col grid-cols-[2fr_1fr_1fr_2fr]">
              <button class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none" on:click={() => decrementCoffeeWeight(1)}>−</button>
              <button class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-secondaryBlack dark:text-darkText border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none" on:click={() => decrementCoffeeWeight(10)}>−10g</button>
              <button class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-secondaryBlack dark:text-darkText border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none" on:click={() => incrementCoffeeWeight(10)}>+10g</button>
              <button class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none" on:click={() => incrementCoffeeWeight(1)}>+</button>
            </div>
        </div>
        <div class="calculator-item">
          <label for="roastGrade" class="block text-xl font-bold mb-4">Rostgrad:
            <RoastSelector />
          <div>
            {
              roastGrade === 'Light' ? 'Ljusrost' :
              roastGrade === 'Medium' ? 'Mellanrost' :
              roastGrade === 'Dark' ? 'Mörkrost' : ''
            }
          </div>
          </label>
        </div>
        <div class="calculator-item">
          <label for="waterToCoffeeRatio">Kaffe:Vatten-ratio</label>
          <select id="waterToCoffeeRatio" name="waterToCoffeeRatio" bind:value={$waterRatio} >
            {#each Array(7).fill().map((_, i) => i + 12) as ratio}
              <option value={ratio}>1:{ratio}</option>
            {/each}
          </select>
          {#if showRecommendation}
            <div class="recommendation-panel bg-[#FFE566] border-3 border-black p-4 neo-card-shadow">
              <p class="text-xl mb-4">Rekommenderad ratio: {recommendedRatio}</p>
              <div class="flex gap-4">
                <button class="bg-black text-white px-4 py-2 border-3 border-black font-bold hover:-translate-y-1 transition-transform" href="javascript:void(0)" on:click={changeToRecommendedRatio}>Använd rekommenderad ratio</button>
                <button class="bg-white px-4 py-2 border-3 border-black font-bold hover:-translate-y-1 transition-transform" on:click={removeRecommendation}>Stäng</button>
              </div>
            </div>
          {/if}
        </div>
        <div class="calculator-item">
          <label>Kaffestyrka:</label>
          <CustomSelect
            options={strengthOptions}
            bind:value={coffeeStrength}
          />
        </div>

        <div class="calculator-item">
          <label>Kaffesmak:</label>
          <CustomSelect
            options={tasteOptions}
            bind:value={coffeeTaste}
          />
        </div>
      </div>

      {#if inputValidationError}
        <p>{inputValidationError}</p>
      {/if}
      <button
        class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
        on:click={handlePrint}
      >
        Skriv ut recept
      </button>
      <button
        class="px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none"
        on:click={shareRecipe}
      >
        Dela recept
      </button>
    </div>

    <BrewingInstructions
      coffeeWeight={$coffeeWeight}
      waterWeight={$waterWeight}
      temperature={$brewingTemperature}
      {recommendedGrindSize}
    />

  </div>
  <div class="generator-body">
    <table>
      <tbody>
        <tr>
          <th>Tid</th>
          <th>Vatten (g)</th>
          <th>Total vätska (g)</th>
        </tr>
        {#each $brewingSchedule as {startTime, pour, total}, index}
          <tr class="{index === currentStep ? 'active-row' : ''} {index < currentStep ? 'done-row' : ''}">
            <td>{formatTime(startTime)}</td>
            <td>{pour.toFixed(2)}</td>
            <td>{total.toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    {#if !isBrewing}
      <button on:click={startPrepTimer}>Börja brygga</button>
    {/if}

  </div>


  <PouringTimeline
    {carouselContainer}
    {brewingSchedule}
    {currentStep}
    {totalTime}
    {formatTime}
  />
<!-- Update the pouring-timeline code -->
<!-- <div class="pouring-timeline-carousel" bind:this={carouselContainer}>
  {#each brewingSchedule as step, index}
    <div class="timeline-step {index === currentStep ? 'active' : ''}">
      <div class="step-label">
        <div class="pour-section-label" style="width: {(10 / step.time) * 100}%; display: inline-block;">
          {formatTime(step.startTime)} - {formatTime(step.startTime + 10)}
        </div>
        <div class="wait-section-label" style="width: {((step.time - 10) / step.time) * 100}%; display: inline-block;">
          {formatTime(step.startTime + 10)} - {formatTime(step.startTime + step.time)} - {step.pour.toFixed(2)}g ({step.total.toFixed(2)}g)
        </div>
      </div>
      <div class="step-bar">
        <div class="pour-amount"></div>
        <div class="pour-section" style="width: {(10 / step.time) * 100}%; display: inline-block;">
          {#if index < currentStep || (index === currentStep && totalTime >= step.startTime + 10)}
            <div class="progress-bar completed"></div>
          {:else if index === currentStep}
            <div class="progress-bar" style="width: {((totalTime - step.startTime) / 10) * 100}%;"></div>
          {/if}
        </div>
        <div class="wait-section" style="width: {((step.time - 10) / step.time) * 100}%; display: inline-block;">
          {#if index < currentStep}
            <div class="progress-bar completed"></div>
          {:else if index === currentStep && totalTime >= step.startTime + 10}
            <div class="progress-bar" style="width: {((totalTime - step.startTime - 10) / (step.time - 10)) * 100}%;"></div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div> -->

<div class="timer-panel">
  {#if isPrepping}
    <div>Get ready! Starting instructions in {prepTime} seconds...</div>
  {:else if isBrewing}
    <span>Step {currentStep + 1} of {brewingSchedule.length}: {formatTime(totalTime)}</span>
  {/if}
</div>


</div>