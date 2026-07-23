import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outDir = path.join(rootDir, 'out');
const publicDir = path.join(rootDir, 'public');
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
    '/models/*',
    '  Cache-Control: public, max-age=604800, stale-while-revalidate=86400',
    '',
    '/vendor/*',
    '  Cache-Control: public, max-age=604800, stale-while-revalidate=86400',
    '',
    '/workers/*',
    '  Cache-Control: public, max-age=604800, stale-while-revalidate=86400',
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

function getPublicRootHtmlFiles() {
  if (!fs.existsSync(publicDir)) return [];

  return fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function copyPublicRootHtmlFiles() {
  const htmlFiles = getPublicRootHtmlFiles();

  for (const filename of htmlFiles) {
    fs.copyFileSync(path.join(publicDir, filename), path.join(outDir, filename));
  }

  return htmlFiles.length;
}

function removeStaticRedirectsFile() {
  const redirectsPath = path.join(outDir, '_redirects');
  if (!fs.existsSync(redirectsPath)) return false;

  fs.rmSync(redirectsPath);
  return true;
}

function pruneNextSegmentPrefetchFiles() {
  let removedFiles = 0;

  for (const file of walkFiles(outDir)) {
    const filename = path.basename(file);

    if (filename.startsWith('__next') && filename.endsWith('.txt')) {
      fs.rmSync(file);
      removedFiles += 1;
    }
  }

  return removedFiles;
}

function getExportFileCount() {
  return walkFiles(outDir).length;
}

if (!fs.existsSync(outDir)) {
  throw new Error(`Static export directory not found: ${outDir}`);
}

const filesBeforeCleanup = walkFiles(outDir);
const removedMaps = removeSourceMaps(filesBeforeCleanup);
const updatedReferences = removeSourceMapComments(walkFiles(outDir));
writeStaticHeaders();
const removedRedirectsFile = removeStaticRedirectsFile();
const prunedNextPrefetchFiles = pruneNextSegmentPrefetchFiles();
const copiedPublicHtmlFiles = copyPublicRootHtmlFiles();

const remainingMaps = walkFiles(outDir).filter((file) => file.endsWith('.map'));
if (remainingMaps.length > 0) {
  throw new Error(`Source maps remain in static export:\n${remainingMaps.join('\n')}`);
}

const exportFileCount = getExportFileCount();

console.log(
  `Hardened static export: removed ${removedMaps} source map file(s), stripped ${updatedReferences} source map reference(s), wrote out/_headers, ${removedRedirectsFile ? 'removed stale out/_redirects' : 'confirmed out/_redirects is absent'}, pruned ${prunedNextPrefetchFiles} Next segment prefetch file(s), copied ${copiedPublicHtmlFiles} root public HTML file(s), final file count ${exportFileCount}.`
);
