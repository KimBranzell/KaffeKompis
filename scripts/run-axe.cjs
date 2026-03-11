#!/usr/bin/env node
(async () => {
  try {
    // Import the ESM runner from run-axe.js. This keeps CI compatible when
    // package.json uses "type": "module" but callers run Node in CJS mode.
    await import(new URL('./run-axe.js', import.meta.url).href);
  } catch (err) {
    console.error('Failed to run ESM axe runner:', err);
    process.exit(1);
  }
})();
