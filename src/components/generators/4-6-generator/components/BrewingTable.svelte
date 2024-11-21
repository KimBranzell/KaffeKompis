<script>
  import { brewingSchedule, currentStep } from '../utils/brewingStore';

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  $: console.log('Brewing schedule:', $brewingSchedule);

</script>

<div class="generator-body mb-40">
  <table>
    <tbody>
      <tr>
        <th>Tid</th>
        <th>Vatten (g)</th>
        <th>Total vätska (g)</th>
      </tr>
      {#each $brewingSchedule as {startTime, pour, total}, index}
        <tr class="{index === $currentStep ? 'active-row' : ''} {index < $currentStep ? 'done-row' : ''}">
          <td>{formatTime(startTime)}</td>
          <td>{pour.toFixed(2)}</td>
          <td>{total.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  table {
    @apply w-full border-4 border-black bg-white mb-8;
    box-shadow: 4px 4px 0px 0px #000000;

    th {
      @apply bg-black text-white p-4 text-left;
    }

    td {
      @apply p-4 border-b-2 border-black;
    }
  }

  .active-row {
    @apply bg-[#FFE566];
    animation: highlightRow 0.5s ease;
  }

  .done-row {
    @apply bg-[#C1FF9B];
    animation: doneEffect 1s forwards;
  }

  @keyframes highlightRow {
    0% { background-color: transparent; }
    100% { background-color: #FFE566; }
  }

  @keyframes doneEffect {
    0% { background-color: #FFE566; }
    100% { background-color: #C1FF9B; }
  }
</style>
