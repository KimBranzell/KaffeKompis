<script>
  import { getBrewingStore } from '../utils/context.js';
  import { ROASTS } from '../utils/recipe.js';
  const { roastGrade } = getBrewingStore();
</script>

<fieldset class="roast-selector">
  <legend>Rostningsgrad</legend>
  <div class="roast-options">
    {#each ROASTS as { grade, label, temperature, color }}
      <label class:selected={$roastGrade === grade}>
        <input type="radio" name="roast" value={grade} bind:group={$roastGrade} />
        <svg aria-hidden="true" viewBox="0 0 50 50" width="32" height="32">
          <path fill={color} d="m40.9 40.9c-6 6-13.6 9.1-20.7 9.1-5 0-9.7-1.5-13.4-4.7 0.2-1.8 2.4-13.2 18.8-18.3 14.4-4.5 19.3-13.5 21-18.5 6.1 9 3.9 22.8-5.7 32.4zm-37.5 0.6c-6.1-9-3.9-22.8 5.7-32.4 10.2-10.2 25.2-12 34.1-4.4-0.2 1.8-2.4 13.2-18.8 18.3-14.4 4.5-19.3 13.5-21 18.5z" />
        </svg>
        <span>{label}</span><span>{temperature}°C</span>
      </label>
    {/each}
  </div>
</fieldset>

<style>
  fieldset { min-width: 0; border: 0; margin: 1rem 0; padding: 0; }
  legend { font-size: 1.1rem; font-weight: 800; margin-bottom: .75rem; }
  .roast-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
  label { display: flex; min-width: 0; flex-direction: column; align-items: center; gap: .4rem; padding: .75rem .25rem; border: 2px solid #111; background: white; color: #111; font-size: .8rem; font-weight: 700; cursor: pointer; }
  label.selected { background: #ffe680; box-shadow: inset 0 0 0 2px #111; }
  input { accent-color: #111; width: 1.1rem; height: 1.1rem; }
  @media (min-width: 500px) { label { font-size: .95rem; } }
</style>
