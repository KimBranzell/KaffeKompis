<script>
  import { brewingSchedule, currentStep } from '../utils/brewingStore';

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

</script>

<div class="generator-body px-4 mb-40">
  <table>
    <tbody>
      <tr class="table-head-row">
        <th>Tid</th>
        <th>Vatten (g)</th>
        <th>Total vätska (g)</th>
      </tr>
      {#each $brewingSchedule as {startTime, pour, total}, index}
        <tr class="{index === $currentStep ? 'active-row' : ''} {index < $currentStep ? 'done-row' : ''}">
          <td data-label="Tid">{formatTime(startTime)}</td>
          <td data-label="Vatten">{pour.toFixed(2)}</td>
          <td data-label="Total">{total.toFixed(2)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  @reference "../../../../styles/styles.css";

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

  @media (max-width: 767px) {
    .generator-body {
      @apply px-0 mb-32;
    }

    table,
    tbody {
      @apply block border-0 bg-transparent shadow-none;
    }

    .table-head-row {
      @apply hidden;
    }

    tr {
      @apply mb-4 grid gap-2 rounded-[1.25rem] border-4 border-black bg-white p-4 shadow-[4px_4px_0_#000];
    }

    td {
      @apply flex items-center justify-between border-b-0 p-0 text-sm font-bold;
    }

    td::before {
      content: attr(data-label);
      @apply mr-4 text-xs uppercase tracking-[0.12em] text-black/60;
    }
  }
</style>
