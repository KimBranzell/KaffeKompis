<script>
  import { getBrewingStore } from '../utils/context.js';
  import { BREWING_CONSTANTS } from '../utils/constants.js';
  import { formatTime } from '../utils/formatters.js';
  const { brewingSchedule, currentStep, totalTime } = getBrewingStore();
  let carouselContainer;
  function scrollToStep(index) {
    if (!carouselContainer) return;
    queueMicrotask(() => {
      const step = carouselContainer?.children[index];
      if (step) carouselContainer.scrollTo({ left: step.offsetLeft - carouselContainer.offsetLeft, behavior: 'auto' });
    });
  }
  $: scrollToStep($currentStep);
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex (The horizontal scroll region must be reachable by keyboard.) -->
<div class="pouring-timeline-carousel" bind:this={carouselContainer} tabindex="0" role="region" aria-label="Hällningsschema. Rulla i sidled för att se alla steg.">
  {#each $brewingSchedule as step, index}
    <div class="timeline-step" class:active={index === $currentStep} class:completed={index < $currentStep}
      aria-current={index === $currentStep ? 'step' : undefined}>
      <p class="step-heading">{formatTime(step.startTime)} · Häll {step.pour.toFixed(0)} g</p>
      <p>Vågen ska visa <strong>{step.total.toFixed(0)} g</strong></p>
      <div class="step-bar" aria-hidden="true">
        <span style="width: {index < $currentStep ? 100 : index === $currentStep ? Math.max(0, Math.min(100, ($totalTime - step.startTime) / BREWING_CONSTANTS.CYCLE_DURATION_SECONDS * 100)) : 0}%"></span>
      </div>
    </div>
  {/each}
  {#if !$brewingSchedule.length}<p class="p-4">Ange giltiga värden för att se hällningsschemat.</p>{/if}
</div>

<style>
  .pouring-timeline-carousel { position: fixed; z-index: 15; bottom: 0; left: 0; width: 100%; height: 112px; display: flex; overflow-x: auto; border-top: 3px solid #111; background: var(--surface); color: hsl(var(--foreground)); scroll-snap-type: x proximity; }
  .timeline-step { position: relative; flex: 1 0 225px; min-width: 0; padding: .75rem 1rem; border-right: 2px solid #111; scroll-snap-align: start; }
  .active { background: #ffe566; color: #111; }
  .completed { background: #dff4d7; color: #111; }
  .step-heading { font-weight: 800; }
  .step-bar { margin-top: .5rem; height: 6px; background: #9995; }
  .step-bar span { display: block; height: 100%; background: #237a39; }
</style>
