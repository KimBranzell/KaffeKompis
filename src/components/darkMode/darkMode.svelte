<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  const STORAGE_KEY = 'theme';
  const theme = writable('light');

  function getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(currentTheme) {
    document.documentElement.classList.toggle('dark', currentTheme === 'dark');
  }

  onMount(() => {
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    const initialTheme = storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : getPreferredTheme();

    theme.set(initialTheme);

    const unsubscribe = theme.subscribe((value) => {
      localStorage.setItem(STORAGE_KEY, value);
      applyTheme(value);
    });

    return unsubscribe;
  });

  function toggle() {
    theme.update(current => current === 'light' ? 'dark' : 'light');
  }
</script>

<button type="button" on:click={toggle} aria-label="Växla färgtema">
  {#if $theme === 'dark'}
    Ljust läge
  {:else}
    Mörkt läge
  {/if}
</button>


<style>
	button {
		background: var(--bg-color);
		border: 2px solid var(--text-color);
		border-radius: 5px;
		color: var(--text-color);
		padding: 10px 15px;
	}

	button:active {
		background: inherit;
	}
</style>