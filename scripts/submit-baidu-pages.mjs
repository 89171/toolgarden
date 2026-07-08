import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');

const DEFAULT_SITE_URL = 'https://toolgarden.xyz';
const DEFAULT_PROGRESS_FILE = path.join(rootDir, '.baidu-submit-progress.json');
const DEFAULT_BATCH_SIZE = 1;
const locales = ['zh', 'en'];
const blogSourceFiles = [
  'lib/blog/workflow-seo-articles.ts',
  'lib/blog/seo-articles.ts',
  'lib/blog/articles.ts',
];

function parseArgs(argv) {
  const args = {
    dryRun: false,
    list: false,
    reset: false,
    max: Number.POSITIVE_INFINITY,
    batchSize: Number(process.env.BAIDU_PUSH_BATCH_SIZE ?? DEFAULT_BATCH_SIZE),
    progressFile: process.env.BAIDU_PUSH_PROGRESS_FILE ?? DEFAULT_PROGRESS_FILE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--dry-run') {
      args.dryRun = true;
      continue;
    }
    if (arg === '--list') {
      args.list = true;
      continue;
    }
    if (arg === '--reset') {
      args.reset = true;
      continue;
    }
    if (arg === '--max') {
      args.max = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--batch-size') {
      args.batchSize = Number(argv[index + 1]);
      index += 1;
      continue;
    }
    if (arg === '--progress-file') {
      args.progressFile = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(args.batchSize) || args.batchSize <= 0) {
    throw new Error('--batch-size must be a positive integer');
  }
  if (!Number.isFinite(args.max) && args.max !== Number.POSITIVE_INFINITY) {
    throw new Error('--max must be a positive integer');
  }
  if (args.max !== Number.POSITIVE_INFINITY && (!Number.isInteger(args.max) || args.max <= 0)) {
    throw new Error('--max must be a positive integer');
  }

  return args;
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

function extractQuotedFieldValues(source, fieldName) {
  const pattern = new RegExp(`${fieldName}:\\s*'([^']+)'`, 'g');
  return [...source.matchAll(pattern)].map((match) => match[1]);
}

function extractStringArrayConst(source, constName) {
  const pattern = new RegExp(`const\\s+${constName}\\s*=\\s*\\[([\\s\\S]*?)\\]\\s*(?:as const)?`);
  const match = source.match(pattern);
  if (!match) {
    throw new Error(`Could not find const array: ${constName}`);
  }

  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function unique(values) {
  return [...new Set(values)];
}

function getHubPaths() {
  return extractStringArrayConst(readSource('app/sitemap.ts'), 'hubPaths');
}

function getToolPaths() {
  return extractQuotedFieldValues(readSource('lib/tools/registry.ts'), 'path');
}

function getBlogIndexPath() {
  const match = readSource('lib/blog/articles.ts').match(
    /export\s+const\s+BLOG_INDEX_PATH\s*=\s*'([^']+)'/
  );
  if (!match) {
    throw new Error('Could not find BLOG_INDEX_PATH');
  }

  return match[1];
}

function getBlogPaths() {
  const blogIndexPath = getBlogIndexPath();
  const slugs = blogSourceFiles.flatMap((sourceFile) =>
    extractQuotedFieldValues(readSource(sourceFile), 'slug')
  );

  return [blogIndexPath, ...unique(slugs).map((slug) => `${blogIndexPath}/${slug}`)];
}

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, '');
}

function getPageUrls() {
  const siteUrl = normalizeSiteUrl(process.env.BAIDU_PUSH_SITE ?? DEFAULT_SITE_URL);
  const paths = ['', ...getHubPaths(), ...getBlogPaths(), ...getToolPaths()];

  return locales.flatMap((locale) => paths.map((routePath) => `${siteUrl}/${locale}${routePath}`));
}

function hashUrls(urls) {
  return crypto.createHash('sha256').update(urls.join('\n')).digest('hex');
}

function readProgress(progressFile) {
  if (!fs.existsSync(progressFile)) return null;
  return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
}

function writeProgress(progressFile, progress) {
  fs.writeFileSync(progressFile, `${JSON.stringify(progress, null, 2)}\n`);
}

function resolveStartIndex(progress, urls, urlsHash, reset) {
  if (reset || !progress) return 0;
  if (progress.urlsHash === urlsHash) {
    return Math.min(Math.max(Number(progress.nextIndex ?? 0), 0), urls.length);
  }

  const resumeUrl = progress.nextUrl ?? progress.lastError?.url;
  if (resumeUrl && urls.includes(resumeUrl)) {
    return urls.indexOf(resumeUrl);
  }

  return Math.min(Math.max(Number(progress.nextIndex ?? 0), 0), urls.length);
}

function createProgress(urls, urlsHash, nextIndex, extra = {}) {
  return {
    site: normalizeSiteUrl(process.env.BAIDU_PUSH_SITE ?? DEFAULT_SITE_URL),
    total: urls.length,
    urlsHash,
    nextIndex,
    nextUrl: urls[nextIndex] ?? null,
    updatedAt: new Date().toISOString(),
    ...extra,
  };
}

