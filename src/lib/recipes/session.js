import { writable, derived, get } from 'svelte/store';
import { scaleBrewPlan } from './brewing.js';

/** One immutable brew per session. Drainage and pressing end by user confirmation. */
export function createRecipeSession() {
  const status = writable('idle');
  const elapsedSeconds = writable(0);
  const activeBrew = writable(null);
  const locked = derived(status, value => value === 'brewing');
  const currentStep = writable(0);
  const remainingSeconds = writable(null);
  let interval;
  let startedAt = 0;
  let scheduleOffset = 0;
  function clearTimer() { if (interval !== undefined) clearInterval(interval); interval = undefined; }
  function refresh() {
    if (!get(locked)) return;
    const elapsed = Math.max(0, (Date.now() - startedAt) / 1000);
    elapsedSeconds.set(elapsed);
    const { steps } = get(activeBrew);
    let index = get(currentStep);
    // Stirring is physical work: never skip it when a callback arrives late.
    while (index < steps.length - 1 && steps[index].kind !== 'stir' && elapsed >= steps[index + 1].atSeconds + scheduleOffset) index++;
    currentStep.set(index);
    remainingSeconds.set(steps[index].kind === 'stir' || !steps[index + 1] ? null : Math.max(0, steps[index + 1].atSeconds + scheduleOffset - elapsed));
  }
  function start(plan, dose) {
    if (get(locked)) return false;
    const scaled = scaleBrewPlan(plan, dose);
    if (!scaled) return false;
    clearTimer();
    activeBrew.set(structuredClone(scaled));
    elapsedSeconds.set(0);
    currentStep.set(0);
    scheduleOffset = 0;
    startedAt = Date.now();
    status.set('brewing');
    refresh();
    interval = setInterval(refresh, 100);
    return true;
  }
  function stop() { refresh(); clearTimer(); status.set('stopped'); }
  function advance() {
    if (!get(locked)) return false;
    refresh();
    const { steps } = get(activeBrew);
    const index = get(currentStep);
    if (steps[index].kind !== 'stir' || !steps[index + 1]) return false;
    // Shift subsequent targets so the full steep starts at this confirmation.
    scheduleOffset = get(elapsedSeconds) - steps[index + 1].atSeconds;
    currentStep.set(index + 1);
    refresh();
    return true;
  }
  function complete() {
    if (!get(locked)) return false;
    refresh();
    if (get(currentStep) !== get(activeBrew).steps.length - 1) return false;
    clearTimer(); status.set('completed'); return true;
  }
  function reset() { clearTimer(); status.set('idle'); activeBrew.set(null); elapsedSeconds.set(0); currentStep.set(0); remainingSeconds.set(null); scheduleOffset = 0; }
  return { status, elapsedSeconds, activeBrew, locked, currentStep, remainingSeconds, start, stop, advance, complete, reset, refresh, destroy: clearTimer };
}
