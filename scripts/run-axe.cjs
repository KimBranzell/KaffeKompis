#!/usr/bin/env node
(async () => {
  try {
    // In CommonJS, `import.meta` is not available. Build a file:// URL for
    // the ESM script using __dirname and path utilities so we can dynamically
    // import it.
    const path = require('path');
    const { pathToFileURL } = require('url');
    const esmPath = path.join(__dirname, 'run-axe.js');
    await import(pathToFileURL(esmPath).href);
  } catch (err) {
    console.error('Failed to run ESM axe runner:', err);
    process.exit(1);
  }
})();
