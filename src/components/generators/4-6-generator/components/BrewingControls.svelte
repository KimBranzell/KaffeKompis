<script>
  import { getBrewingStore } from '../utils/context.js';
  import { formatTime } from '../utils/formatters.js';
  const { status, isLocked, validationError, totalTime, prepTime, currentStep, brewingSchedule,
    startBrewing, stopBrewing, resetTimerState } = getBrewingStore();
  $: announcement = $status === 'preparing' ? 'Gör dig redo. Bryggningen börjar om fem sekunder.'
    : $status === 'brewing' ? `Steg ${$currentStep + 1} av ${$brewingSchedule.length}: häll ${$brewingSchedule[$currentStep]?.pour.toFixed(0)} gram vatten.`
    : $status === 'completed' ? 'Bryggningen är klar.'
    : $status === 'stopped' ? 'Timern är stoppad. Du kan ändra receptet.' : '';
</script>

<div class="brewing-controls">
  <div class="controls-grid">
    <button type="button" class="action-button" on:click={startBrewing}
      disabled={!!$validationError} aria-label={$isLocked ? 'Starta om bryggning' : 'Starta bryggning'}>
      {$isLocked ? 'Starta om' : 'Brygg kaffe'}
    </button>
    <button type="button" class="action-button secondary" on:click={stopBrewing} disabled={!$isLocked}>Stoppa timer</button>
  </div>
  {#if !$isLocked && $status !== 'idle'}
    <button type="button" class="reset-button" on:click={resetTimerState}>Nollställ timer</button>
  {/if}
  <p class="timer-note">Timern fortsätter i bakgrunden. Tiden uppdateras när du återvänder till sidan.</p>
  <p role="status" class="sr-only" aria-atomic="true">{announcement}</p>
  {#if $status !== 'idle'}
    <div class="brew-timer" aria-hidden="true">
      {#if $status === 'preparing'}Gör dig redo: {$prepTime} s
      {:else if $status === 'completed'}Bryggningen är klar · {formatTime($totalTime)}
      {:else if $status === 'stopped'}Stoppad · {formatTime($totalTime)}
      {:else}Steg {$currentStep + 1} av {$brewingSchedule.length} · {formatTime($totalTime)}{/if}
    </div>
  {/if}
</div>

<style>
  .brewing-controls { margin-top: 1.5rem; }
  .controls-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .75rem; }
  .action-button { padding: .8rem .3rem; border: 2px solid #111; background: #fd9745; color: #111; font-weight: 800; box-shadow: 3px 3px 0 #111; }
  .secondary { background: white; }
  .reset-button { margin-top: 1rem; text-decoration: underline; }
  .timer-note { font-size: .875rem; margin-top: 1rem; }
  .brew-timer { position: fixed; z-index: 15; bottom: 112px; left: 0; width: 100%; padding: .75rem; background: #111; color: white; font-weight: 800; text-align: center; }
  button:disabled { opacity: .55; cursor: not-allowed; }
</style>
