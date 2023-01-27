const path = require('path');
const { readdir, readFile, writeFile } = require('fs/promises');
const camelCase = require('lodash.camelcase');

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
      if (!cont.includes('viewBox="0 0 24 24"')) {
        console.log('No standard viewbox for:', ico)
        continue
      }

      const reExtractPath = /\s+d="([^"]+)"/g;
      const iconPaths = [];
      for (let m = reExtractPath.exec(cont); m; m = reExtractPath.exec(cont)) {
        iconPaths.push(m[1]);
      }

      if (iconPaths.length) {
        const iconStr = iconPaths.join('&&');
        jsonNames.push(id);
        dtsLines.push(`export declare const ${id}: string;`);
        jsLines.push(`module.exports.${id} = '${iconStr}';`)
        mjsLines.push(`export const ${id} = '${iconStr}';`);
      } else {
        console.log('No <path> for:', ico);
      }
    }
  }

  writeFile('dist/boxicons-quasar.json', JSON.stringify(jsonNames, null, 2));
  writeFile('dist/boxicons-quasar.d.ts', dtsLines.join('\n'));
  writeFile('dist/boxicons-quasar.js', jsLines.join('\n'));
  writeFile('dist/boxicons-quasar.mjs', mjsLines.join('\n'));
}

generate();