function getBaiduEndpoint() {
  if (process.env.BAIDU_PUSH_ENDPOINT) return process.env.BAIDU_PUSH_ENDPOINT;

  const site = normalizeSiteUrl(process.env.BAIDU_PUSH_SITE ?? DEFAULT_SITE_URL);
  const token = '6syiQomAuMVfC2kG';
  if (!token) {
    throw new Error(
      'Missing BAIDU_PUSH_TOKEN. Run with BAIDU_PUSH_TOKEN=... npm run submit:baidu'
    );
  }

  return `http://data.zz.baidu.com/urls?site=${site}&token=${encodeURIComponent(token)}`;
}

function parseBaiduResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function postPlainTextUrls(endpoint, body) {
  const url = new URL(endpoint);
  const transport = url.protocol === 'https:' ? https : http;
  const bodyBuffer = Buffer.from(body, 'utf8');

  return new Promise((resolve, reject) => {
    const request = transport.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        method: 'POST',
        path: `${url.pathname}${url.search}`,
        headers: {
          'User-Agent': 'curl/7.12.1',
          Host: url.host,
          'Content-Type': 'text/plain',
          'Content-Length': bodyBuffer.byteLength,
        },
      },
      (response) => {
        response.setEncoding('utf8');
        let responseText = '';

        response.on('data', (chunk) => {
          responseText += chunk;
        });
        response.on('end', () => {
          resolve({
            ok: response.statusCode >= 200 && response.statusCode < 300,
            statusCode: response.statusCode,
            text: responseText,
          });
        });
      }
    );

    request.on('error', reject);
    request.end(bodyBuffer);
  });
}

async function submitBatch(endpoint, batchUrls) {
  const body = batchUrls.join('\n');
  const response = await postPlainTextUrls(endpoint, body);
  const data = parseBaiduResponse(response.text);

  if (!response.ok) {
    throw new Error(`HTTP ${response.statusCode}: ${response.text}`);
  }
  if (!data) {
    throw new Error(`Invalid JSON response: ${response.text}`);
  }
  if (data.error) {
    throw new Error(`Baidu error ${data.error}: ${data.message ?? response.text}`);
  }

  const success = Number(data.success ?? 0);
  if (!Number.isInteger(success) || success < 0) {
    throw new Error(`Unexpected success count: ${response.text}`);
  }

  return {
    data,
    success: Math.min(success, batchUrls.length),
    raw: response.text,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const urls = getPageUrls();
  const urlsHash = hashUrls(urls);
  const existingProgress = readProgress(args.progressFile);
  let nextIndex = resolveStartIndex(existingProgress, urls, urlsHash, args.reset);

  if (args.list) {
    console.log(JSON.stringify(urls, null, 2));
    return;
  }

  if (args.dryRun) {
    console.log(
      `Dry run: ${urls.length} URL(s), next index ${nextIndex}, next URL ${urls[nextIndex] ?? 'none'}`
    );
    return;
  }

  const endpoint = getBaiduEndpoint();
  const limitIndex = Math.min(urls.length, nextIndex + args.max);

  if (nextIndex >= urls.length) {
    writeProgress(
      args.progressFile,
      createProgress(urls, urlsHash, urls.length, { completedAt: new Date().toISOString() })
    );
    console.log(`All ${urls.length} URL(s) have already been submitted.`);
    return;
  }

  while (nextIndex < limitIndex) {
    const batchUrls = urls.slice(nextIndex, Math.min(limitIndex, nextIndex + args.batchSize));
    console.log(`Submitting ${nextIndex + 1}-${nextIndex + batchUrls.length}/${urls.length}`);

    try {
      const result = await submitBatch(endpoint, batchUrls);
      nextIndex += result.success;

      if (result.success < batchUrls.length) {
        const failedUrl = batchUrls[result.success];
        writeProgress(
          args.progressFile,
          createProgress(urls, urlsHash, nextIndex, {
            lastError: {
              message: 'Partial success from Baidu response',
              url: failedUrl,
              response: result.data,
              at: new Date().toISOString(),
            },
          })
        );
        process.exitCode = 1;
        console.error(`Stopped at ${failedUrl}: partial success response ${result.raw}`);
        return;
      }

      writeProgress(
        args.progressFile,
        createProgress(urls, urlsHash, nextIndex, {
          lastResponse: result.data,
        })
      );

      if (Number(result.data.remain) === 0 && nextIndex < urls.length) {
        writeProgress(
          args.progressFile,
          createProgress(urls, urlsHash, nextIndex, {
            stoppedReason: 'Baidu daily quota exhausted',
            lastResponse: result.data,
          })
        );
        console.log('Baidu daily quota exhausted. Progress saved for the next run.');
        return;
      }
    } catch (error) {
      writeProgress(
        args.progressFile,
        createProgress(urls, urlsHash, nextIndex, {
          lastError: {
            message: error instanceof Error ? error.message : String(error),
            url: batchUrls[0],
            at: new Date().toISOString(),
          },
        })
      );
      process.exitCode = 1;
      console.error(`Stopped at ${batchUrls[0]}: ${error instanceof Error ? error.message : error}`);
      return;
    }
  }

  if (nextIndex >= urls.length) {
    writeProgress(
      args.progressFile,
      createProgress(urls, urlsHash, urls.length, { completedAt: new Date().toISOString() })
    );
    console.log(`Submitted all ${urls.length} URL(s).`);
    return;
  }

  writeProgress(
    args.progressFile,
    createProgress(urls, urlsHash, nextIndex, { stoppedReason: 'Reached --max limit' })
  );
  console.log(`Reached --max limit. Progress saved at index ${nextIndex}.`);
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error instanceof Error ? error.message : error);
});
