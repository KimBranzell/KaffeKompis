<script>
  import { roastGrade } from '../stores/brewingStore';
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';

  let mounted = false;

  const roastOptions = [
    {
      grade: 'Light',
      label: 'Ljusrost',
      temp: 93,
      color: '#C49669'
    },
    {
      grade: 'Medium',
      label: 'Mellanrost',
      temp: 88,
      color: '#8B4513'
    },
    {
      grade: 'Dark',
      label: 'Mörkrost',
      temp: 83,
      color: '#3E2723'
    }
  ];

  export let brewingTemperature;

  function selectRoast(grade) {
    $roastGrade = grade;
  }

  onMount(() => {
    mounted = true;
  });

  $: console.log('Current roast grade:', $roastGrade);
</script>

<div class="roast-options grid grid-cols-3 gap-4 min-h-48" class:opacity-0={!mounted} transition:scale={{duration: 200}}>
  {#if mounted}
    {#each roastOptions as { grade, label, temp, color }}
      <button
        class="roast-btn flex-col p-8 text-xl font-bold inline-flex items-center text-text
        justify-center whitespace-nowrap rounded-base ring-offset-white transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
        disabled:pointer-events-none disabled:opacity-50 bg-white dark:bg-secondaryBlack dark:text-darkText
        border-2 border-border dark:border-darkBorder shadow-light dark:shadow-dark hover:translate-x-boxShadowX
        hover:translate-y-boxShadowY hover:shadow-none dark:hover:shadow-none
        {$roastGrade === grade ? 'active translate-y-boxShadowY translate-x-boxShadowX shadow-none bg-[#FFE566]' : ''}"
        on:click={() => selectRoast(grade)}
      >
        <svg class="coffee-bean mb-3" viewBox="0 0 50 50" width="50" height="50">
          <path fill={color} d="m40.9 40.9c-6 6-13.6 9.1-20.7 9.1-5 0-9.7-1.5-13.4-4.7 0.2-1.8 2.4-13.2 18.8-18.3 14.4-4.5 19.3-13.5 21-18.5 6.1 9 3.9 22.8-5.7 32.4zm-37.5 0.6c-6.1-9-3.9-22.8 5.7-32.4 10.2-10.2 25.2-12 34.1-4.4-0.2 1.8-2.4 13.2-18.8 18.3-14.4 4.5-19.3 13.5-21 18.5z"/>
        </svg>
        <div class="roast-label">{label}</div>
        <div class="temp-label">{temp}°C</div>
      </button>
    {/each}
  {/if}
</div>