import { writable, derived } from 'svelte/store';

let storedValue;

function createRoastStore() {
  // Only get from localStorage on first initialization
  if (!storedValue) {
    storedValue = globalThis?.localStorage?.getItem('roastGrade') || 'Light';
  }

  const { subscribe, set, update } = writable(storedValue);

  return {
    subscribe,
    set: (value) => {
      if (value) {
        storedValue = value;
        globalThis?.localStorage?.setItem('roastGrade', value);
        set(value);
      } else {
        set('Light');
      }
    },
    update
  };
}


export const roastGrade = createRoastStore();



// Core brewing parameters
export const coffeeWeight = writable(20);
export const waterRatio = writable(15);

roastGrade.subscribe(value => {
  console.log('Store value changed to:', value);
});
export const brewingTemperature = derived(roastGrade, $roastGrade => {
  switch ($roastGrade) {
    case 'Light': return 93;
    case 'Medium': return 88;
    case 'Dark': return 83;
    default: return 93;
  }
});

// Brewing state
export const brewingSchedule = writable([]);
export const currentStep = writable(0);
export const isBrewing = writable(false);
export const totalTime = writable(0);

// Derived values
export const waterWeight = derived(
  [coffeeWeight, waterRatio],
  ([$coffeeWeight, $waterRatio]) => $coffeeWeight * $waterRatio
);
