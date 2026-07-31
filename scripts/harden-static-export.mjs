import crypto from 'node:crypto';
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

/**
 * 给 Service Worker 的 CACHE_NAME 打上本次构建的指纹。
 *
 * sw.js 对 /_next/static/ 用 Cache-First，注释里的前提是「内容哈希命名，可
 * 永久缓存」——但这个前提不成立：Turbopack 在此项目产出的 chunk 名按模块 id
 * 生成，跨构建是稳定的（例如 08hakoypo3m83.js 在内容变化后仍是同一个名字）。
 * 于是旧内容会在同一个 URL 上被永久命中，新部署的 JS 永远不生效。
 *
 * 已实测复现：Worker 加载到的是上一次构建的代码，导致新增字段整段丢失；
 * 手动注销 SW 并清掉 json-toolkit-v4 后立刻恢复正常。
 *
 * 这里按 chunk 清单算一个哈希写进 CACHE_NAME，内容变了缓存桶就换名，
 * activate 阶段的既有逻辑会自动删掉旧桶。
 */
function stampServiceWorkerCacheName() {
  const swPath = path.join(outDir, 'sw.js');
  if (!fs.existsSync(swPath)) return null;

  const staticDir = path.join(outDir, '_next/static');
  const fingerprint = crypto.createHash('sha256');
  if (fs.existsSync(staticDir)) {
    // 必须按内容而不是文件大小做指纹：改一行代码而字节数不变的情况很常见，
    // 用大小会让指纹不变，缓存桶不换名，这个修复就等于没做。
    for (const file of walkFiles(staticDir).sort()) {
      fingerprint.update(path.relative(outDir, file));
      fingerprint.update(fs.readFileSync(file));
    }
  }
  const buildId = fingerprint.digest('hex').slice(0, 12);

  const source = fs.readFileSync(swPath, 'utf8');
  const pattern = /const CACHE_NAME = '([^']+)'/;
  if (!pattern.test(source)) {
    throw new Error('Could not find CACHE_NAME in out/sw.js');
  }

  const base = source.match(pattern)[1].replace(/-build-[0-9a-f]+$/, '');
  const stamped = `${base}-build-${buildId}`;
  fs.writeFileSync(swPath, source.replace(pattern, `const CACHE_NAME = '${stamped}'`));
  return stamped;
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
const serviceWorkerCacheName = stampServiceWorkerCacheName();

const remainingMaps = walkFiles(outDir).filter((file) => file.endsWith('.map'));
if (remainingMaps.length > 0) {
  throw new Error(`Source maps remain in static export:\n${remainingMaps.join('\n')}`);
}

const exportFileCount = getExportFileCount();

console.log(
  `Hardened static export: removed ${removedMaps} source map file(s), stripped ${updatedReferences} source map reference(s), wrote out/_headers, ${removedRedirectsFile ? 'removed stale out/_redirects' : 'confirmed out/_redirects is absent'}, pruned ${prunedNextPrefetchFiles} Next segment prefetch file(s), copied ${copiedPublicHtmlFiles} root public HTML file(s), service worker cache ${serviceWorkerCacheName ?? 'not stamped (sw.js missing)'}, final file count ${exportFileCount}.`
);
