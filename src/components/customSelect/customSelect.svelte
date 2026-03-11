<script>
  import { onMount } from 'svelte';

  export let options = [];
  export let value;
  export let label = '';
  export let storeName; // Add this prop to identify which store to update
  export let id = crypto.randomUUID();

  let isOpen = false;
  let selectedLabel = '';
  let selectContainer;
  let optionNodes = [];
  let activeIndex = -1;
  let typeaheadBuffer = '';
  let typeaheadTimeout = null;
  const TYPEAHEAD_TIMEOUT = 500; // ms

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
    document.getElementById(`${id}-trigger`)?.focus();
  }

  function toggleDropdown(event) {
    event.stopPropagation();
    isOpen = !isOpen;
    if (isOpen) {
      activeIndex = options.findIndex(o => o.value === value);
      if (activeIndex < 0) activeIndex = 0;
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
    // Open + focus first/last on Home/End
    if (e.key === 'Home') {
      e.preventDefault();
      if (!isOpen) isOpen = true;
      activeIndex = 0;
      setTimeout(() => optionNodes[activeIndex]?.focus(), 0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      if (!isOpen) isOpen = true;
      activeIndex = options.length - 1;
      setTimeout(() => optionNodes[activeIndex]?.focus(), 0);
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
    } else if (e.key === 'Home') {
      e.preventDefault();
      activeIndex = 0;
      optionNodes[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      activeIndex = options.length - 1;
      optionNodes[activeIndex]?.focus();
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      const next = Math.min(idx + 10, options.length - 1);
      activeIndex = next;
      optionNodes[next]?.focus();
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      const prev = Math.max(idx - 10, 0);
      activeIndex = prev;
      optionNodes[prev]?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      isOpen = false;
      document.getElementById(`${id}-trigger`)?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(option);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Typeahead: accumulate a short buffer and jump to matching option
      const char = e.key.toLowerCase();
      clearTimeout(typeaheadTimeout);
      typeaheadBuffer += char;
      typeaheadTimeout = setTimeout(() => {
        typeaheadBuffer = '';
      }, TYPEAHEAD_TIMEOUT);

      const start = idx + 1;
      const combined = options.slice(start).concat(options.slice(0, start));
      const foundIndex = combined.findIndex(o => o.label.toLowerCase().startsWith(typeaheadBuffer));
      if (foundIndex >= 0) {
        const realIndex = (start + foundIndex) % options.length;
        activeIndex = realIndex;
        optionNodes[realIndex]?.focus();
      }
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

<div
  class="custom-select"
  bind:this={selectContainer}
  on:click|stopPropagation
>
  {#if label}
    <label id={`${id}-label`} class="select-headline">{label}</label>
  {/if}

  <button
    type="button"
    id={`${id}-trigger`}
    class="select-button"
    on:click={toggleDropdown}
    on:keydown={onTriggerKeydown}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
    aria-labelledby={label ? `${id}-label` : `${id}-trigger`}
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
      aria-labelledby={label ? `${id}-label` : undefined}
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

<style lang="scss">
  @reference "../../styles/styles.css";

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
