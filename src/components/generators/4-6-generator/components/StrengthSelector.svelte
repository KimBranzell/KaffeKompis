<script>
  import { OPTION_SETS } from '../utils/constants';
  import { strength } from '../utils/brewingStore';
</script>

<div class="select-container">
  <label for="coffee-strength" class="select-headline">Kaffestyrka</label>
  <select
    id="coffee-strength"
    class="action-button w-full"
    bind:value={$strength}
  >
    {#each OPTION_SETS.strengthOptions as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

<style lang="scss">
  .select-container {
    select {
      @apply w-full p-4 border-4 border-black bg-white;
      box-shadow: 2px 2px 0px 0px #000000;
      transform-origin: top;
      animation: selectAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

      &:focus {
        @apply outline-none -translate-x-1 -translate-y-1;
      }
    }
  }
</style>