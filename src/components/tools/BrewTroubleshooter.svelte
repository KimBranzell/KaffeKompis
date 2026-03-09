<script>
  const methods = [
    { id: 'pour-over', label: 'Pour over' },
    { id: 'aeropress', label: 'AeroPress' },
    { id: 'french-press', label: 'French press' },
  ];

  const roasts = [
    { id: 'light', label: 'Ljusrost' },
    { id: 'medium', label: 'Mellanrost' },
    { id: 'dark', label: 'Morkrost' },
  ];

  const flows = [
    { id: 'fast', label: 'Rinner for snabbt' },
    { id: 'normal', label: 'Kanns normal' },
    { id: 'slow', label: 'Rinner for langsamt' },
  ];

  const symptoms = {
    sour: {
      label: 'Surt och vasst',
      summary: 'Koppen drar mot citrus, gron syra eller kanns tunn innan sotman hinner komma fram.',
      likelyCause: 'Vanligtvis underextraktion: for grov malning, for lite energi i bryggningen eller for snabb drawdown.',
      baseRecommendations: [
        {
          title: 'Mala lite finare',
          change: 'Flytta kvarnen 1 till 2 steg finare.',
          why: 'Du okar kontakttiden och far ut mer sotma ur kaffet.',
        },
        {
          title: 'Hoja vattentemperaturen',
          change: 'Sikta pa ungefarligt 94 till 96 grader.',
          why: 'Ljusare eller tatta bnor behover ofta mer energi for att smaka balanserat.',
        },
      ],
      watchouts: [
        'Om drawdown redan ar langsam, borja med temperatur i stallet for att ga for langt pa malningen.',
        'For snabb bryggning tillsammans med sur smak ar ofta ett tydligt tecken pa for grov malning.',
      ],
    },
    bitter: {
      label: 'Bittert och torrt',
      summary: 'Smaken stannar kvar, kanns askig eller ger en torr eftersmak i sidorna av munnen.',
      likelyCause: 'Vanligtvis overextraktion: for fin malning, for hog temperatur eller for aggressiv agitation.',
      baseRecommendations: [
        {
          title: 'Mala lite grvre',
          change: 'Ga 1 till 2 steg grvre pa kvarnen.',
          why: 'Du minskar hur mycket av de torra, bittra tonerna som kommer ut i slutet av bryggningen.',
        },
        {
          title: 'Sank temperaturen nagot',
          change: 'Testa 90 till 93 grader beroende pa rostning.',
          why: 'Det dapar aggressiv extraktion, sarskilt pa morkare kaffe.',
        },
      ],
      watchouts: [
        'Om bryggningen ocksa ar langsam ar det ofta malningen som ar huvudproblemet.',
        'Morkrost svarar ofta snabbare pa justerad temperatur an pa stora hopp i ratio.',
      ],
    },
    thin: {
      label: 'Tunt och svagt',
      summary: 'Koppen smakar ren men saknar kropp, sotma och tydlig struktur.',
      likelyCause: 'Ofta for hog ratio, for lite kaffe eller for lite extraktion for just det receptet.',
      baseRecommendations: [
        {
          title: 'Stark upp ratio lite',
          change: 'Ga mot mindre vatten eller lite mer kaffe i nasta bryggning.',
          why: 'Mer koncentration ger kroppen en chans att komma fram.',
        },
        {
          title: 'Finjustera malningen mot finare hall',
          change: 'Testa ett litet steg finare om koppen ocksa saknar sotma.',
          why: 'Tunn smak tillsammans med lag sotma betyder ofta att kaffet inte extraherats fullt ut.',
        },
      ],
      watchouts: [
        'Om smaken ar tunn men bitter ar problemet sannolikt ratio eller dos, inte mer extraktion.',
        'Bygg bara en variabel i taget: dos eller malning, inte bada samtidigt.',
      ],
    },
    muddy: {
      label: 'Grumligt och smutsigt',
      summary: 'Koppen kanns tung, dammig eller stangd i smaken i stallet for ren och tydlig.',
      likelyCause: 'Ofta for mycket fines i koppen, for mycket agitation eller for sen servering efter bryggning.',
      baseRecommendations: [
        {
          title: 'Mala lite grvre eller mjukare',
          change: 'Backa ett steg pa kvarnen och undvik att driva igenom for mycket fines.',
          why: 'Det ger renare kopp och minskar slamkansla.',
        },
        {
          title: 'Ror och hall mindre aggressivt',
          change: 'Hall jamnare, undvik hard swirl och decantera direkt efter bryggning.',
          why: 'For mycket rörelse lyfter fines och gor smaken stangd.',
        },
      ],
      watchouts: [
        'French press behover ofta snabb servering bort fran sumpen nar den ar klar.',
        'I filterbryggning kan ojamn hallning skapa bade grumlighet och bitterhet samtidigt.',
      ],
    },
  };

  const methodAdjustments = {
    'pour-over': {
      sour: {
        title: 'Lat bloom och hallningar jobba langre',
        change: 'Ge bloom 5 till 10 sekunder extra och hall lugnare sa badden inte springer igenom.',
        why: 'Pour over straffar snabb drawdown direkt i koppen.',
      },
      bitter: {
        title: 'Dra ner pa agitationen',
        change: 'Skippa hard swirl sent i bryggningen och halla mer kontrollerat.',
        why: 'Det minskar overextraktion i slutet av drawdown.',
      },
      thin: {
        title: 'Jamna ut fordelningen',
        change: 'Sikta pa en stadigare hallning och se till att hela badden blir genomvatt.',
        why: 'Ojamt vattenflode ger ofta tunn och splittrad kopp.',
      },
      muddy: {
        title: 'Hall narmare och lugnare',
        change: 'Hall lagre over badden med mindre turbulens.',
        why: 'Du far renare kopp och mindre fines i filterbryggningen.',
      },
    },
    aeropress: {
      sour: {
        title: 'Lat kaffet dra lite langre',
        change: 'Laggt till 15 till 30 sekunder innan press.',
        why: 'AeroPress reagerar snabbt pa kort kontakttid.',
      },
      bitter: {
        title: 'Pressa mjukare',
        change: 'Pressa med mindre kraft och avsluta innan sista harda motstandet.',
        why: 'Sista delen av pressen kan dra med oonskad bitterhet.',
      },
      thin: {
        title: 'Kortare bypass eller hogre dos',
        change: 'Om du spader efterat, skruva ned bypass lite grann.',
        why: 'Manga tunna AeroPress-koppar ar i grunden for utspadda.',
      },
      muddy: {
        title: 'Filter och presshastighet forst',
        change: 'Anvand pappersfilter och undvik att forcera genom sista centimetern.',
        why: 'Det ger markant renare kopp utan att du behover gora om hela receptet.',
      },
    },
    'french-press': {
      sour: {
        title: 'Langre dragtid',
        change: 'Testa 30 till 45 sekunder langre steep innan du pressar.',
        why: 'Presskanna vinner ofta mer pa tid an pa aggressiv temperaturhojning.',
      },
      bitter: {
        title: 'Servera bort fran sumpen direkt',
        change: 'Decantera hela bryggningen sa snart den ar klar.',
        why: 'Koppen fortsatter annars att extrahera och bli torr.',
      },
      thin: {
        title: 'Hoja dosen lite innan du finjusterar malningen',
        change: 'Presskanna svarar ofta tydligt pa lite mer kaffe i stallet for mycket finare malning.',
        why: 'Du far kropp utan att dra in onodigt mycket slam.',
      },
      muddy: {
        title: 'Bryt skummet och lat fines sjunka',
        change: 'Skumma av toppen och ge koppen en kort vila innan servering.',
        why: 'Det rensar smaken mer an man tror.',
      },
    },
  };

  let selectedMethod = 'pour-over';
  let selectedSymptom = 'sour';
  let selectedRoast = 'medium';
  let selectedFlow = 'normal';

  function createFlowAdjustment(symptom, flow) {
    if (flow === 'normal') {
      return null;
    }

    if (symptom === 'sour' && flow === 'fast') {
      return {
        title: 'Bekrafta drawdown-problemet',
        change: 'Snabb bryggtid plus sur kopp pekar starkt mot for grov malning eller for aggressiv hallning.',
        why: 'Borja dar innan du jagar ratio eller nya recept.',
      };
    }

    if (symptom === 'bitter' && flow === 'slow') {
      return {
        title: 'Prioritera flodet forst',
        change: 'Langsam drawdown plus bitterhet betyder ofta att du ska ga grvre innan allt annat.',
        why: 'Annars kommer temperaturjusteringar bara maskera problemet.',
      };
    }

    if (symptom === 'thin' && flow === 'fast') {
      return {
        title: 'Snabb bryggning ger tunn kopp',
        change: 'Ga ett steg finare eller hall lugnare sa vattnet inte smiter forbi kaffet.',
        why: 'Kropp och sotma forsvinner ofta tillsammans nar drawdown springer ivag.',
      };
    }

    if (symptom === 'muddy' && flow === 'slow') {
      return {
        title: 'For mycket motstand i badden',
        change: 'Backa pa malningen eller minska agitationen sa fines inte packas ihop.',
        why: 'Det ar en vanlig orsak till grumlig och stangd kopp.',
      };
    }

    return {
      title: 'Hall koll pa bryggtiden',
      change: 'Notera om drawdown flyttar sig nar du gor nasta justering.',
      why: 'Smak och flode maste tolkas tillsammans for att ge ratt nasta steg.',
    };
  }

  function createRoastAdjustment(symptom, roast) {
    if (roast === 'medium') {
      return null;
    }

    if (roast === 'light' && symptom !== 'bitter') {
      return {
        title: 'Ljusrost behover mer energi',
        change: 'Var inte radd for hogre temperatur eller lite finare malning.',
        why: 'Ljusrost smakar ofta surt och tunt om bryggningen ar for forsiktig.',
      };
    }

    if (roast === 'dark' && symptom !== 'sour') {
      return {
        title: 'Morkrost reagerar snabbt',
        change: 'Var forsiktig med for het temperatur och for mycket agitation.',
        why: 'Morkrost blir bitter och torr fortare an du tror.',
      };
    }

    return null;
  }

  function createNextBrewPlan(symptom, method, flow, roast) {
    const plans = {
      sour: {
        grind: flow === 'fast' ? '1 till 2 steg finare' : '1 steg finare',
        temperature: roast === 'light' ? '95 till 96 grader' : '94 till 95 grader',
        technique: method === 'pour-over' ? 'Langre bloom och lugnare hallning' : 'Lite mer kontakttid innan servering',
      },
      bitter: {
        grind: flow === 'slow' ? '1 till 2 steg grvre' : '1 steg grvre',
        temperature: roast === 'dark' ? '90 till 92 grader' : '91 till 93 grader',
        technique: method === 'pour-over' ? 'Mindre swirl och mindre aggressiv hallning' : 'Kortare eller mjukare avslut pa bryggningen',
      },
      thin: {
        grind: flow === 'fast' ? '1 steg finare' : 'Behall malningen eller ga ett halvt steg finare',
        temperature: roast === 'light' ? '94 till 95 grader' : '93 till 94 grader',
        technique: 'Lite starkare ratio eller nagot hogre dos',
      },
      muddy: {
        grind: flow === 'slow' ? '1 steg grvre' : 'Behall eller ga ett steg grvre',
        temperature: roast === 'dark' ? '90 till 92 grader' : '92 till 94 grader',
        technique: method === 'french-press' ? 'Decantera direkt efter press' : 'Mindre agitation och renare hallning',
      },
    };

    return plans[symptom];
  }

  $: symptomProfile = symptoms[selectedSymptom];
  $: methodAdjustment = methodAdjustments[selectedMethod][selectedSymptom];
  $: flowAdjustment = createFlowAdjustment(selectedSymptom, selectedFlow);
  $: roastAdjustment = createRoastAdjustment(selectedSymptom, selectedRoast);
  $: recommendations = [
    ...symptomProfile.baseRecommendations,
    methodAdjustment,
    flowAdjustment,
    roastAdjustment,
  ].filter(Boolean);
  $: nextBrewPlan = createNextBrewPlan(selectedSymptom, selectedMethod, selectedFlow, selectedRoast);
