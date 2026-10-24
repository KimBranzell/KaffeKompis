import { readdir, readFile } from 'node:fs/promises';
import { compile, preprocess } from 'svelte/compiler';
import { vitePreprocess } from '@astrojs/svelte';

async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? filesIn(`${directory}/${entry.name}`) : `${directory}/${entry.name}`))).flat();
}
let errors = 0;
const files = (await filesIn('src')).filter(file => file.endsWith('.svelte'));
for (const filename of files) {
  try {
    const source = await preprocess(await readFile(filename, 'utf8'), vitePreprocess(), { filename });
    const result = compile(source.code, { filename });
    for (const warning of result.warnings) {
      console.error(`${filename}:${warning.start?.line ?? 1}: ${warning.code}: ${warning.message}`);
      errors++;
    }
  } catch (error) {
    console.error(`${filename}:${error.start?.line ?? 1}: ${error.message}`);
    errors++;
  }
}
console.log(`Checked ${files.length} Svelte components; ${errors} compiler errors or warnings.`);
if (errors) process.exitCode = 1;
