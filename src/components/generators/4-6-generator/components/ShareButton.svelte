<script>
  import { fly } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';
  import { shareRecipe } from '../utils/recipeSharing';
  import { coffeeWeight, waterRatio, roastGrade } from '../utils/brewingStore';

  export let strength;
  export let taste;

  let feedbackMessage = '';
  let feedbackTimeoutId;

  function showFeedback(message) {
    feedbackMessage = message;

    if (feedbackTimeoutId) {
      clearTimeout(feedbackTimeoutId);
    }

    feedbackTimeoutId = setTimeout(() => {
      feedbackMessage = '';
    }, 2200);
  }

  const handleShare = async () => {
    const result = await shareRecipe({
      coffeeWeight: $coffeeWeight,
      waterRatio: $waterRatio,
      roastGrade: $roastGrade,
      strength,
      taste
    });

    showFeedback(result?.message ?? 'Kunde inte dela receptet');
  };
</script>

<button
  type="button"
  class="action-button relative overflow-hidden min-w-[160px]"
  on:click={handleShare}
>
  <div class="relative h-[1.5em] w-full">
    {#if feedbackMessage}
      <span
        class="absolute inset-0"
        in:fly={{ y: 20, duration: 600, easing: elasticOut }}
        out:fly={{ y: -20, duration: 400 }}
      >
        {feedbackMessage}
      </span>
    {:else}
      <span
        class="absolute inset-0"
        in:fly={{ y: -20, duration: 600, easing: elasticOut }}
        out:fly={{ y: 20, duration: 400 }}
      >
        Dela recept
      </span>
    {/if}
  </div>
</button>

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .action-button {
    @apply px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }

  @media (max-width: 639px) {
    .action-button {
      @apply text-base px-5 py-3;
    }
  }
</style>
