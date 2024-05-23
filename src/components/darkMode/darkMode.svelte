<script>
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';

  const STORE_PREFIX = 'theme'; // Define your store prefix here
  let theme = writable('light'); // Default theme

  // Function to determine the system theme preference
  function systemTheme() {
    if (typeof window !== 'undefined') {
      const checkDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return checkDark ? 'dark' : 'light';
    }
    return 'light'; // Default to 'light' if window is not defined
  }

  if (typeof window !== 'undefined') {

    function updateBodyClass(currentTheme) {
      document.body.classList.toggle('dark-theme', currentTheme === 'dark');
      document.body.classList.toggle('light-theme', currentTheme === 'light');
    }
    onMount(() => {
      const themeLocal = localStorage.getItem(`${STORE_PREFIX}`);
      theme.set(themeLocal ? JSON.parse(themeLocal) : systemTheme());

      // Apply initial body class
      updateBodyClass($theme);

      // Subscribe to theme changes and update localStorage
      const unsubscribe = theme.subscribe((value) => {
        localStorage.setItem(`${STORE_PREFIX}`, JSON.stringify(value));
        updateBodyClass(value);
      });

      // Cleanup subscription when component is destroyed
      return () => {
        unsubscribe();
      };
    });
  }

  // Toggle theme function
  function toggle() {
    theme.update(current => current === 'light' ? 'dark' : 'light');
  }
</script>

<button on:click={toggle}>
  {#if $theme === 'dark'}
    Go light
  {:else}
    Go dark
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