import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sitemap from '@/app/sitemap';
import { BASE_URL } from '@/lib/tools/seo';

/**
 * 向 IndexNow 聚合端点（https://api.indexnow.org/indexnow）提交新增或有更新的 URL。
 *
 * URL 列表直接调用 app/sitemap.ts 的 sitemap()，不解析生成后的 sitemap.xml、
 * 不正则扫描源码文件（对照 submit-baidu-pages.mjs 的做法：它正则扫描博客源文件时
 * 只覆盖了 3 个，漏掉了大部分博客文章）。sitemap() 才是这个站点 URL 列表的单一
 * 事实源，直接调它就不存在「两处逻辑要保持同步」的问题。sitemap() 不依赖任何
 * Next 运行时请求作用域的 API（没有 headers()/cookies()），用 tsx 在构建流程之外
 * 单独调用是安全的，也不需要先跑完 next build。
 *
 * 与 submit-baidu-pages.mjs 的另一个差异：IndexNow 单次调用能接受的 URL 数量
 * （文档常见口径是上限一万条，实现时可以对照当前文档再确认一遍）远超这个站点
 * 现有的 URL 总数，所以不需要百度脚本那套按每日配额分批 + 游标续跑的复杂度。
 * 换成「按内容是否变化增量提交」：首次运行提交全部 URL，之后只提交新增或
 * lastModified 变化过的 URL。今天 sitemap() 只给博客文章赋 lastModified，
 * 工具页 / 分类页 / 站点信息页没有这个字段——所以这些页面上线后通常只会被
 * 自动提交一次，后续想再催一次要用 --force 或 --url。
 *
 *   npx tsx scripts/submit-indexnow.ts              # 提交新增 / 变化的 URL
 *   npx tsx scripts/submit-indexnow.ts --dry-run    # 只打印会提交什么，不发请求
 *   npx tsx scripts/submit-indexnow.ts --list       # 打印 sitemap() 算出的完整 URL 列表
 *   npx tsx scripts/submit-indexnow.ts --force      # 忽略状态文件，全部重新提交一次
 *   npx tsx scripts/submit-indexnow.ts --url <path> # 只提交一个指定 URL
 */

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');

// IndexNow 的 key 按协议设计就是要公开发布在域名根目录的文件里，不是安全意义上的
// 秘密，因此和 submit-baidu-pages.mjs 里硬编码百度 token 一样，直接写在源码里，
// 不走 env var。对应的公开文件见 public/<KEY>.txt。
const INDEXNOW_KEY = '740e2f01a70446789f5bc4af928b9682';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const DEFAULT_STATE_FILE = path.join(rootDir, '.indexnow-submitted.json');

interface SiteEntry {
  url: string;
  lastmod: string | null;
}

interface SubmittedState {
  [url: string]: { lastmod: string | null; submittedAt: string };
}

interface CliArgs {
  dryRun: boolean;
  list: boolean;
  force: boolean;
  url: string | null;
  stateFile: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    dryRun: false,
    list: false,
    force: false,
    url: null,
    stateFile: process.env.INDEXNOW_STATE_FILE ?? DEFAULT_STATE_FILE,
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
    if (arg === '--force') {
      args.force = true;
      continue;
    }
    if (arg === '--url') {
      const value = argv[index + 1];
      if (!value) throw new Error('--url requires a value');
      args.url = value;
      index += 1;
      continue;
    }
    if (arg === '--state-file') {
      const value = argv[index + 1];
      if (!value) throw new Error('--state-file requires a value');
      args.stateFile = path.resolve(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function normalizeLastModified(value: string | Date | undefined): string | null {
  if (value === undefined) return null;
  return typeof value === 'string' ? value : value.toISOString();
}

function getSiteEntries(): SiteEntry[] {
  return sitemap().map((entry) => ({
    url: entry.url,
    lastmod: normalizeLastModified(entry.lastModified),
  }));
}

function readState(stateFile: string): SubmittedState {
  if (!fs.existsSync(stateFile)) return {};
  return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
}

function writeState(stateFile: string, state: SubmittedState) {
  fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`);
}

/**
 * 判断一个 URL 是否需要提交：状态文件里完全没有它（新增页面）；或者 lastmod
 * 变了（目前只有博客文章会触发）。lastmod 从 null 变成有值也算「变了」——
 * 这是为将来给工具页 / 分类页也补上 lastModified 预留，到时候不用再改这个脚本。
 */
function needsSubmission(entry: SiteEntry, state: SubmittedState): boolean {
  const prior = state[entry.url];
  if (!prior) return true;
  return prior.lastmod !== entry.lastmod;
}

function selectEntriesToSubmit(
  entries: SiteEntry[],
  state: SubmittedState,
  force: boolean
): SiteEntry[] {
  if (force) return entries;
  return entries.filter((entry) => needsSubmission(entry, state));
}

async function submit(urls: string[]): Promise<{ ok: boolean; status: number; body: string }> {
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(BASE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    }),
  });
  const body = await response.text();
  return { ok: response.ok, status: response.status, body };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const entries = getSiteEntries();

  if (args.list) {
    console.log(JSON.stringify(entries.map((entry) => entry.url), null, 2));
    return;
  }

  if (args.url) {
    const target = args.url;
    const match = entries.find(
      (entry) => entry.url === target || entry.url === `${BASE_URL}${target}`
    );
    if (!match) {
      throw new Error(
        `--url ${target} isn't in the current sitemap() output — check the path is correct`
      );
    }

    if (args.dryRun) {
      console.log(`Dry run: would submit 1 URL -> ${match.url}`);
      return;
    }

    const result = await submit([match.url]);
    if (!result.ok) {
      console.error(`HTTP ${result.status}: ${result.body}`);
      process.exitCode = 1;
      return;
    }

    const state = readState(args.stateFile);
    state[match.url] = { lastmod: match.lastmod, submittedAt: new Date().toISOString() };
    writeState(args.stateFile, state);
    console.log(`Submitted 1 URL -> ${match.url} (HTTP ${result.status})`);
    return;
  }

  const state = readState(args.stateFile);
  const toSubmit = selectEntriesToSubmit(entries, state, args.force);

  if (toSubmit.length === 0) {
    console.log(`0 / ${entries.length} URL(s) need submitting.`);
    return;
  }

  if (args.dryRun) {
    console.log(`Dry run: would submit ${toSubmit.length} / ${entries.length} URL(s):`);
    for (const entry of toSubmit) console.log(`  ${entry.url}`);
    return;
  }

  const result = await submit(toSubmit.map((entry) => entry.url));
  if (!result.ok) {
    console.error(`HTTP ${result.status}: ${result.body}`);
    console.error('State file left untouched — the next run will retry this same batch.');
    process.exitCode = 1;
    return;
  }

  const submittedAt = new Date().toISOString();
  for (const entry of toSubmit) {
    state[entry.url] = { lastmod: entry.lastmod, submittedAt };
  }
  writeState(args.stateFile, state);
  console.log(`Submitted ${toSubmit.length} / ${entries.length} URL(s). HTTP ${result.status}.`);
}

main().catch((error) => {
  process.exitCode = 1;
  console.error(error instanceof Error ? error.message : error);
});
