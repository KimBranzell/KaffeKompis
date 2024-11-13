<script>
  import { brewingSchedule, currentStep, totalTime } from '../utils/brewingStore';

  export let carouselContainer;

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
</script>

<div class="pouring-timeline-carousel" bind:this={carouselContainer}>
  {#each $brewingSchedule as step, index}
    <div class="timeline-step {index === $currentStep ? 'active' : ''}">
      <div class="step-label">
        <div class="pour-section-label" style="width: {(10 / step.time) * 100}%">
          {formatTime(step.startTime)} - {formatTime(step.startTime + 10)}
        </div>
        <div class="wait-section-label" style="width: {((step.time - 10) / step.time) * 100}%">
          {formatTime(step.startTime + 10)} - {formatTime(step.startTime + step.time)}
          <br>
          {step.pour.toFixed(2)}g ({step.total.toFixed(2)}g)
        </div>
      </div>
      <div class="step-bar">
        <div class="pour-section">
          {#if index < $currentStep || (index === $currentStep && $totalTime >= step.startTime + 10)}
            <div class="progress-bar completed"></div>
          {:else if index === $currentStep}
            <div class="progress-bar" style="width: {(($totalTime - step.startTime) / 10) * 100}%;"></div>
          {/if}
        </div>
        <div class="wait-section">
          {#if index < $currentStep}
            <div class="progress-bar completed"></div>
          {:else if index === $currentStep && $totalTime >= step.startTime + 10}
            <div class="progress-bar" style="width: {(($totalTime - step.startTime - 10) / (step.time - 10)) * 100}%;"></div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>

<style lang="scss">
  .pouring-timeline-carousel {
    @apply fixed bottom-0 left-0 w-full border-t-4 bg-white border-black overflow-x-auto;
    height: 120px;
  }

  .timeline-step {
    @apply inline-block min-w-[300px] border-r-4 h-full p-4 border-black;

    &.active {
      @apply bg-[#FFE566];
    }
  }

  .step-bar {
    @apply h-12 relative flex w-full;
  }

  .pour-section, .wait-section {
    @apply relative h-full;
  }

  .progress-bar {
    @apply absolute bottom-0 left-0 w-full bg-[#4CAF50] transition-all;

    &.completed {
      @apply h-full;
    }
  }
</style>
