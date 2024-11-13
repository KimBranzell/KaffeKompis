<script>
  import { shareRecipe } from '../utils/recipeSharing';
  import { coffeeWeight, waterRatio, roastGrade } from '../utils/brewingStore';

  export let strength;
  export let taste;

  const handleShare = () => {
    shareRecipe({
      coffeeWeight: $coffeeWeight,
      waterRatio: $waterRatio,
      roastGrade: $roastGrade,
      strength,
      taste
    });
  };
</script>

<button class="action-button" on:click={handleShare}>
  Dela recept
</button>

<style lang="scss">
  .action-button {
    @apply px-8 py-4 text-xl font-bold inline-flex items-center text-text justify-center whitespace-nowrap rounded-base text-sm font-base ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-main border-2 border-border shadow-light hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none;
  }
</style>
