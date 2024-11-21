<script>
  import { onDestroy } from 'svelte';
  import { isBrewing, currentStep, totalTime, brewingSchedule } from '../utils/brewingStore';

  let prepTime = 5;
  let isPrepping = false;
  let intervalId = null;

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

  function startTimer() {
    $isBrewing = true;
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    $totalTime = 0;
    $currentStep = 0;
    intervalId = setInterval(() => {
      $totalTime += 0.1;
      updateCurrentStep();
    }, 100);
  }

  function updateCurrentStep() {
    let timeAccumulated = 0;
    for (let i = 0; i < $brewingSchedule.length; i++) {
      timeAccumulated += $brewingSchedule[i].time;
      if ($totalTime <= timeAccumulated) {
        if ($currentStep !== i) {
          $currentStep = i;
        }
        break;
      }
    }

    if ($totalTime > timeAccumulated) {
      clearInterval(intervalId);
      $isBrewing = false;
    }
  }

  onDestroy(() => {
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
</script>

<div class="flex flex-1 mt-8">
  <button
  class="action-button"
  on:click={startPrepTimer}
  >
    {#if !$isBrewing}
      Brygg kaffe
    {:else}
      Brygger...
    {/if}
  </button>
</div>

{#if isPrepping}
  <div class="prep-timer">Gör dig redo! Instruktionerna börja om {prepTime} sekunder...</div>
{:else if $isBrewing}
  <div class="brew-timer">Step {$currentStep + 1} of {$brewingSchedule.length}: {formatTime($totalTime)}</div>
{/if}

<style lang="scss">
  .action-button {
    @apply px-8 py-4 w-full inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-xl font-bold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }
  .prep-timer, .brew-timer {
    @apply fixed bottom-32 left-0 bg-black text-white w-screen text-xl font-bold text-center p-4;
  }
</style>
