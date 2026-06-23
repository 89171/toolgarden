import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outDir = path.join(rootDir, 'out');
const headersConfigPath = path.join(rootDir, 'lib/security/static-headers.json');

const sourceMapCommentPattern = /(?:^|\n)\s*(?:\/\/# sourceMappingURL=.*\.map\s*|\/\*# sourceMappingURL=.*\.map\s*\*\/\s*)$/gm;
const sourceMapReferencePattern = /sourceMappingURL=.*\.map/;

function readSecurityHeaders() {
  return JSON.parse(fs.readFileSync(headersConfigPath, 'utf8'));
}

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : entryPath;
  });
}

function removeSourceMaps(files) {
  let removed = 0;

  for (const file of files) {
    if (!file.endsWith('.map')) continue;
    fs.rmSync(file);
    removed += 1;
  }

  return removed;
}

function removeSourceMapComments(files) {
  let updated = 0;
  const extensions = new Set(['.js', '.mjs', '.cjs', '.css']);

  for (const file of files) {
    if (!extensions.has(path.extname(file))) continue;
    const source = fs.readFileSync(file, 'utf8');
    if (!sourceMapReferencePattern.test(source)) continue;

    const nextSource = source.replace(sourceMapCommentPattern, '');
    if (nextSource === source) continue;

    fs.writeFileSync(file, nextSource);
    updated += 1;
  }

  return updated;
}

function formatHeadersFile(headers) {
  const globalHeaders = headers
    .map(({ key, value }) => `  ${key}: ${value}`)
    .join('\n');

  return [
    '/*',
    globalHeaders,
    '',
    '/_next/static/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/sw.js',
    '  Cache-Control: no-cache, no-store, must-revalidate',
    '  Service-Worker-Allowed: /',
    '',
    '/manifest.webmanifest',
    '  Cache-Control: public, max-age=86400',
    '',
    '/*.map',
    '  X-Robots-Tag: noindex, nofollow, noarchive',
    '  Cache-Control: no-store',
    '',
  ].join('\n');
}

function writeStaticHeaders() {
  fs.writeFileSync(path.join(outDir, '_headers'), formatHeadersFile(readSecurityHeaders()));
}

if (!fs.existsSync(outDir)) {
  throw new Error(`Static export directory not found: ${outDir}`);
}

const filesBeforeCleanup = walkFiles(outDir);
const removedMaps = removeSourceMaps(filesBeforeCleanup);
const updatedReferences = removeSourceMapComments(walkFiles(outDir));
writeStaticHeaders();

const remainingMaps = walkFiles(outDir).filter((file) => file.endsWith('.map'));
if (remainingMaps.length > 0) {
  throw new Error(`Source maps remain in static export:\n${remainingMaps.join('\n')}`);
}

console.log(
  `Hardened static export: removed ${removedMaps} source map file(s), stripped ${updatedReferences} source map reference(s), wrote out/_headers.`
);
