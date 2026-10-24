#!/usr/bin/env node
const { runBrowserChecks } = require('./verify-browser.cjs');
runBrowserChecks({ interactions: false }).catch(error => { console.error(error); process.exitCode = 1; });
