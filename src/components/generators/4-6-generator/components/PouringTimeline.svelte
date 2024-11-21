<script>
  import { brewingSchedule, currentStep, totalTime } from '../utils/brewingStore';

  export let carouselContainer;
  const POUR_TIME = 10; // 15 seconds of pouring
  const CYCLE_TIME = 45; // 45 seconds total per cycle

  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  function scrollToActiveStep() {
    if (carouselContainer) {
      const activeStep = carouselContainer.querySelector('.timeline-step.active');
      if (activeStep) {
        if ($currentStep === 0) {
          carouselContainer.scrollTo({
            left: 0,
            behavior: 'auto'
          });
        } else {
          const offset = carouselContainer.offsetWidth / 2 - activeStep.offsetWidth / 2;
          carouselContainer.scrollTo({
            left: activeStep.offsetLeft - offset,
            behavior: 'auto'
          });
        }
      }
    }
  }

  $: {
    scrollToActiveStep();
  }
  $: stepWidth = $brewingSchedule.length ? `${100 / $brewingSchedule.length}%` : '100%';
</script>

<div class="pouring-timeline-carousel" bind:this={carouselContainer}>
  {#each $brewingSchedule as step, index}
    <div
      class="timeline-step {index === $currentStep ? 'active' : ''} {index < $currentStep ? 'completed' : ''}"
      style="
      width: {stepWidth};
      --progress-width: {index === $currentStep ? (($totalTime - step.startTime) / (CYCLE_TIME)) * 100 + '%' : '0%'}
      "
      >
      <div class="step-label" style="margin-left: -1rem; margin-right: -1rem; width: calc(100% + 2rem)">
        <div class="pour-section-label" style="font-size: 14px; text-align: center; width: {(POUR_TIME / CYCLE_TIME) * 100}%">
          <strong>{formatTime(step.startTime)} - {formatTime(step.startTime + POUR_TIME)}</strong><br />
          häller du {step.pour.toFixed(2)}g ...
        </div>
        <div class="wait-section-label" style="width: {((CYCLE_TIME - POUR_TIME) / CYCLE_TIME) * 100}%">
          {formatTime(step.startTime + POUR_TIME)} - {formatTime(step.startTime + CYCLE_TIME)}
          <br>
           ...upp till {step.total.toFixed(2)}g
        </div>
      </div>
      <div class="step-bar">
        <div class="pour-section">
          {#if index < $currentStep || (index === $currentStep && $totalTime >= step.startTime + POUR_TIME)}
            <div class="progress-bar completed"></div>
          {:else if index === $currentStep}
            <div class="progress-bar" style="width: {(($totalTime - step.startTime) / POUR_TIME) * 100}%;"></div>
          {/if}
        </div>
        <div class="wait-section">
          {#if index < $currentStep}
            <div class="progress-bar completed"></div>
          {:else if index === $currentStep && $totalTime >= step.startTime + POUR_TIME}
            <div class="progress-bar" style="width: {(($totalTime - step.startTime - POUR_TIME) / (CYCLE_TIME - POUR_TIME)) * 100}%;"></div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .pouring-timeline-carousel {
    @apply fixed bottom-0 left-0 w-full border-t-4 bg-white border-black overflow-x-auto;
    height: 128px;
  }

  // .timeline-step {
  //   @apply inline-block min-w-[300px] border-r-4 h-full p-4 border-black;

  //   &.active {
  //     @apply bg-[#FFE566];
  //   }
  // }

  .timeline-step {
    @apply inline-block min-w-[300px] border-r-4 h-full p-4 border-black relative overflow-hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: calc((10 / 45) * 100%);  // POUR_TIME / CYCLE_TIME
      height: 100%;
      width: 2px;
      background-color: black;
      opacity: 0.3;
      z-index: 1;
    }
    &.active {
      @apply bg-[#FFE566];

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: #4CAF50;
        width: var(--progress-width, 0%);
        transition: width 0.3s linear;
        z-index: 0;
        opacity: 0.5;
      }
    }

    &.completed {
      @apply bg-[#4CAF50];
    }
  }

  // Make sure the content stays above the background
  .step-label, .step-bar {
    position: relative;
    z-index: 1;
  }
  .step-bar {
    @apply h-12 relative flex w-full;
  }

  .pour-section, .wait-section {
    @apply relative h-full;
  }

  .step-label {
    @apply flex w-full mb-2;
  }

  .pour-section-label, .wait-section-label {
    @apply px-4;
  }

  .progress-bar {
    @apply absolute bottom-0 left-0 w-full bg-[#4CAF50] transition-all duration-300 ease-linear;
    height: 100%;
    &.completed {
      @apply h-full;
    }
  }
</style>
