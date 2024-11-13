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

{#if !$isBrewing}
  <button
    class="start-button"
    on:click={startPrepTimer}
  >
    Börja brygga
  </button>
{/if}

{#if isPrepping}
  <div class="prep-timer">Get ready! Starting instructions in {prepTime} seconds...</div>
{:else if $isBrewing}
  <div class="brew-timer">Step {$currentStep + 1} of {$brewingSchedule.length}: {formatTime($totalTime)}</div>
{/if}

<style lang="scss">
  .start-button {
    @apply px-8 py-4 text-xl font-bold bg-main border-4 border-black hover:-translate-y-1 transition-transform;
    box-shadow: 4px 4px 0px 0px #000000;
  }

  .prep-timer, .brew-timer {
    @apply text-xl font-bold text-center p-4;
  }
</style>
