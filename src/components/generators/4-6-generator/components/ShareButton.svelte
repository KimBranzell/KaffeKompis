<script>
  import { getBrewingStore } from '../utils/context.js';
  import { shareRecipe } from '../utils/recipeSharing.js';
  const { displayRecipe, validationError } = getBrewingStore();
  let feedbackMessage = '';
  let isSharing = false;
  async function handleShare() {
    isSharing = true;
    try { feedbackMessage = (await shareRecipe($displayRecipe)).message; }
    finally { isSharing = false; }
  }
</script>

<div class="share-control">
  <button type="button" class="action-button" on:click={handleShare} disabled={!!$validationError || isSharing}>
    {isSharing ? 'Delar…' : 'Dela recept'}
  </button>
  <p role="status" class="mt-2 text-sm">{feedbackMessage}</p>
</div>

<style>
  button { width: 100%; min-height: 48px; padding: .75rem .25rem; background: #fd9745; color: #111; border: 2px solid #111; font-weight: 800; box-shadow: 3px 3px 0 #111; }
  button:disabled { opacity: .55; cursor: not-allowed; }
</style>
