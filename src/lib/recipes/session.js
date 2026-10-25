import { writable, derived, get } from 'svelte/store';
import { scaleBrewPlan, stepAtTime } from './brewing.js';

/** One immutable brew per session. Waiting for drainage ends by user confirmation. */
export function createRecipeSession() {
  const status = writable('idle');
  const elapsedSeconds = writable(0);
  const activeBrew = writable(null);
  const locked = derived(status, value => value === 'brewing');
  const currentStep = derived([activeBrew, elapsedSeconds], ([brew, seconds]) => brew ? stepAtTime(brew.steps, seconds) : 0);
  let interval;
  let startedAt = 0;
  function clearTimer() { if (interval !== undefined) clearInterval(interval); interval = undefined; }
  function refresh() {
    if (get(locked)) elapsedSeconds.set(Math.max(0, (Date.now() - startedAt) / 1000));
  }
  function start(plan, dose) {
    if (get(locked)) return false;
    const scaled = scaleBrewPlan(plan, dose);
    if (!scaled) return false;
    clearTimer();
    activeBrew.set(structuredClone(scaled));
    elapsedSeconds.set(0);
    startedAt = Date.now();
    status.set('brewing');
    interval = setInterval(refresh, 100);
    return true;
  }
  function stop() { refresh(); clearTimer(); status.set('stopped'); }
  function complete() {
    if (!get(locked)) return false;
    refresh(); clearTimer(); status.set('completed'); return true;
  }
  function reset() { clearTimer(); status.set('idle'); activeBrew.set(null); elapsedSeconds.set(0); }
  return { status, elapsedSeconds, activeBrew, locked, currentStep, start, stop, complete, reset, refresh, destroy: clearTimer };
}