</script>

<section class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-14 md:py-18">
  <div class="grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
    <div class="space-y-4">
      <p class="section-kicker">Bryggfelsokning</p>
      <h1 class="section-title">Fa ett battre nasta bryggforsok utan att gissa i blindo.</h1>
      <p class="section-copy">
        Valj hur koppen smakar, hur bryggningen beter sig och vilken metod du kor. Verktyget prioriterar de forsta
        justeringarna som mest sannolikt flyttar smaken at ratt hall.
      </p>
    </div>

    <div class="rounded-[1.75rem] border-3 border-black bg-[#111111] p-8 text-[#fff8e8] shadow-[8px_8px_0_#000]">
      <p class="text-sm font-black uppercase tracking-[0.16em] text-[#ffd166]">Hur du far mest nytta av verktyget</p>
      <ol class="mt-4 grid gap-3 text-base leading-7 text-[#f6ead3]">
        <li>1. Beskriv den tydligaste smaken i koppen, inte alla problem samtidigt.</li>
        <li>2. Justera bara en huvudvariabel till nasta bryggning.</li>
        <li>3. Notera om smaken flyttar sig mot mer sotma, klarhet eller kropp.</li>
      </ol>
    </div>
  </div>

  <div class="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
    <div class="space-y-6 rounded-[1.75rem] border-3 border-black bg-white p-6 shadow-[8px_8px_0_#000] md:p-8">
      <div>
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">1. Valj metod</p>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          {#each methods as method}
            <button
              type="button"
              class:selected={selectedMethod === method.id}
              class="selector-button"
              on:click={() => selectedMethod = method.id}
            >
              {method.label}
            </button>
          {/each}
        </div>
      </div>

      <div>
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">2. Hur smakar koppen?</p>
        <div class="mt-3 grid gap-3 md:grid-cols-2">
          {#each Object.entries(symptoms) as [key, symptom]}
            <button
              type="button"
              class:selected={selectedSymptom === key}
              class="selector-card text-left"
              on:click={() => selectedSymptom = key}
            >
              <span class="text-lg font-black">{symptom.label}</span>
              <span class="mt-2 block text-sm leading-6 text-black/70">{symptom.summary}</span>
            </button>
          {/each}
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">
        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">3. Rostning</p>
          <div class="mt-3 grid gap-3">
            {#each roasts as roast}
              <button
                type="button"
                class:selected={selectedRoast === roast.id}
                class="selector-button selector-button--compact"
                on:click={() => selectedRoast = roast.id}
              >
                {roast.label}
              </button>
            {/each}
          </div>
        </div>

        <div>
          <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">4. Bryggflode</p>
          <div class="mt-3 grid gap-3">
            {#each flows as flow}
              <button
                type="button"
                class:selected={selectedFlow === flow.id}
                class="selector-button selector-button--compact"
                on:click={() => selectedFlow = flow.id}
              >
                {flow.label}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <article class="rounded-[1.75rem] border-3 border-black bg-[#fff7ed] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Trolig huvudorsak</p>
        <h2 class="mt-3 text-3xl font-black leading-tight">{symptomProfile.label}</h2>
        <p class="mt-4 text-base leading-7 text-black/80">{symptomProfile.likelyCause}</p>
      </article>

      <article class="rounded-[1.75rem] border-3 border-black bg-[#dff4d7] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Nasta bryggplan</p>
        <div class="mt-4 grid gap-4 md:grid-cols-3">
          <div class="rounded-2xl border-3 border-black bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Malning</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.grind}</p>
          </div>
          <div class="rounded-2xl border-3 border-black bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Temperatur</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.temperature}</p>
          </div>
          <div class="rounded-2xl border-3 border-black bg-white p-4">
            <p class="text-xs font-black uppercase tracking-[0.14em] text-black/60">Teknik</p>
            <p class="mt-2 text-lg font-black leading-tight">{nextBrewPlan.technique}</p>
          </div>
        </div>
      </article>

      <article class="rounded-[1.75rem] border-3 border-black bg-white p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Prioriterade justeringar</p>
        <div class="mt-4 grid gap-4">
          {#each recommendations as recommendation, index}
            <div class="rounded-2xl border-3 border-black bg-[#fffaf1] p-5">
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

      <article class="rounded-[1.75rem] border-3 border-black bg-[#ffef9f] p-6 shadow-[8px_8px_0_#000] md:p-8">
        <p class="text-sm font-black uppercase tracking-[0.16em] text-black/60">Det har ska du observera nasta kopp</p>
        <ul class="mt-4 grid gap-3 text-base leading-7 text-black/80">
          {#each symptomProfile.watchouts as item}
            <li class="rounded-2xl border-3 border-black bg-white px-4 py-3">{item}</li>
          {/each}
        </ul>
      </article>
    </div>
  </div>
</section>

<style lang="scss">
  @reference "../../styles/styles.css";

  .selector-button {
    @apply rounded-2xl border-3 border-black bg-[#fff7ed] px-4 py-4 text-left text-base font-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5;
  }

  .selector-button--compact {
    @apply py-3;
  }

  .selector-card {
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