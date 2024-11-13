<script>
  import { coffeeWeight, brewingTemperature } from '../utils/brewingStore';

  export let coffeeWeightGrams;
  export let waterWeight;
  export let recommendedGrindSize;
</script>

<div class="instructions bg-[#FFF7ED] border-3 border-black p-8 neo-card-shadow">
  <h2 class="text-3xl font-bold mb-6 neo-title">Ingredienser</h2>
  <ul class="ingredient-list mb-8">
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">{$coffeeWeight}g kaffe</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">{waterWeight ? waterWeight.toFixed(0) : 0}g vatten</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">Temperatur: {$brewingTemperature}°C</span>
    </li>
    <li class="text-xl mb-2 flex items-center">
      <span class="inline-block bg-[#FFE566] p-2 border-2 border-black mr-3">Malgrad: ~{recommendedGrindSize}μm</span>
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