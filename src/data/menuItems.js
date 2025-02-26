import infoIcon from '../components/Navigation/svgs/info.svg?raw'

import toolsIcon from '../components/Navigation/svgs/coffee-pot.svg?raw'
import recipeIcon from '../components/Navigation/svgs/recipe.svg?raw'
import contactIcon from '../components/Navigation/svgs/attribution-pencil.svg?raw'
import blogIcon from '../components/Navigation/svgs/newspaper.svg?raw'

const base = import.meta.env.BASE_URL || '/KaffeKompis';

export default [
  { href: `${base}om-sidan/`, icon: infoIcon, label: 'Om sidan' },
  {
    href: `${base}verktyg/`, icon: toolsIcon, label: 'Verktyg',
    subItems: [
      { href: `${base}verktyg/4-6-metoden/`, label: 'Tetsu Kasuyas 4:6-metod' },
      { href: `${base}verktyg/4-6-metoden/`, label: 'Tetsu Kasuyas 4:6-metod' },
      { href: `${base}verktyg/4-6-metoden/`, label: 'Tetsu Kasuyas 4:6-metod' },
      { href: `${base}verktyg/4-6-metoden/`, label: 'Tetsu Kasuyas 4:6-metod' }
    ]
  },
  { href: `${base}/recept/`, icon: recipeIcon, label: 'Recept' },
  { href: `${base}/kontakt/`, icon: contactIcon, label: 'Kontakt' },
  { href: `${base}/blogg/`, icon: blogIcon, label: 'Blogg' },
];