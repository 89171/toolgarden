import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = path.join(projectRoot, 'node_modules', 'espeak-ng');
const targetDirectory = path.join(projectRoot, 'public', 'vendor', 'espeak-ng');
const ortSourceDirectory = path.join(projectRoot, 'node_modules', 'onnxruntime-web', 'dist');
const ortTargetDirectory = path.join(projectRoot, 'public', 'models', 'onnxruntime-web');

await mkdir(targetDirectory, { recursive: true });
await mkdir(ortTargetDirectory, { recursive: true });
await Promise.all([
  copyFile(path.join(sourceDirectory, 'dist', 'espeak-ng.js'), path.join(targetDirectory, 'espeak-ng.js')),
  copyFile(path.join(sourceDirectory, 'dist', 'espeak-ng.wasm'), path.join(targetDirectory, 'espeak-ng.wasm')),
  copyFile(path.join(sourceDirectory, 'LICENSE'), path.join(targetDirectory, 'LICENSE')),
  copyFile(
    path.join(ortSourceDirectory, 'ort-wasm-simd-threaded.jsep.mjs'),
    path.join(ortTargetDirectory, 'ort-wasm-simd-threaded.jsep.mjs'),
  ),
  copyFile(
    path.join(ortSourceDirectory, 'ort-wasm-simd-threaded.jsep.wasm'),
    path.join(ortTargetDirectory, 'ort-wasm-simd-threaded.jsep.wasm'),
  ),
]);
