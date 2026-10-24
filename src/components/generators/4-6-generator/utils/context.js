import { getContext } from 'svelte';

export const BREWING_CONTEXT = Symbol('brewing');
export function getBrewingStore() {
  return getContext(BREWING_CONTEXT);
}
