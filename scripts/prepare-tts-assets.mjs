import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(projectRoot, 'node_modules', 'espeak-ng');
const targetDirectory = path.join(projectRoot, 'public', 'vendor', 'espeak-ng');

await mkdir(targetDirectory, { recursive: true });
await Promise.all([
  copyFile(path.join(sourceDirectory, 'dist', 'espeak-ng.js'), path.join(targetDirectory, 'espeak-ng.js')),
  copyFile(path.join(sourceDirectory, 'dist', 'espeak-ng.wasm'), path.join(targetDirectory, 'espeak-ng.wasm')),
  copyFile(path.join(sourceDirectory, 'LICENSE'), path.join(targetDirectory, 'LICENSE')),
]);
