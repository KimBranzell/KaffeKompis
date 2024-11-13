/**
 * Constants used in the 4:6 coffee brewing generator.
 * These values represent the initial delay and pour fractions used in the 4:6 brewing method.
 */
export const BREWING_CONSTANTS = {
  /** Initial delay before starting the brewing process */
  INITIAL_DELAY_SECONDS: 0,

  /** Ratio of water used in the first pour (40%) */
  FIRST_POUR_RATIO: 0.4,

  /** Ratio of water used in the second pour (60%) */
  SECOND_POUR_RATIO: 0.6,

  /** Pour fraction for acidic taste profile (2/3) */
  ACIDIC_POUR_FRACTION: 2/3,

  /** Pour fraction for sweet taste profile (1/3) */
  SWEET_POUR_FRACTION: 1/3,

  /** Pour fraction for balanced taste profile (1/2) */
  EVEN_POUR_FRACTION: 1/2
};

/**
 * Option sets for coffee customization.
 * These define the available choices for coffee strength and taste profiles.
 */
export const OPTION_SETS = {
  /** Options for coffee strength selection */
  strengthOptions: [
    { value: 'Strong', label: 'Starkt' },
    { value: 'Balanced', label: 'Balanserat' },
    { value: 'Weak', label: 'Svagt' }
  ],

  /** Options for coffee taste profile selection */
  tasteOptions: [
    { value: 'Acidic', label: 'Syrligt' },
    { value: 'Balanced', label: 'Balanserat' },
    { value: 'Sweet', label: 'Sött' }
  ],
  ratioOptions: [
    { value: '1:13', label: '1:13' },
    { value: '1:14', label: '1:14' },
    { value: '1:15', label: '1:15' },
    { value: '1:16', label: '1:16' }
  ]
};

/**
 * Known coffee weights and corresponding grind sizes for interpolation
 */
export const KNOWN_GRIND_SIZES = [
  { coffeeWeight: 6, grindSize: 700 },
  { coffeeWeight: 40, grindSize: 1000 },
  { coffeeWeight: 76, grindSize: 1200 }
];
