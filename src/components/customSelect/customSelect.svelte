<script>
  import { onMount } from 'svelte';

  export let options = [];
  export let value;
  export let label = '';
  export let storeName; // Add this prop to identify which store to update

  let isOpen = false;
  let selectedLabel = '';
  let selectContainer;

  $: selectedLabel = options.find(opt => opt.value === value)?.label || '';

  function handleSelect(option) {
    value = option.value;
    if (storeName === 'waterRatio') {
      globalThis.$waterRatio = option.value;
    }
    if (storeName === 'coffeeStrength') {
      globalThis.$coffeeStrength = option.value;
    }
    if (storeName === 'coffeeTaste') {
      globalThis.$coffeeTaste = option.value;
    }
    // Add other store cases as needed
    isOpen = false;
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    isOpen = !isOpen;
  }

  onMount(() => {
    const handleClickOutside = () => {
      isOpen = false;
    };

    document.body.addEventListener('click', handleClickOutside);

    return () => {
      document.body.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<div
  class="custom-select"
  bind:this={selectContainer}
  on:click|stopPropagation
>
  <button
    type="button"
    class="select-button"
    on:click={toggleDropdown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span>{selectedLabel || 'Select option'}</span>
    <svg class="arrow" class:open={isOpen} viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z"/>
    </svg>
  </button>

  {#if isOpen}
    <div
      class="options-container"
      on:click|stopPropagation
    >
      {#each options as option}
        <button
          class="option"
          class:selected={value === option.value}
          on:click={() => handleSelect(option)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style lang="scss">
  .custom-select {
    @apply relative w-full;
  }

  .select-button {
    @apply w-full p-4 border-2 border-black bg-white flex justify-between items-center;
    box-shadow: 2px 2px 0px 0px #000000;

    &:hover {
      @apply bg-[#FFE566];
      transition: background-color 0.2s ease-in-out;
    }
  }

  .options-container {
    @apply absolute w-full mt-2 border-2 border-black bg-white z-50;
    box-shadow: 4px 4px 0px 0px #000000;
    max-height: 300px;
    overflow-y: auto;
  }

  .option {
    @apply w-full p-4 text-left hover:bg-[#FFE566] transition-colors;
    min-height: 48px;

    &.selected {
      @apply bg-[#FFE566];
    }
  }

  .arrow {
    @apply w-6 h-6 transition-transform;
    &.open {
      transform: rotate(180deg);
    }
  }
</style>
