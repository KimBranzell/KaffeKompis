<script>
  let coffeeWeight = 20; // default coffee weight in grams
  let waterRatio = 15; // default water ratio, can be changed via dropdown
  let strength = 'Balanced'; // default strength
  let taste = 'Balanced'; // default taste
  let error = '';
  let schedule = [];

  // Calculate total water weight
  $: waterWeight = coffeeWeight * waterRatio;

  // Calculate pouring pours
  $: {
    if (isNaN(coffeeWeight) || coffeeWeight === '') {
      error = 'Please enter a valid number for coffee weight.';
    }
    error = '';
    let firstPourWater = waterWeight * 0.4;
    let secondPourWater = waterWeight * 0.6;
    let firstPour, secondPour, subsequentPours;

    // Determine pours for the 40% pour
    switch(taste) {
      case 'Acidic':
        firstPour = firstPourWater * (2/3);
        secondPour = firstPourWater * (1/3);
        break;
      case 'Balanced':
        firstPour = secondPour = firstPourWater / 2;
        break;
      case 'Sweet':
        firstPour = firstPourWater * (1/3);
        secondPour = firstPourWater * (2/3);
        break;
    }

    // Determine pours for the 60% pour
    switch(strength) {
      case 'Strong':
        subsequentPours = Array(4).fill(secondPourWater / 4);
        break;
      case 'Balanced':
        subsequentPours = Array(3).fill(secondPourWater / 3);
        break;
      case 'Weak':
        subsequentPours = Array(2).fill(secondPourWater / 2);
        break;
    }

    // Create schedule and calculate cumulative totals
    let total = 0;
    schedule = [firstPour, secondPour, ...subsequentPours].map(pour => {
      total += pour;
      return { pour, total };
    });
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
  <input type="number" bind:value={coffeeWeight} min="1" />
  <select bind:value={waterRatio}>
    {#each Array(7).fill().map((_, i) => i + 12) as ratio}
      <option value={ratio}>{ratio}</option>
    {/each}
  </select>
  <select bind:value={strength}>
    <option value="Strong">Strong</option>
    <option value="Balanced">Balanced</option>
    <option value="Weak">Weak</option>
  </select>
  <select bind:value={taste}>
    <option value="Acidic">Acidic</option>
    <option value="Balanced">Balanced</option>
    <option value="Sweet">Sweet</option>
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