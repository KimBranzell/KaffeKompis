<script>
  import { onDestroy, tick, onMount, afterUpdate } from 'svelte';
  import { slide, fade, scale } from 'svelte/transition';
  import { linear } from 'svelte/easing';

  /**
   * Constants used in the 4-6 coffee brewing generator.
   * These values represent the initial delay, coffee weight, water to coffee ratio, and pour fractions used in the 4-6 brewing method.
   */
  const INITIAL_DELAY_SECONDS = 0;
  const INITIAL_COFFEE_WEIGHT_GRAMS = 20; // grams
  const DEFAULT_WATER_TO_COFFE_RATIO = 15;
  const FIRST_POUR_RATIO = 0.4;
  const SECOND_POUR_RATIO = 0.6;
  const ACIDIC_POUR_FRACTION = 2 / 3;
  const SWEET_POUR_FRACTION = 1 / 3;
  const EVEN_POUR_FRACTION = 1 / 2;

  // Generator initial state
  let coffeeWeightGrams = INITIAL_COFFEE_WEIGHT_GRAMS;  // Set initial coffee weight to 20 grams
  let waterToCoffeeRatio = DEFAULT_WATER_TO_COFFE_RATIO; // Set initial water to coffee ratio to 1:15
  let coffeeStrength = "Balanced"; // Set initial strength to "balanced"
  let coffeeTaste = "Balanced"; // Set initial taste to "balanced"
  let roastGrade = "Light"; // Set initial roast grade to "light"
  let brewingTemperature = 88; // Set default brewing temperature to 88 degrees Celcius
  let inputValidationError = ""; // Set input validation error to empty string
  let brewingSchedule = []; // Set brewing schedule to an empty array
  let time = INITIAL_DELAY_SECONDS; // Set total brewing time to 0
  let pouringProgress = 0; // Set pouring progress to 0
  let currentPourAmount = 0; // Track the current pour amount
  let carouselContainer;
  let activeStep = 0; // Track the active step in the brewing process
  let completedSteps = new Set();
  let incrementValue = 1; // Default increment/decrement value

  // Recipe timer
  let prepTime = 5; // 5 seconds for preparation
  let totalTime = 0; // Total time for the brewing process
  let isBrewing = false; // State to track if brewing has started
  let isPouring = false; // State to track if pouring has started
  let isPrepping = false; // State to track if preparation has started
  let currentStep = 0;
  let intervalId = null;
  let totalBrewingTime;

  let debouncedUpdateCoffeeWeight;
  let debouncedUpdateWaterToCoffeeRatio;

  let progressWidth = 0; // This will represent the width of the progress bar


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
    isBrewing = true;
    isPouring = true;
    if (intervalId !== null) {
        clearInterval(intervalId);
    }
    totalTime = 0;
    currentStep = 0;
    intervalId = setInterval(() => {
        totalTime += 0.1; // Increase by 0.1 seconds (100 milliseconds)
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
          currentStep = i;
          pouringProgress = 0; // Reset pouring progress on step change
          isPouring = true; // Start pouring on new step
        }
        break;
      }
    }

    // If the total time exceeds the total duration of all steps, stop the timer
    if (totalTime > timeAccumulated) {
      clearInterval(intervalId);
      isBrewing = false; // Stop brewing
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
        const step = brewingSchedule[currentStep];
        const stepStartTime = step.startTime;
        const stepDuration = step.time;
        const timeInCurrentStep = totalTime - stepStartTime;
        const progressPercentage = (timeInCurrentStep / stepDuration) * 100;
        progressWidth = Math.min(progressPercentage, 100);

        if (timeInCurrentStep <= 10) {
            pouringProgress = (timeInCurrentStep / 10) * 100;
            currentPourAmount = (pouringProgress / 100) * step.pour;
        } else {
            pouringProgress = 100;
            currentPourAmount = step.pour;
            if (timeInCurrentStep >= stepDuration) {
                isPouring = false;
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

  function incrementCoffeeWeight(increment) {
    const newValue = parseFloat(coffeeWeightGrams) + increment;
    if (newValue <= 100) {
      debouncedUpdateCoffeeWeight(newValue);
    }
  }

  function decrementCoffeeWeight(decrement) {
    const newValue = parseFloat(coffeeWeightGrams) - decrement;
    if (newValue >= 1) {
      debouncedUpdateCoffeeWeight(newValue);
    }
  }

  function selectRoast(grade) {
    roastGrade = grade;
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
   * Calculates the water weight based on the coffee weight and the water-to-coffee ratio.
   */
  $: waterWeight = coffeeWeightGrams * waterToCoffeeRatio;

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
      isNaN(parseFloat(coffeeWeightGrams)) ||
      parseFloat(coffeeWeightGrams) <= 6
    ) {
      inputValidationError =
        "Vi rekommenderar att du använder minst 6 gram kaffe för det här receptet.";
    } else if (coffeeWeightGrams > 76) {
      inputValidationError = "Vi rekommenderar att du använder max 76 gram kaffe för det här receptet.";
    } else if (isNaN(waterToCoffeeRatio) || waterToCoffeeRatio <= 0) {
      inputValidationError =
        "Please enter a valid number for the water to coffee ratio.";
    } else {
      let firstPourWater = waterWeight * FIRST_POUR_RATIO;
      let secondPourWater = waterWeight * SECOND_POUR_RATIO;
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
      brewingSchedule = [firstPour, secondPour, ...subsequentPours].map(
        (pour, index) => {
          let step = { pour, total: (total += pour), time: 45, startTime };
          startTime += step.time; // Increment startTime for the next step
          return step;
        }
      );
      tick().then(() => {
        totalBrewingTime = brewingSchedule.reduce(
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
      coffeeWeightGrams = value;
    }, 100);

    debouncedUpdateWaterToCoffeeRatio = debounce((value) => {
      waterToCoffeeRatio = value;
    }, 100);
  }

  $: {
    switch (roastGrade) {
      case 'Light':
        brewingTemperature = 93;
        break;
      case 'Medium':
        brewingTemperature = 88;
        break;
      case 'Dark':
        brewingTemperature = 83;
        break;
    }
  }

  $: recommendedRatio = calculateRecommendedRatio(coffeeWeightGrams);
  $: showRecommendation = !recommendationRemoved && getNumericRatio(recommendedRatio) !== waterToCoffeeRatio;

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
        waterToCoffeeRatio = 16;
        break;
      case "1:15":
        waterToCoffeeRatio = 15;
        break;
      case "1:14":
        waterToCoffeeRatio = 14;
        break;
      case "1:13":
        waterToCoffeeRatio = 13;
        break;
      default:
        // No action needed for default case
        break;
    }
  }

  // Helper function to extract the numeric ratio value from the recommendedRatio string
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

  // Function to interpolate grind size
  function calculateGrindSize(coffeeWeight) {
  // Use the first two points to extrapolate for weights less than 6g
  if (coffeeWeight < 6) {
    const slope = (knownGrindSizes[1].grindSize - knownGrindSizes[0].grindSize) /
                  (knownGrindSizes[1].coffeeWeight - knownGrindSizes[0].coffeeWeight);
    const extrapolatedGrindSize = knownGrindSizes[0].grindSize +
                                  (coffeeWeight - knownGrindSizes[0].coffeeWeight) * slope;
    return Math.round(extrapolatedGrindSize / 10) * 10;
  }

  // Use the last two points to extrapolate for weights greater than 76g
  if (coffeeWeight > 76) {
    const lastTwoPoints = knownGrindSizes.slice(-2);
    const slope = (lastTwoPoints[1].grindSize - lastTwoPoints[0].grindSize) /
                  (lastTwoPoints[1].coffeeWeight - lastTwoPoints[0].coffeeWeight);
    const extrapolatedGrindSize = lastTwoPoints[0].grindSize +
                                  (coffeeWeight - lastTwoPoints[0].coffeeWeight) * slope;
    return Math.round(extrapolatedGrindSize / 10) * 10;
  }

  // Existing interpolation logic for weights between 6g and 76g remains unchanged
  let lowerPoint = knownGrindSizes[0];
  let upperPoint = knownGrindSizes[knownGrindSizes.length - 1];
  for (let i = 0; i < knownGrindSizes.length - 1; i++) {
    if (coffeeWeight >= knownGrindSizes[i].coffeeWeight && coffeeWeight <= knownGrindSizes[i + 1].coffeeWeight) {
      lowerPoint = knownGrindSizes[i];
      upperPoint = knownGrindSizes[i + 1];
      break;
    }
  }

  const weightRange = upperPoint.coffeeWeight - lowerPoint.coffeeWeight;
  const grindSizeRange = upperPoint.grindSize - lowerPoint.grindSize;
  const weightDifference = coffeeWeight - lowerPoint.coffeeWeight;
  const interpolatedGrindSize = lowerPoint.grindSize + (weightDifference / weightRange) * grindSizeRange;

  return Math.round(interpolatedGrindSize / 10) * 10;
  }

  // Reactive statement to update grind size when coffee weight changes
  $: recommendedGrindSize = calculateGrindSize(coffeeWeightGrams);

  /**
   * Prints the current page.
   */
  function handlePrint() {
    window.print();
  }
</script>


<style lang="scss">
  input, select, button {
    padding: 11px;
    width: 100%;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    //border: 1px solid black;
    padding: 5px;
    text-align: left;
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
    margin-bottom: 5px;
    width: 100%;
    display: inline-flex;
    .pour-section-label,
    .wait-section-label {
      padding: 0 5px;
    }
  }

  .step-bar {
  width: 100%; /* Keep width or adjust as needed */
  height: 80%; /* Adjust height to fit within the timeline */
  display: flex;
  flex-flow: row;
}

  .pour-amount {
    font-size: 12px;
    margin-bottom: 5px;
  }

  .pour-section,
  .wait-section {
    position: relative;
    width: 100%;
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
    background: #ddd;
    border-right: 1px solid #bbb;
    &:after {
      content: 'Häll';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: .5;
    }
  }

  .wait-section {
    background: #dcdcdc;
    &:after {
      content: 'Vänta';
      opacity: .5;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: .5;
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






.pouring-timeline-carousel {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  width: 100%;
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

.progress-bar {
  height: 100%;
  background-color: #4CAF50; /* Green */
  transition: width 0.1s linear;
}

.progress-bar.completed {
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

</style>

<div class="four-six-generator">
  <div class="u-container u-grid">
    <div class="generator-header">
      <div class="u-container u-grid">
        <div class="calculator-item">
            <label for="coffeeWeightGrams">
              Kaffevikt (gram)
            </label>
            <!-- <input id="coffeeWeightGrams" name="coffeWeightGrams" type="number" min="1" max="100" on:input={(e) => debouncedUpdateCoffeeWeight(e.target.value)} /> -->
            <input id="coffeeWeightGrams" name="coffeWeightGrams" type="number" bind:value={coffeeWeightGrams} min="1" max="100" />

            <div class="input-group">
              <button on:click={() => decrementCoffeeWeight(10)}>−10g</button>
              <button on:click={() => decrementCoffeeWeight(1)}>−</button>
              <button on:click={() => incrementCoffeeWeight(1)}>+</button>
              <button on:click={() => incrementCoffeeWeight(10)}>+10g</button>
            </div>
        </div>
        <div class="calculator-item">
          <label for="roastGrade">Rostgrad:
          <!-- <select id="roastGrade" name="roastGrade" bind:value={roastGrade}>
            <option value="Light">Lätt</option>
            <option value="Medium">Medel</option>
            <option value="Dark">Mörk</option>
          </select> -->
          <div id="roastGrade">
            <svg class="coffee-bean {roastGrade === 'Light' ? 'selected' : ''}" on:click={() => selectRoast('Light')} viewBox="0 0 50 50" width="50" height="50">
              <path fill="#573A29" d="m19.628,19.628c-2.874,2.874-6.532,4.362-9.931,4.362-2.397,0-4.664-.744-6.438-2.26.119-.861,1.174-6.318,9.039-8.776,6.907-2.157,9.26-6.463,10.053-8.881,2.925,4.339,1.881,10.951-2.723,15.554Zm-7.926-8.582c7.864-2.457,8.919-7.914,9.039-8.776C16.451-1.397,9.272-.53,4.372,4.372-.232,8.976-1.276,15.588,1.649,19.926c.793-2.417,3.146-6.723,10.053-8.881Z"/>
            </svg>
            <svg class="coffee-bean {roastGrade === 'Medium' ? 'selected' : ''}" on:click={() => selectRoast('Medium')} viewBox="0 0 50 50" width="50" height="50">
              <path fill="#382518" d="m19.628,19.628c-2.874,2.874-6.532,4.362-9.931,4.362-2.397,0-4.664-.744-6.438-2.26.119-.861,1.174-6.318,9.039-8.776,6.907-2.157,9.26-6.463,10.053-8.881,2.925,4.339,1.881,10.951-2.723,15.554Zm-7.926-8.582c7.864-2.457,8.919-7.914,9.039-8.776C16.451-1.397,9.272-.53,4.372,4.372-.232,8.976-1.276,15.588,1.649,19.926c.793-2.417,3.146-6.723,10.053-8.881Z"/>
            </svg>
            <svg class="coffee-bean {roastGrade === 'Dark' ? 'selected' : ''}" on:click={() => selectRoast('Dark')} viewBox="0 0 50 50" width="50" height="50">
              <path fill="#1F140D" d="m19.628,19.628c-2.874,2.874-6.532,4.362-9.931,4.362-2.397,0-4.664-.744-6.438-2.26.119-.861,1.174-6.318,9.039-8.776,6.907-2.157,9.26-6.463,10.053-8.881,2.925,4.339,1.881,10.951-2.723,15.554Zm-7.926-8.582c7.864-2.457,8.919-7.914,9.039-8.776C16.451-1.397,9.272-.53,4.372,4.372-.232,8.976-1.276,15.588,1.649,19.926c.793-2.417,3.146-6.723,10.053-8.881Z"/>
            </svg>
          </div>
          <div>
            {
              roastGrade === 'Light' ? 'Lätt' :
              roastGrade === 'Medium' ? 'Medel' :
              roastGrade === 'Dark' ? 'Mörk' : ''
            }
          </div>
          </label>
        </div>
        <div class="calculator-item">
          <label for="waterToCoffeeRatio">Kaffe:Vatten-ratio</label>
          <select id="waterToCoffeeRatio" name="waterToCoffeeRatio" bind:value={waterToCoffeeRatio} >
            {#each Array(7).fill().map((_, i) => i + 12) as ratio}
              <option value={ratio}>1:{ratio}</option>
            {/each}
          </select>
          {#if showRecommendation}
            <div>
              <p>Rekommenderad ratio: {recommendedRatio}</p>
              <a href="javascript:void(0)" on:click={changeToRecommendedRatio}>Change to recommendation</a>
              <button on:click={removeRecommendation}>Remove</button>
            </div>
          {/if}
        </div>
        <div class="calculator-item">
          <label for="coffeeStrength">Kaffestyrka:</label>
          <select id="coffeeStrength" name="coffeStrength" bind:value={coffeeStrength}>
            <option value="Strong">Starkt</option>
            <option value="Balanced">Balanserat</option>
            <option value="Weak">Svagt</option>
          </select>
        </div>
        <div class="calculator-item">
          <label for="coffeeTaste">Kaffesmak:</label>
          <select id="coffeeTaste" name="coffeeTaste" bind:value={coffeeTaste}>
            <option value="Acidic">Syrligt</option>
            <option value="Balanced">Balanserat</option>
            <option value="Sweet">Sött</option>
          </select>
        </div>
      </div>
      <div class="test">
        <h4>Kaffevikt</h4>
        <div>{coffeeWeightGrams}<span>g</span></div>
        <input id="coffeeWeightGrams" name="coffeWeightGrams" type="number" min="6" max="76" on:input={(e) => debouncedUpdateCoffeeWeight(e.target.value)} />

      </div>
      {#if inputValidationError}
        <p>{inputValidationError}</p>
      {/if}
      <button on:click={handlePrint}>Skriv ut recept</button>
    </div>
    <div class="instructions">
      <h2>Ingredienser</h2>
      <ul>
        <li>{coffeeWeightGrams}g kaffe</li>
        <li>{waterWeight.toFixed(0)}g vatten</li>
        <li>Temperatur: {brewingTemperature}&deg;C</li>
        <li>Malgrad: ~{recommendedGrindSize}&micro;m</li>
      </ul>
      <h2>Instruktioner</h2>
      <ol>
        <li>Sätt ett V60-filter (eller liknande) i din V60-bryggare.</li>
        <li>Skölj filtret med hett vatten (detta för att eliminera eventuell papperssmak i kaffet).</li>
        <li>Sätt bryggaren uppå en kanna och ställ på en våg.</li>
        <li>Häll i det malda kaffet i filtret i din V60-bryggare. Nollställ vågen så att den står på 0 innan du börjar brygga.</li >
      </ol>
      <h2>Tips</h2>
        <ul>
          <li>Choose your preferred grind size. (Adjust the coarseness so that water atmost completely drips within this total time.)</li>
          <li>The role of the first pour is to moisten the grounds.</li>
          <li>Do not make the next pour until the water completely drips through.</li>
        </ul>
      <h2>Källor</h2>
        <ul>
          <li>Tetsu Kasuya</li>
          <li>Paul från YouTube-kanalen Brewing Habits</li>
        </ul>
    </div>
  </div>
  <div class="generator-body">
    <table>
      <tr>
        <th>Tid</th>
        <th>Vatten (g)</th>
        <th>Total vätska (g)</th>
      </tr>
      {#each brewingSchedule as {startTime, pour, total}, index}
        <tr class="{index === currentStep ? 'active-row' : ''} {index < currentStep ? 'done-row' : ''}">
          <td>{formatTime(startTime)}</td>
          <td>{pour.toFixed(2)}</td>
          <td>{total.toFixed(2)}</td>
        </tr>
      {/each}
    </table>
    {#if !isBrewing}
      <button on:click={startPrepTimer}>Börja brygga</button>
    {/if}

  </div>

<!-- Update the pouring-timeline code -->
<div class="pouring-timeline-carousel" bind:this={carouselContainer}>
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
</div>

<div class="timer-panel">
  {#if isPrepping}
    <div>Get ready! Starting instructions in {prepTime} seconds...</div>
  {:else if isBrewing}
    <span>Step {currentStep + 1} of {brewingSchedule.length}: {formatTime(totalTime)}</span>
  {/if}
</div>


</div>