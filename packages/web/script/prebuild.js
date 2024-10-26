// This script is executed before the build process starts. It can be used to
// do some pre-build tasks like copying files, etc. that are required for the
// build process.

import { existsSync, mkdirSync, readdirSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

// Strudel
// * mkdir -p public/assets
// * cp ../../node_modules/@strudel/core/dist/assets/clockworker--*.js to /public/assets/

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicAssetsDir = resolve(__dirname, '../public/assets');
const strudelAssetsDir = resolve(__dirname, '../../../node_modules/@strudel/core/dist/assets');

if (!existsSync(publicAssetsDir)) {
  mkdirSync(publicAssetsDir, { recursive: true });
}

const files = readdirSync(strudelAssetsDir).filter(file => file.startsWith('clockworker--'));
files.forEach(file => {
  const src = resolve(strudelAssetsDir, file);
  const dest = resolve(publicAssetsDir, file);
  copyFileSync(src, dest);
});
