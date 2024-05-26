<script>
  import { onDestroy, tick } from 'svelte';

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

  // Recipe timer
  let prepTime = 5; // 5 seconds for preparation
  let totalTime = 0; // Total time for the brewing process
  let isBrewing = false; // State to track if brewing has started
  let isPouring = false; // State to track if pouring has started
  let isPrepping = false; // State to track if preparation has started
  let currentStep = 0;
  let intervalId = null;
  let totalBrewingTime;

  let progressWidth = 0; // This will represent the width of the progress bar


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
    isPouring = true; // Ensure pouring starts immediately with the brewing
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    totalTime = 0;
    currentStep = 0; // Ensure we start from the first step
    intervalId = setInterval(() => {
      totalTime++;
      updateCurrentStep();
      updateProgressBar();
    }, 1000);
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

      // Handle pouring progress and amount
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
    const remainingSeconds = seconds % 60;
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
      parseFloat(coffeeWeightGrams) <= 0
    ) {
      inputValidationError =
        "Please enter a valid number greater than zero for coffee weight.";
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
          console.log(startTime);
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

  /**
   * Prints the current page.
   */
  function handlePrint() {
    window.print();
  }
</script>


<style lang="scss">
  input, select, button {
    margin: 10px;
    padding: 8px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid black;
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
    transition: width 1s linear;
    position: absolute;
  }

  .pouring-progress-bar {
    height: 100%;
    line-height: 30px; /* Align text vertically */
    text-align: center;
    transition: width 1s linear;
    position: absolute;
    background-color: blue; /* Different color for pouring progress */
    bottom: 66px;
  }
</style>

<div class="four-six-generator">
  <div class="u-container u-grid">
    <div class="generator-header">
      <label for="coffeeWeightGrams">Kaffevikt (gram):
        <input type="number" bind:value={coffeeWeightGrams} min="1" />
      </label>
      <label for="roastGrade">Rostgrad:
        <select name="roastGrade" bind:value={roastGrade}>
          <option value="Light">Lätt</option>
          <option value="Medium">Medel</option>
          <option value="Dark">Mörk</option>
        </select>
      </label>
      <label for="waterToCoffeeRatio">Kaffe:Vatten-ratio
        <select bind:value={waterToCoffeeRatio}>
          {#each Array(7).fill().map((_, i) => i + 12) as ratio}
            <option value={ratio}>1:{ratio}</option>
          {/each}
        </select>
      </label>
      <label for="coffeeStrength">Kaffestyrka:
        <select bind:value={coffeeStrength}>
          <option value="Strong">Starkt</option>
          <option value="Balanced">Balanserat</option>
          <option value="Weak">Svagt</option>
        </select>
      </label>
      <label for="coffeeTaste">Kaffesmak:
        <select bind:value={coffeeTaste}>
          <option value="Acidic">Syrligt</option>
          <option value="Balanced">Balanserat</option>
          <option value="Sweet">Sött</option>
        </select>
      </label>
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
      </ul>
      <h2>Steg</h2>
      <ol>
        <li>Rinse the paper filter with hot water.</li>
        <li>Divide the total amount of water to be poured into 40% and 60%</li>
      </ol>

      <h3>Tips</h3>
        <ul>
          <li>Choose your preferred grind size. (Adjust the coarseness so that water atmost completely drips within this total time.)</li>
          <li>The role of the first pour is to moisten the grounds.</li>
          <li>Do not make the next pour until the water completely drips through.</li>
        </ul>
    </div>
    <div class="generator-body">
      <table>
        <tr>
          <th>Tid</th>
          <th>Vatten (g)</th>
          <th>Total vätska (g)</th>
        </tr>
        {#each brewingSchedule as {startTime, pour, total}, index}
          <tr>
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
  </div>

  {#if isBrewing || isPrepping}
  <div class="timer-panel">
    <div class="progress-bar" style="width: {progressWidth}%;"></div>
    {#if isPouring}
      <div class="pouring-progress-bar" style="width: {pouringProgress}%;"></div>
      <div>Pouring: {currentPourAmount.toFixed(2)}g of {brewingSchedule[currentStep].pour.toFixed(2)}g</div>
    {/if}
    {#if isPrepping}
      <div>Gör dig redo! Startar instruktionerna om {prepTime} sekunder...</div>
    {:else if isBrewing}
      <span>Steg {currentStep + 1} av {brewingSchedule.length}: {formatTime(totalTime)}</span>
    {/if}
  </div>
  {/if}
</div>