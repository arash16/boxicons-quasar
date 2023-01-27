const path = require('path');
const { readdir, readFile, writeFile } = require('fs/promises');
const camelCase = require('lodash.camelcase');
const convert = require('./convert');

// Download from https://boxicons.com

async function generate() {
  const jsLines = [];
  const mjsLines = [];
  const dtsLines = [];
  const jsonNames = [];
  for (const folder of ['regular', 'solid', 'logos']) {
    const basePath = `./boxicons-2.1.4/svg/${folder}`;
    const files = await readdir(basePath);
    for (const ico of files) {
      const id = camelCase(ico.replace(/\.svg$/, ''));
      const cont = await readFile(path.join(basePath, ico), 'utf-8');

      const iconStr = convert(cont);
      jsonNames.push(id);
      dtsLines.push(`export declare const ${id}: string;`);
      jsLines.push(`module.exports.${id} = '${iconStr}';`)
      mjsLines.push(`export const ${id} = '${iconStr}';`);
    }
  }

  writeFile('dist/boxicons-quasar.json', JSON.stringify(jsonNames, null, 2));
  writeFile('dist/boxicons-quasar.d.ts', dtsLines.join('\n'));
  writeFile('dist/boxicons-quasar.js', jsLines.join('\n'));
  writeFile('dist/boxicons-quasar.mjs', mjsLines.join('\n'));
}

generate();
