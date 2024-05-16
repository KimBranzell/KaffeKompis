<script>
  const INITIAL_COFFEE_WEIGHT_GRAMS = 20; // grams
  const DEFAULT_WATER_TO_COFFE_RATIO = 15;
  const FIRST_POUR_RATIO = 0.4;
  const SECOND_POUR_RATIO = 0.6;
  const ACIDIC_POUR_FRACTION = 2/3;
  const SWEET_POUR_FRACTION = 1/3;
  const EVEN_POUR_FRACTION = 1/2;

  let coffeeWeightGrams = INITIAL_COFFEE_WEIGHT_GRAMS;
  let waterToCoffeeRatio = DEFAULT_WATER_TO_COFFE_RATIO;
  let coffeeStrength = 'Balanced';
  let coffeeTaste = 'Balanced';
  let inputValidationError = '';
  let brewingSchedule = [];

  // Calculate total water weight
  $: waterWeight = coffeeWeightGrams * waterToCoffeeRatio;

  function calculateFirstAndSecondPours(coffeeTaste, firstPourWater) {
    switch(coffeeTaste) {
      case 'Acidic':
        return [firstPourWater * ACIDIC_POUR_FRACTION, firstPourWater * SWEET_POUR_FRACTION];
      case 'Balanced':
        return [firstPourWater * EVEN_POUR_FRACTION, firstPourWater * EVEN_POUR_FRACTION];
      case 'Sweet':
        return [firstPourWater * SWEET_POUR_FRACTION, firstPourWater * ACIDIC_POUR_FRACTION];
    }
  }

  function calculateSubsequentPours(coffeeStrength, secondPourWater) {
    switch(coffeeStrength) {
      case 'Strong':
        return Array(4).fill(secondPourWater / 4);
      case 'Balanced':
        return Array(3).fill(secondPourWater / 3);
      case 'Weak':
        return Array(2).fill(secondPourWater / 2);
    }
  }

  // Calculate pouring pours and handle inputValidationErrors
  $: {
    inputValidationError = '';  // Reset inputValidationError at the beginning of the block
    if (isNaN(parseFloat(coffeeWeightGrams)) || parseFloat(coffeeWeightGrams) <= 0) {
      inputValidationError = 'Please enter a valid number greater than zero for coffee weight.';
    } else if (isNaN(waterToCoffeeRatio) || waterToCoffeeRatio <= 0) {
      inputValidationError = 'Please enter a valid number for the water to coffee ratio.';
    } else {
      let firstPourWater = waterWeight * FIRST_POUR_RATIO;
      let secondPourWater = waterWeight * SECOND_POUR_RATIO;
      let [firstPour, secondPour] = calculateFirstAndSecondPours(coffeeTaste, firstPourWater);
      let subsequentPours = calculateSubsequentPours(coffeeStrength, secondPourWater);

      // Create brewingSchedule and calculate cumulative totals
      let total = 0;
      brewingSchedule = [firstPour, secondPour, ...subsequentPours].map(pour => {
        total += pour;
        return { pour, total };
      });
    }
  }

  function handlePrint() {
    window.print();
  }
</script>

<style>
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
</style>

<div>
  <div class="generator-header">
    <label for="coffeeWeightGrams">Coffee Weight (grams):
      <input type="number" bind:value={coffeeWeightGrams} min="1" />
    </label>
    <select bind:value={waterToCoffeeRatio}>
      {#each Array(7).fill().map((_, i) => i + 12) as ratio}
        <option value={ratio}>1:{ratio}</option>
      {/each}
    </select>
    <select bind:value={coffeeStrength}>
      <option value="Strong">Starkt</option>
      <option value="Balanced">Balanserat</option>
      <option value="Weak">Svagt</option>
    </select>
    <select bind:value={coffeeTaste}>
      <option value="Acidic">Syrligt</option>
      <option value="Balanced">Balanserat</option>
      <option value="Sweet">Sött</option>
    </select>
    {#if inputValidationError}
      <p>{inputValidationError}</p>
    {/if}
    <button on:click={handlePrint}>Print Recipe</button>
  </div>
  <div class="generator-body">
    <div class="instructions">
      <h2>Ingredienser</h2>
      <div>{waterWeight.toFixed(2)} gram vatten</div>
    </div>
    <table>
      <tr><th>Pour</th><th>Water (g)</th><th>Total (g)</th></tr>
      {#each brewingSchedule as {pour, total}, index}
        <tr><td>{index + 1}</td><td>{pour.toFixed(2)}</td><td>{total.toFixed(2)}</td></tr>
      {/each}
    </table>
  </div>
</div>