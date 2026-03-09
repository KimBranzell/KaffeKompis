<script>
  import { onDestroy } from "svelte";
  import {
    isBrewing,
    currentStep,
    totalTime,
    brewingSchedule,
    resetTimerState,
  } from "../utils/brewingStore";
  import { BREWING_CONSTANTS } from "../utils/constants";

  let prepTime = BREWING_CONSTANTS.PREP_DURATION_SECONDS;
  let isPrepping = false;
  let intervalId = null;

  function clearCurrentTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startPrepTimer() {
    if (!$brewingSchedule.length) {
      return;
    }

    clearCurrentTimer();
    resetTimerState();
    prepTime = BREWING_CONSTANTS.PREP_DURATION_SECONDS;
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

  function startTimer() {
    $isBrewing = true;
    clearCurrentTimer();
    $totalTime = 0;

    const lastStepStartTime = $brewingSchedule[$brewingSchedule.length - 1]?.startTime ?? 0;
    const totalDuration = lastStepStartTime + BREWING_CONSTANTS.CYCLE_DURATION_SECONDS;

    intervalId = setInterval(() => {
      const nextTime = Number(($totalTime + 0.1).toFixed(1));

      if (nextTime >= totalDuration) {
        $totalTime = totalDuration;
        stopBrewing();
        return;
      }

      $totalTime = nextTime;
    }, 100);
  }

  function stopBrewing() {
    clearCurrentTimer();
    isPrepping = false;
    $isBrewing = false;
  }

  onDestroy(() => {
    clearCurrentTimer();
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function formatTimeAnnouncement(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes} minuter och ${remainingSeconds} sekunder`;
  }
</script>

<div class="flex flex-1 mt-8">
  <h2 class="sr-only">Kaffebryggarkontroller</h2>

  <div class="grid w-full gap-4 md:grid-cols-2">
    <button
      type="button"
      class="action-button"
      on:click={startPrepTimer}
      aria-label={$isBrewing ? "Starta om bryggning" : "Starta bryggning"}
      aria-pressed={$isBrewing}
    >
      {#if isPrepping}
        Gor dig redo...
      {:else if !$isBrewing}
        Brygg kaffe
      {:else}
        Starta om
      {/if}
    </button>

    <button
      type="button"
      class="action-button action-button--secondary"
      on:click={stopBrewing}
      disabled={!$isBrewing && !isPrepping}
    >
      Stoppa timer
    </button>
  </div>
</div>

{#if isPrepping}
  <div class="prep-timer" role="status" aria-live="polite">
    <span class="sr-only">
      Gor dig redo! Instruktionerna borjar om {formatTimeAnnouncement(prepTime)}
    </span>
    <span aria-hidden="true">
      Gor dig redo! Instruktionerna borjar om {prepTime} sekunder...
    </span>
  </div>
{:else if $isBrewing}
  <div class="brew-timer" role="status" aria-live="polite">
    <span class="sr-only">
      Steg {$currentStep + 1} av {$brewingSchedule.length}, tidsförbrukning: {formatTimeAnnouncement(
        $totalTime
      )}
    </span>
    <span aria-hidden="true">
      Steg {$currentStep + 1} av {$brewingSchedule.length}: {formatTime(
        $totalTime
      )}
    </span>
  </div>
{/if}

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .action-button {
    @apply px-8 py-4 w-full inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-xl font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }

  .action-button--secondary {
    @apply bg-white;
  }

  .prep-timer,
  .brew-timer {
    @apply fixed bottom-32 left-0 bg-black text-white w-screen text-xl font-bold text-center p-4;
  }

  @media (max-width: 767px) {
    .prep-timer,
    .brew-timer {
      @apply bottom-24 px-4 py-3 text-base;
    }
  }
</style>
