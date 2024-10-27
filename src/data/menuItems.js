import infoIcon from '../components/Navigation/svgs/info.svg?raw'

import toolsIcon from '../components/Navigation/svgs/coffee-pot.svg?raw'
import recipeIcon from '../components/Navigation/svgs/recipe.svg?raw'
import contactIcon from '../components/Navigation/svgs/attribution-pencil.svg?raw'
import blogIcon from '../components/Navigation/svgs/newspaper.svg?raw'
export default [
  { href: '/om-sidan/', icon: infoIcon, label: 'Om sidan' },
  {
    href: '/verktyg/', icon: toolsIcon, label: 'Verktyg',
    subItems: [
      { href: '/verktyg/4-6-metoden/', label: 'Tetsu Kasuyas 4:6-metod' },
      { href: '/verktyg/4-6-metoden/', label: 'Tetsu Kasuyas 4:6-metod' },
      { href: '/verktyg/4-6-metoden/', label: 'Tetsu Kasuyas 4:6-metod' },
      { href: '/verktyg/4-6-metoden/', label: 'Tetsu Kasuyas 4:6-metod' }

    ]
  },
  { href: '/recept/', icon: recipeIcon, label: 'Recept' },
  { href: '/kontakt/', icon: contactIcon, label: 'Kontakt' },
  { href: '/blogg/', icon: blogIcon, label: 'Blogg' },
];