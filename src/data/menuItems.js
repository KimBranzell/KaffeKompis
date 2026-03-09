import infoIcon from '../components/Navigation/svgs/info.svg?raw'

import toolsIcon from '../components/Navigation/svgs/coffee-pot.svg?raw'
import recipeIcon from '../components/Navigation/svgs/recipe.svg?raw'
import contactIcon from '../components/Navigation/svgs/attribution-pencil.svg?raw'
import blogIcon from '../components/Navigation/svgs/newspaper.svg?raw'

const base = import.meta.env.BASE_URL;
const withBase = (path) => `${base}${path}`;

export default [
  { href: withBase('om-sidan/'), icon: infoIcon, label: 'Om sidan' },
  {
    href: withBase('verktyg/'), icon: toolsIcon, label: 'Verktyg',
    subItems: [
      { href: withBase('verktyg/4-6-metoden/'), label: 'Tetsu Kasuyas 4:6-metod', description: 'Interaktiv guide för 4:6-bryggning.' },
      { href: withBase('verktyg/kaffe-till-vatten-kalkylator/'), label: 'Kaffe till vatten-kalkylator', description: 'Räkna snabbt ut rätt bryggratio.' },
      { href: withBase('verktyg/bryggfelsokning/'), label: 'Bryggfelsokning', description: 'Felsok smaken och valj nasta justering snabbare.' }
    ]
  },
  { href: withBase('recept/'), icon: recipeIcon, label: 'Recept' },
  { href: withBase('kontakt/'), icon: contactIcon, label: 'Kontakt' },
  { href: withBase('blogg/'), icon: blogIcon, label: 'Blogg' },
];