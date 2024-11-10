<script>
  export let carouselContainer;
  export let brewingSchedule;
  export let currentStep;
  export let totalTime;
  export let formatTime;
</script>

<div class="pouring-timeline-carousel" bind:this={carouselContainer}>
  {#each $brewingSchedule as step, index}
    <div class="timeline-step {index === currentStep ? 'active' : ''}">
      <div class="step-label">
        <div class="pour-section-label" style="width: {(10 / step.time) * 100}%; display: inline-block;">
          {formatTime(step.startTime)} - {formatTime(step.startTime + 10)}
        </div>
        <div class="wait-section-label" style="width: {((step.time - 10) / step.time) * 100}%; display: inline-block;">
          {formatTime(step.startTime + 10)} - {formatTime(step.startTime + step.time)} - {step.pour.toFixed(2)}g ({step.total.toFixed(2)}g)
        </div>
      </div>
      <div class="step-bar">
        <div class="pour-amount"></div>
        <div class="pour-section" style="width: {(10 / step.time) * 100}%; display: inline-block;">
          {#if index < currentStep || (index === currentStep && totalTime >= step.startTime + 10)}
            <div class="progress-bar completed"></div>
          {:else if index === currentStep}
            <div class="progress-bar" style="width: {((totalTime - step.startTime) / 10) * 100}%;"></div>
          {/if}
        </div>
        <div class="wait-section" style="width: {((step.time - 10) / step.time) * 100}%; display: inline-block;">
          {#if index < currentStep}
            <div class="progress-bar completed"></div>
          {:else if index === currentStep && totalTime >= step.startTime + 10}
            <div class="progress-bar" style="width: {((totalTime - step.startTime - 10) / (step.time - 10)) * 100}%;"></div>
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>