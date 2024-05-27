<script>
  let coffeeToWaterRatio = 16; // Default value for ratio
  let water = 80;
  let coffee = 5;

  // Function to calculate coffee based on water and ratio
  function calculateCoffee() {
    coffee = (water / coffeeToWaterRatio).toFixed(2);
  }

  // Function to calculate water based on coffee and ratio
  function calculateWater() {
    water = (coffee * coffeeToWaterRatio).toFixed(2);
  }

  // Update ratio based on slider
  function updateRatio(value) {
    coffeeToWaterRatio = value;
    calculateCoffee();
  }
</script>

<div>
  <div>
    <label for="ratio">Coffee to Water Ratio:</label>
    <input type="number" name="ratio" id="ratio" bind:value={coffeeToWaterRatio} on:input={calculateCoffee}>
  </div>
  <div>
    <label for="water">Water (in grams):</label>
    <input type="number" name="water" id="water" bind:value={water} on:input={calculateCoffee}>
  </div>
  <div>
    <label for="coffee">Coffee (in grams):</label>
    <input type="number" name="coffee" id="coffee" bind:value={coffee} on:input={calculateWater}>
  </div>
  <div>
    <label for="strength">Strength:</label>
    <input
      type="range"
      id="strength"
      min="15"
      max="17"
      step="0.1"
      on:input={(e) => updateRatio(parseFloat(e.target.value))}
    >
    <span>Weak</span> <span>Strong</span>
  </div>
</div>
