<script>
  import { onMount } from 'svelte';
  let dark = false;
  onMount(() => {
    dark = document.documentElement.classList.contains('dark');
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function syncWithSystem(event) {
      let preference;
      try { preference = localStorage.getItem('theme'); } catch { /* Optional preference. */ }
      if (preference !== 'dark' && preference !== 'light') apply(event.matches);
    }
    media.addEventListener('change', syncWithSystem);
    return () => media.removeEventListener('change', syncWithSystem);
  });
  function apply(value) {
    dark = value;
    document.documentElement.classList.toggle('dark', dark);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#191814' : '#fff8e8');
  }
  function toggle() {
    apply(!dark);
    try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch { /* Theme still changes when storage is blocked. */ }
  }
</script>

<button type="button" on:click={toggle} aria-label={dark ? 'Byt till ljust färgtema' : 'Byt till mörkt färgtema'} aria-pressed={dark}>
  <span aria-hidden="true">{dark ? '☀' : '☾'}</span><span class="theme-label">{dark ? 'Ljust' : 'Mörkt'}</span>
</button>

<style>
  button { flex-shrink: 0; display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-width: 44px; min-height: 44px; border: 2px solid currentColor; border-radius: 4px; padding: .4rem .6rem; background: var(--surface); color: hsl(var(--foreground)); font-weight: 700; }
  @media (max-width: 420px) { .theme-label { display: none; } }
</style>
