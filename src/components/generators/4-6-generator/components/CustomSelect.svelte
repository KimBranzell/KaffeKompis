<script>
  import { onMount } from 'svelte';

  export let headline = "";
  export let options = [];
  export let value;
  export let label = '';
  export let id = crypto.randomUUID();

  let isOpen = false;
  let selectedLabel = '';
  let selectContainer;
  let optionNodes = [];
  let activeIndex = -1;

  $: selectedLabel = options.find(opt => opt.value === value)?.label || '';

  function handleSelect(option) {
    value = option.value;
    isOpen = false;
    // restore focus to trigger after select
    const trigger = document.getElementById(`${id}-trigger`);
    trigger?.focus();
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    isOpen = !isOpen;
    if (isOpen) {
      // set active index to selected or first
      activeIndex = options.findIndex(o => o.value === value);
      if (activeIndex < 0) activeIndex = 0;
      // focus the option node
      setTimeout(() => optionNodes[activeIndex]?.focus(), 0);
    } else {
      activeIndex = -1;
    }
  }

  function onTriggerKeydown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        isOpen = true;
        activeIndex = options.findIndex(o => o.value === value);
        if (activeIndex < 0) activeIndex = 0;
        setTimeout(() => optionNodes[activeIndex]?.focus(), 0);
      }
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown(e);
    }
  }

  function onOptionKeydown(e, idx, option) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(idx + 1, options.length - 1);
      activeIndex = next;
      optionNodes[next]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(idx - 1, 0);
      activeIndex = prev;
      optionNodes[prev]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isOpen = false;
      document.getElementById(`${id}-trigger`)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(option);
    }
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

<div class="select-container">
  {#if headline}
    <label class="select-headline" id={`${id}-label`}>{headline}</label>
  {/if}
  <div
    class="custom-select"
    bind:this={selectContainer}
    on:click|stopPropagation
  >
    <button
      type="button"
      id={`${id}-trigger`}
      class="select-button"
      on:click={toggleDropdown}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-labelledby={headline ? `${id}-label` : `${id}-trigger`}
      aria-controls={`${id}-listbox`}
    >
      <span>{selectedLabel || 'Select option'}</span>
      <svg class="arrow" class:open={isOpen} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M7 10l5 5 5-5z"/>
      </svg>
    </button>

    {#if isOpen}
      <div
        id={`${id}-listbox`}
        class="options-container"
        role="listbox"
        aria-labelledby={headline ? `${id}-label` : undefined}
        on:click|stopPropagation
      >
        {#each options as option, idx}
          <div
            role="option"
            class="option"
            class:selected={value === option.value}
            aria-selected={value === option.value}
            tabindex="0"
            bind:this={el => optionNodes[idx] = el}
            on:click={() => handleSelect(option)}
            on:keydown={(e) => onOptionKeydown(e, idx, option)}
          >
            {option.label}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @reference "../../../../styles/styles.css";

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
