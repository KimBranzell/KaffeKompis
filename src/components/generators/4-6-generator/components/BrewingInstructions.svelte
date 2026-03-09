<script>
  import { getGrinderSetting } from '../utils/grinderSettings';

  export let coffeeWeight;
  export let waterWeight;
  export let recommendedGrindSize;
  export let temperature;

  $: grinderSetting = getGrinderSetting(recommendedGrindSize);
</script>

<div class="instructions bg-[#FFF7ED] border-3 border-black p-8 neo-card-shadow">
  <h2 class="text-3xl font-bold mb-6 neo-title">Ingredienser</h2>
  <ul class="ingredient-list mb-8">
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">{coffeeWeight}g kaffe</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">{waterWeight ? waterWeight.toFixed(0) : 0}g vatten</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">Temperatur: {temperature}°C</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">
        Malgrad: ~{recommendedGrindSize}μm
        {#if grinderSetting}
          (Timemore C2 Max: {grinderSetting.clicks} klick)
        {/if}
      </span>
    </li>
  </ul>

  <h2 class="text-3xl font-bold mb-6 neo-title">Instruktioner</h2>
  <ol class="instruction-list mb-8">
    {#each ['Sätt ett V60-filter (eller liknande) i din V60-bryggare.',
            'Skölj filtret med hett vatten (detta för att eliminera eventuell papperssmak i kaffet).',
            'Sätt bryggaren uppå en kanna och ställ på en våg.',
            'Häll i det malda kaffet i filtret i din V60-bryggare. Nollställ vågen så att den står på 0 innan du börjar brygga.'] as step, i}
      <li class="flex mb-4">
        <span class="bg-black text-white w-8 h-8 flex items-center justify-center font-bold mr-4 border-2 border-black">
          {i + 1}
        </span>
        <span class="text-xl">{step}</span>
      </li>
    {/each}
  </ol>

  <h2 class="text-3xl font-bold mb-6 neo-title">Tips</h2>
  <ul class="tips-list mb-8">
    {#each ['Det kan ta flera försök innan du hittar din perfekta malgrad/vattenratio. Var inte rädd för att testa dig fram.',
            'Malgraden och den resulterade grovheten ska göra så att vattnet rinner igenom helt inom den totala tiden.',
            'Den första hällningens roll är att blöta det malda kaffet (så kallat blomning, eller blooming).',
            'Börja inte hälla nästa hällning förrän den förra runnit igenom helt. Rinner det för långsamt, ändra då malgraden.'] as tip}
      <li class="flex items-center mb-3">
        <span class="text-2xl mr-3">💡</span>
        <span class="text-xl">{tip}</span>
      </li>
    {/each}
  </ul>

  <h2 class="text-3xl font-bold mb-6 neo-title">Källor</h2>
  <ul class="sources-list">
    <li class="text-xl mb-2">• Tetsu Kasuya</li>
    <li class="text-xl mb-2">• Paul från YouTube-kanalen Brewing Habits</li>
  </ul>
</div>

<style lang="scss">
  @reference "../../../../styles/styles.css";

  .instructions {
    @apply rounded-[1.75rem] shadow-[8px_8px_0_#000] md:p-8;
  }

  .ingredient-list,
  .instruction-list,
  .tips-list,
  .sources-list {
    @apply grid gap-3;
  }

  @media (max-width: 767px) {
    .instructions {
      @apply p-5;
    }

    .instructions h2 {
      @apply text-2xl mb-4;
    }

    .instructions li,
    .instructions span {
      @apply text-base;
    }
  }
</style>