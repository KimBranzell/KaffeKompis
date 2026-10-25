<script>
  import { METHOD_LABELS } from '../../lib/recipes/methods.js';
  const methods = Object.entries(METHOD_LABELS).map(([id, label]) => ({ id, label }));

  const roasts = [
    { id: 'light', label: 'Ljusrost' },
    { id: 'medium', label: 'Mellanrost' },
    { id: 'dark', label: 'Mörkrost' },
  ];

  const flows = [
    { id: 'fast', label: 'Rinner för snabbt' },
    { id: 'normal', label: 'Känns normal' },
    { id: 'slow', label: 'Rinner för långsamt' },
  ];

  const symptoms = {
    sour: {
      label: 'Surt och vasst',
      summary: 'Koppen drar mot citrus, grön syra eller känns tunn innan sötman hinner komma fram.',
      likelyCause: 'Vanligtvis underextraktion: för grov malning, för lite energi i bryggningen eller för snabb drawdown.',
      baseRecommendations: [
        {
          title: 'Mala lite finare',
          change: 'Flytta kvarnen 1 till 2 steg finare.',
          why: 'Du ökar kontakttiden och får ut mer sötma ur kaffet.',
        },
        {
          title: 'Höj vattentemperaturen',
          change: 'Sikta på ungefär 94 till 96 grader.',
          why: 'Ljusare eller täta bönor behöver ofta mer energi för att smaka balanserat.',
        },
      ],
      watchouts: [
        'Om drawdown redan är långsam, börja med temperatur i stället för att gå för långt på malningen.',
        'För snabb bryggning tillsammans med sur smak är ofta ett tydligt tecken på för grov malning.',
      ],
    },
    bitter: {
      label: 'Bittert och torrt',
      summary: 'Smaken stannar kvar, känns askig eller ger en torr eftersmak i sidorna av munnen.',
      likelyCause: 'Vanligtvis överextraktion: för fin malning, för hög temperatur eller för aggressiv agitation.',
      baseRecommendations: [
        {
          title: 'Mala lite grövre',
          change: 'Gå 1 till 2 steg grövre på kvarnen.',
          why: 'Du minskar hur mycket av de torra, bittra tonerna som kommer ut i slutet av bryggningen.',
        },
        {
          title: 'Sänk temperaturen något',
          change: 'Testa 90 till 93 grader beroende på rostning.',
          why: 'Det dämpar aggressiv extraktion, särskilt på mörkare kaffe.',
        },
      ],
      watchouts: [
        'Om bryggningen också är långsam är det ofta malningen som är huvudproblemet.',
        'Mörkrost svarar ofta snabbare på justerad temperatur än på stora hopp i ratio.',
      ],
    },
    thin: {
      label: 'Tunt och svagt',
      summary: 'Koppen smakar ren men saknar kropp, sötma och tydlig struktur.',
      likelyCause: 'Ofta för hög ratio, för lite kaffe eller för lite extraktion för just det receptet.',
      baseRecommendations: [
        {
          title: 'Öka koncentrationen lite',
          change: 'Gå mot mindre vatten eller lite mer kaffe i nästa bryggning.',
          why: 'Mer koncentration ger kroppen en chans att komma fram.',
        },
        {
          title: 'Finjustera malningen mot finare håll',
          change: 'Testa ett litet steg finare om koppen också saknar sötma.',
          why: 'Tunn smak tillsammans med låg sötma betyder ofta att kaffet inte extraherats fullt ut.',
        },
      ],
      watchouts: [
        'Om smaken är tunn men bitter är problemet sannolikt ratio eller dos, inte mer extraktion.',
        'Ändra bara en variabel i taget: dos eller malning, inte båda samtidigt.',
      ],
    },
    muddy: {
      label: 'Grumligt och smutsigt',
      summary: 'Koppen känns tung, dammig eller stängd i smaken i stället för ren och tydlig.',
      likelyCause: 'Ofta för mycket fines i koppen, för mycket agitation eller för sen servering efter bryggning.',
      baseRecommendations: [
        {
          title: 'Mala lite grövre eller mjukare',
          change: 'Backa ett steg på kvarnen och undvik att driva igenom för mycket fines.',
          why: 'Det ger renare kopp och minskar slamkänsla.',
        },
        {
          title: 'Rör och häll mindre aggressivt',
          change: 'Häll jämnare, undvik hård swirl och decantera direkt efter bryggning.',
          why: 'För mycket rörelse lyfter fines och gör smaken stängd.',
        },
      ],
      watchouts: [
        'French press behöver ofta snabb servering bort från sumpen när den är klar.',
        'I filterbryggning kan ojämn hällning skapa både grumlighet och bitterhet samtidigt.',
      ],
    },
  };

  const methodAdjustments = {
    'electric-filter': {
      sour: { title: 'Prova lite finare filtermalning', change: 'Behåll doseringen och prova ett litet steg finare vid nästa batch.', why: 'Mer kontaktyta kan ge bättre extraktion. Bryggaren styr temperatur och flöde.' },
      bitter: { title: 'Jämför med en färsk kopp', change: 'Servera direkt eller häll över i termos i stället för att låta kaffet stå länge på värmeplattan.', why: 'Lång varmhållning kan göra kaffet bittert även när doseringen är rätt.' },
      thin: { title: 'Väg dosen för vattenmängden', change: 'Kontrollera gram per liter i batchkalkylatorn och prova en liten ökning vid samma vattenmängd.', why: 'Koppmarkeringar och kaffemått varierar; vägning gör nästa jämförelse tydligare.' },
      muddy: { title: 'Kontrollera filtret', change: 'Använd rätt filterstorlek, placera filtret korrekt och rengör filterhållaren.', why: 'Ett felplacerat eller skadat filter kan släppa igenom kaffesump.' },
    },
    'pour-over': {
      sour: {
        title: 'Låt bloom och hällningar jobba längre',
        change: 'Ge bloom 5 till 10 sekunder extra och häll lugnare så bädden inte springer igenom.',
        why: 'Pour over straffar snabb drawdown direkt i koppen.',
      },
      bitter: {
        title: 'Dra ner på agitationen',
        change: 'Skippa hård swirl sent i bryggningen och häll mer kontrollerat.',
        why: 'Det minskar överextraktion i slutet av drawdown.',
      },
      thin: {
        title: 'Jämna ut fördelningen',
        change: 'Sikta på en stadigare hällning och se till att hela bädden blir genomvåt.',
        why: 'Ojämnt vattenflöde ger ofta tunn och splittrad kopp.',
      },
      muddy: {
        title: 'Häll närmare och lugnare',
        change: 'Häll lägre över bädden med mindre turbulens.',
        why: 'Du får renare kopp och mindre fines i filterbryggningen.',
      },
    },
    aeropress: {
      sour: {
        title: 'Låt kaffet dra lite längre',
        change: 'Lägg till 15 till 30 sekunder innan press.',
        why: 'AeroPress reagerar snabbt på kort kontakttid.',
      },
      bitter: {
        title: 'Pressa mjukare',
        change: 'Pressa med mindre kraft och avsluta innan sista hårda motståndet.',
        why: 'Sista delen av pressen kan dra med oönskad bitterhet.',
      },
      thin: {
        title: 'Kortare bypass eller högre dos',
        change: 'Om du späder efteråt, skruva ned bypass lite grann.',
        why: 'Många tunna AeroPress-koppar är i grunden för utspädda.',
      },
      muddy: {
        title: 'Filter och presshastighet först',
        change: 'Använd pappersfilter och undvik att forcera genom sista centimetern.',
        why: 'Det ger markant renare kopp utan att du behöver göra om hela receptet.',
      },
    },
    'french-press': {
      sour: {
        title: 'Längre dragtid',
        change: 'Testa 30 till 45 sekunder längre steep innan du pressar.',
        why: 'Presskanna vinner ofta mer på tid än på aggressiv temperaturhöjning.',
      },
      bitter: {
        title: 'Servera bort från sumpen direkt',
        change: 'Decantera hela bryggningen så snart den är klar.',
        why: 'Koppen fortsätter annars att extrahera och bli torr.',
      },
      thin: {
        title: 'Höj dosen lite innan du finjusterar malningen',
        change: 'Presskanna svarar ofta tydligt på lite mer kaffe i stället för mycket finare malning.',
        why: 'Du får kropp utan att dra in onödigt mycket slam.',
      },
      muddy: {
        title: 'Bryt skummet och låt fines sjunka',
        change: 'Skumma av toppen och ge koppen en kort vila innan servering.',
        why: 'Det rensar smaken mer än man tror.',
      },
    },
  };

  import { onDestroy, onMount } from 'svelte';

  let selectedMethod = 'pour-over';
  let selectedSymptom = 'sour';
  let selectedRoast = 'medium';
  let selectedFlow = 'normal';

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    if (methods.some(method => method.id === params.get('method'))) selectedMethod = params.get('method');
    if (Object.hasOwn(symptoms, params.get('symptom'))) selectedSymptom = params.get('symptom');
  });

  let liveAnnouncement = '';

  let announcementTimeout;
  onDestroy(() => clearTimeout(announcementTimeout));

  function announceRecommendations() {
    const recommendations = createRecommendations(selectedMethod, selectedSymptom, selectedFlow, selectedRoast);
    if (!recommendations || recommendations.length === 0) {
      liveAnnouncement = 'Inga rekommendationer tillgängliga.';
      return;
    }
    const top = recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r.title}`).join(' ');
    liveAnnouncement = `Prioriterade justeringar: ${top}`;
    // Clear after a short delay so successive changes re-announce
    clearTimeout(announcementTimeout);
    announcementTimeout = setTimeout(() => (liveAnnouncement = ''), 4000);
  }

  function setMethod(id) {
    selectedMethod = id;
    announceRecommendations();
  }

  function setSymptom(id) {
    selectedSymptom = id;
    announceRecommendations();
  }

  function setRoast(id) {
    selectedRoast = id;
    announceRecommendations();
  }

  function setFlow(id) {
    selectedFlow = id;
    announceRecommendations();
  }

  function createFlowAdjustment(symptom, flow) {
    if (flow === 'normal') {
      return null;
    }

    if (symptom === 'sour' && flow === 'fast') {
      return {
        title: 'Bekräfta drawdown-problemet',
        change: 'Snabb bryggtid plus sur kopp pekar starkt mot för grov malning eller för aggressiv hällning.',
        why: 'Börja där innan du jagar ratio eller nya recept.',
      };
    }

    if (symptom === 'bitter' && flow === 'slow') {
      return {
        title: 'Prioritera flödet först',
        change: 'Långsam drawdown plus bitterhet betyder ofta att du ska gå grövre innan allt annat.',
        why: 'Annars kommer temperaturjusteringar bara maskera problemet.',
      };
    }

    if (symptom === 'thin' && flow === 'fast') {
      return {
        title: 'Snabb bryggning ger tunn kopp',
        change: 'Gå ett steg finare eller häll lugnare så vattnet inte smiter förbi kaffet.',
        why: 'Kropp och sötma försvinner ofta tillsammans när drawdown springer iväg.',
      };
    }

    if (symptom === 'muddy' && flow === 'slow') {
      return {
        title: 'För mycket motstånd i bädden',
        change: 'Backa på malningen eller minska agitationen så fines inte packas ihop.',
        why: 'Det är en vanlig orsak till grumlig och stängd kopp.',
      };
    }

    return {
      title: 'Håll koll på bryggtiden',
      change: 'Notera om drawdown flyttar sig när du gör nästa justering.',
      why: 'Smak och flöde måste tolkas tillsammans för att ge rätt nästa steg.',
    };
  }

  function createRoastAdjustment(symptom, roast) {
    if (roast === 'medium') {
      return null;
    }

    if (roast === 'light' && symptom !== 'bitter') {
      return {
        title: 'Ljusrost behöver mer energi',
        change: 'Var inte rädd för högre temperatur eller lite finare malning.',
        why: 'Ljusrost smakar ofta surt och tunt om bryggningen är för försiktig.',
      };
    }

    if (roast === 'dark' && symptom !== 'sour') {
      return {
        title: 'Mörkrost reagerar snabbt',
        change: 'Var försiktig med för het temperatur och för mycket agitation.',
        why: 'Mörkrost blir bitter och torr fortare än du tror.',
      };
    }

    return null;
  }

  function createNextBrewPlan(symptom, method, flow, roast) {
    if (method === 'electric-filter') return {
      grind: symptom === 'sour' ? 'Prova ett litet steg finare filtermalning' : 'Utgå från maskinens filtermalning',
      temperature: 'Bryggaren styr värmen; fyll på kallt vatten',
      technique: methodAdjustments[method][symptom].change,
    };
    const plans = {
      sour: {
        grind: flow === 'fast' ? '1 till 2 steg finare' : '1 steg finare',
        temperature: roast === 'light' ? '95 till 96 grader' : '94 till 95 grader',
        technique: method === 'pour-over' ? 'Längre bloom och lugnare hällning' : 'Lite mer kontakttid innan servering',
      },
      bitter: {
        grind: flow === 'slow' ? '1 till 2 steg grövre' : '1 steg grövre',
        temperature: roast === 'dark' ? '90 till 92 grader' : '91 till 93 grader',
        technique: method === 'pour-over' ? 'Mindre swirl och mindre aggressiv hällning' : 'Kortare eller mjukare avslut på bryggningen',
      },
      thin: {
        grind: flow === 'fast' ? '1 steg finare' : 'Behåll malningen eller gå ett halvt steg finare',
        temperature: roast === 'light' ? '94 till 95 grader' : '93 till 94 grader',
        technique: 'Lite starkare ratio eller något högre dos',
      },
      muddy: {
        grind: flow === 'slow' ? '1 steg grövre' : 'Behåll eller gå ett steg grövre',
        temperature: roast === 'dark' ? '90 till 92 grader' : '92 till 94 grader',
        technique: method === 'french-press' ? 'Decantera direkt efter press' : 'Mindre agitation och renare hällning',
      },
    };

    return plans[symptom];
  }

  $: symptomProfile = symptoms[selectedSymptom];
  $: watchouts = selectedMethod === 'electric-filter'
    ? ['Notera vattenmängd, kaffevikt och hur smaken ändras när du provar en justering.', 'Kontrollera rengöring och avkalkning enligt manualen om bryggningen går ovanligt långsamt.']
    : symptomProfile.watchouts;
  function createRecommendations(method, symptom, flow, roast) {
    if (method === 'electric-filter') return [methodAdjustments[method][symptom]];
    return [
      ...symptoms[symptom].baseRecommendations,
      methodAdjustments[method][symptom],
      createFlowAdjustment(symptom, flow),
      createRoastAdjustment(symptom, roast),
    ].filter(Boolean);
  }
  $: recommendations = createRecommendations(selectedMethod, selectedSymptom, selectedFlow, selectedRoast);
  $: nextBrewPlan = createNextBrewPlan(selectedSymptom, selectedMethod, selectedFlow, selectedRoast);
</script>

<section class="troubleshooter mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 md:py-18">
  <div class="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
    <div class="space-y-4">
      <p class="section-kicker">Bryggfelsökning</p>
      <h1 class="section-title">Få ett bättre nästa bryggförsök utan att gissa i blindo.</h1>
      <p class="section-copy">
        Välj hur koppen smakar, hur bryggningen beter sig och vilken metod du kör. Verktyget prioriterar de första
        justeringarna som mest sannolikt flyttar smaken at rätt häll.
      </p>
    </div>

    <div class="rounded-[1.75rem] border-3 border-black bg-[#111111] p-8 text-[#fff8e8] shadow-[8px_8px_0_#000]">
      <p class="text-sm font-black uppercase tracking-[0.16em] text-[#ffd166]">Hur du får mest nytta av verktyget</p>
      <ol class="mt-4 grid gap-3 text-base leading-7 text-[#f6ead3]">
        <li>1. Beskriv den tydligaste smaken i koppen, inte alla problem samtidigt.</li>
        <li>2. Justera bara en huvudvariabel till nästa bryggning.</li>
        <li>3. Notera om smaken flyttar sig mot mer sötma, klarhet eller kropp.</li>
      </ol>
    </div>
  </div>

  <div class="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div class="space-y-6 rounded-[1.75rem] border-3 border-black accent-panel bg-white p-6 shadow-[8px_8px_0_#000] md:p-8">
      <div>
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">1. Välj metod</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-2" role="group" aria-label="Välj metod">
          {#each methods as method}
            <button
              type="button"
              class:selected={selectedMethod === method.id}
              class="selector-button"
              on:click={() => setMethod(method.id)}
              aria-pressed={selectedMethod === method.id}
            >
              {method.label}
            </button>
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">2. Hur smakar koppen?</p>
        <div class="mt-3 grid gap-3 md:grid-cols-2" role="group" aria-label="Välj symptom">
          {#each Object.entries(symptoms) as [key, symptom]}
            <button
              type="button"
              class:selected={selectedSymptom === key}
              class="selector-card text-left"
              on:click={() => setSymptom(key)}
              aria-pressed={selectedSymptom === key}
            >
              <span class="text-lg font-black">{symptom.label}</span>
              <span class="mt-2 block text-sm leading-6 text-black/70">{symptom.summary}</span>
            </button>
          {/each}
        </div>
      </div>

      {#if selectedMethod !== 'electric-filter'}<div class="grid gap-6 md:grid-cols-2">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">3. Rostning</p>
          <div class="mt-3 grid gap-3" role="group" aria-label="Välj rostning">
            {#each roasts as roast}
              <button
                type="button"
                class:selected={selectedRoast === roast.id}
                class="selector-button selector-button--compact"
                on:click={() => setRoast(roast.id)}
                aria-pressed={selectedRoast === roast.id}
              >
                {roast.label}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">4. Bryggflöde</p>
          <div class="mt-3 grid gap-3" role="group" aria-label="Välj bryggflöde">
            {#each flows as flow}
              <button
                type="button"
                class:selected={selectedFlow === flow.id}
                class="selector-button selector-button--compact"
                on:click={() => setFlow(flow.id)}
                aria-pressed={selectedFlow === flow.id}
              >
                {flow.label}
              </button>
            {/each}
          </div>
        </div>
      </div>{/if}
    </div>

    <div class="space-y-6">
      <article class="rounded-[1.75rem] border-3 border-black accent-panel bg-[#fff7ed] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Trolig huvudorsak</p>
        <h2 class="mt-3 text-3xl font-black leading-tight">{symptomProfile.label}</h2>
        <p class="mt-4 text-base leading-7 text-black/80">{symptomProfile.likelyCause}</p>
      </article>

      <article class="rounded-[1.75rem] border-3 border-black accent-panel bg-[#dff4d7] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Nästa bryggplan</p>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border-3 border-black accent-panel bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Malning</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.grind}</p>
          </div>
          <div class="rounded-2xl border-3 border-black accent-panel bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Temperatur</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.temperature}</p>
          </div>
          <div class="rounded-2xl border-3 border-black accent-panel bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Teknik</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.technique}</p>
          </div>
        </div>
      </article>

      <article class="rounded-[1.75rem] border-3 border-black accent-panel bg-white p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Prioriterade justeringar</p>
        <div class="mt-4 grid gap-4">
          <div id="troubleshooter-live" class="sr-only" role="status" aria-live="polite" aria-atomic="true">{liveAnnouncement}</div>
          {#each recommendations as recommendation, index}
            <div class="rounded-2xl border-3 border-black accent-panel bg-[#fffaf1] p-5">
              <div class="flex items-start gap-4">
                <span class="inline-flex h-10 w-10 shrink-0 items-center justify-center border-3 border-black bg-black text-sm font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 class="text-xl font-black leading-tight">{recommendation.title}</h3>
                  <p class="mt-2 text-base font-semibold text-black/80">{recommendation.change}</p>
                  <p class="mt-2 text-sm leading-6 text-black/70">{recommendation.why}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </article>

      <article class="rounded-[1.75rem] border-3 border-black accent-panel bg-[#ffef9f] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Det har ska du observera nästa kopp</p>
        <ul class="mt-4 grid gap-3 text-base leading-7 text-black/80">
          {#each watchouts as item}
            <li class="rounded-2xl border-3 border-black accent-panel bg-white px-4 py-3">{item}</li>
          {/each}
        </ul>
      </article>
    </div>
  </div>
</section>

<style lang="scss">
  @reference "../../styles/styles.css";

  .selector-button {
    color: #111;
    @apply rounded-2xl border-3 border-black bg-[#fff7ed] px-4 py-4 text-left text-base font-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5;
  }

  .selector-button--compact {
    @apply py-3;
  }

  .selector-card {
    color: #111;
    @apply rounded-2xl border-3 border-black bg-[#fff7ed] px-4 py-4 shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5;
  }

  .selected {
    @apply bg-[#111111] text-white;
  }

  .selected :global(span),
  .selected :global(p) {
    color: inherit;
  }
</style>
