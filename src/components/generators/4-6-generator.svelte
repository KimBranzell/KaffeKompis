<script>
  let coffeeWeight = 20; // default coffee weight in grams
  let waterRatio = 15; // default water ratio, can be changed via dropdown
  let strength = 'Balanced'; // default strength
  let taste = 'Balanced'; // default taste
  let error = '';
  let schedule = [];

  // Calculate total water weight
  $: waterWeight = coffeeWeight * waterRatio;

  function calculateFirstAndSecondPours(taste, firstPourWater) {
    switch(taste) {
      case 'Acidic':
        return [firstPourWater * (2/3), firstPourWater * (1/3)];
      case 'Balanced':
        return [firstPourWater / 2, firstPourWater / 2];
      case 'Sweet':
        return [firstPourWater * (1/3), firstPourWater * (2/3)];
    }
  }

  function calculateSubsequentPours(strength, secondPourWater) {
    switch(strength) {
      case 'Strong':
        return Array(4).fill(secondPourWater / 4);
      case 'Balanced':
        return Array(3).fill(secondPourWater / 3);
      case 'Weak':
        return Array(2).fill(secondPourWater / 2);
    }
  }

  // Calculate pouring pours
  $: {
    error = '';
    // Reset error at the beginning of the block
    // TODO: Validate input, make sure the number a number, and positive.
    if (isNaN(coffeeWeight) || coffeeWeight === '') {
      error = 'Please enter a valid number for coffee weight.';
    } else {
      let firstPourWater = waterWeight * 0.4;
      let secondPourWater = waterWeight * 0.6;
      let [firstPour, secondPour] = calculateFirstAndSecondPours(taste, firstPourWater);
      let subsequentPours = calculateSubsequentPours(strength, secondPourWater);

      // Create schedule and calculate cumulative totals
      let total = 0;
      schedule = [firstPour, secondPour, ...subsequentPours].map(pour => {
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
  <label for="coffeeWeight">Coffee Weight (grams):
    <input type="number" bind:value={coffeeWeight} min="1" />
  </label>
  <select bind:value={waterRatio}>
    {#each Array(7).fill().map((_, i) => i + 12) as ratio}
      <option value={ratio}>{ratio}</option>
    {/each}
  </select>
  <select bind:value={strength}>
    <option value="Strong">Starkt</option>
    <option value="Balanced">Balanserat</option>
    <option value="Weak">Svagt</option>
  </select>
  <select bind:value={taste}>
    <option value="Acidic">Syrligt</option>
    <option value="Balanced">Balanserat</option>
    <option value="Sweet">Sött</option>
  </select>
  {#if error}
    <p>{error}</p>
  {/if}
  <button on:click={handlePrint}>Print Recipe</button>
  <table>
    <tr><th>Pour</th><th>Water (g)</th><th>Total (g)</th></tr>
    {#each schedule as {pour, total}, index}
      <tr><td>{index + 1}</td><td>{pour.toFixed(2)}</td><td>{total.toFixed(2)}</td></tr>
    {/each}
  </table>
</div>