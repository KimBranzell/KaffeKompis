const base = import.meta.env.BASE_URL;
const withBase = path => `${base}${path}`;

export default [
  { href: withBase('recept/'), label: 'Recept' },
  {
    href: withBase('verktyg/'), label: 'Verktyg',
    subItems: [
      { href: withBase('verktyg/'), label: 'Alla verktyg' },
      { href: withBase('verktyg/4-6-metoden/'), label: '4:6-metoden' },
      { href: withBase('verktyg/kaffe-till-vatten-kalkylator/'), label: 'Kaffe till vatten-kalkylator' },
      { href: withBase('verktyg/bryggfelsokning/'), label: 'Bryggfelsökning' },
    ],
  },
  { href: withBase('blogg/'), label: 'Blogg' },
  { href: withBase('om-sidan/'), label: 'Om sidan' },
  { href: withBase('kontakt/'), label: 'Kontakt' },
];
