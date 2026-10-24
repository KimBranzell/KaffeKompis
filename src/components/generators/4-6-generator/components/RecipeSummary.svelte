<script>
  import { OPTION_SETS, BREWING_CONSTANTS } from '../utils/constants';

  export let coffeeWeight;
  export let waterWeight;
  export let waterRatio;
  export let temperature;
  export let strength;
  export let taste;
  export let brewingSchedule = [];

  const tasteBreakdown = {
    Acidic: '67/33 av de första 40%',
    Balanced: '50/50 av de första 40%',
    Sweet: '33/67 av de första 40%',
  };

  const strengthBreakdown = {
    Strong: '4 hällningar på 15% av totalvattnet',
    Balanced: '3 hällningar på 20% av totalvattnet',
    Weak: '2 hällningar på 30% av totalvattnet',
  };

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  $: totalPours = brewingSchedule.length;
  $: totalBrewTime = brewingSchedule.length
    ? brewingSchedule[brewingSchedule.length - 1].startTime + BREWING_CONSTANTS.CYCLE_DURATION_SECONDS
    : 0;
</script>

<section class="recipe-summary border-4 border-black bg-[#111111] text-[#fff8e8]" aria-label="Sammanfattning av receptet">
  <div class="summary-header">
    <div>
      <p class="summary-kicker">Receptöversikt</p>
      <h2 class="summary-title">Din nuvarande 4:6-bryggning i ett snabbt block.</h2>
    </div>
    <p class="summary-copy">
      Se tid, vattenmängd och hällningar innan du startar timern.
    </p>
  </div>

  <div class="summary-grid summary-grid--metrics">
    <article class="summary-card summary-card--light">
      <span class="summary-label">Dos</span>
      <strong>{coffeeWeight} g kaffe</strong>
      <span>{waterWeight.toFixed(0)} g vatten vid 1:{waterRatio}</span>
    </article>
    <article class="summary-card summary-card--light">
      <span class="summary-label">Bryggtid</span>
      <strong>{formatTime(totalBrewTime)}</strong>
      <span>{totalPours} hällningar totalt</span>
    </article>
    <article class="summary-card summary-card--light">
      <span class="summary-label">Temperatur</span>
      <strong>{temperature}°C</strong>
      <span>Baseras på vald rostning</span>
    </article>
  </div>

  <div class="summary-grid summary-grid--breakdown">
    <article class="summary-card">
      <span class="summary-label">Smakprofil</span>
      <strong>{OPTION_SETS.tasteOptions.find(option => option.value === taste)?.label}</strong>
      <span>{tasteBreakdown[taste]}</span>
    </article>
    <article class="summary-card">
      <span class="summary-label">Styrkeprofil</span>
      <strong>{OPTION_SETS.strengthOptions.find(option => option.value === strength)?.label}</strong>
      <span>{strengthBreakdown[strength]}</span>
    </article>
  </div>
</section>

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .recipe-summary {
    @apply rounded-[1.75rem] p-5 shadow-[8px_8px_0_#000] md:p-7;
  }

  .summary-header {
    @apply grid gap-4 border-b-2 border-dashed border-[#ffd166] pb-5 md:grid-cols-[1.15fr_0.85fr] md:items-start;
  }

  .summary-kicker {
    @apply text-xs font-black uppercase tracking-[0.2em] text-[#ffd166];
  }

  .summary-title {
    @apply mt-3 text-2xl font-black leading-tight md:text-3xl;
  }

  .summary-copy {
    @apply text-sm leading-7 text-[#f2e6c7] md:text-base;
  }

  .summary-grid {
    @apply mt-5 grid gap-4;
  }

  .summary-grid--metrics {
    @apply md:grid-cols-3;
  }

  .summary-grid--breakdown {
    @apply md:grid-cols-2;
  }

  .summary-card {
    @apply grid gap-2 rounded-[1.25rem] border-3 border-[#ffd166] bg-[#1c1c1c] p-4;
  }

  .summary-card--light {
    @apply border-black bg-[#fff7ed] text-black;
  }

  .summary-card strong {
    @apply text-xl font-black leading-tight;
  }

  .summary-card span:last-child {
    @apply text-sm leading-6 opacity-80;
  }

  .summary-label {
    @apply text-xs font-black uppercase tracking-[0.16em] opacity-70;
  }
</style>