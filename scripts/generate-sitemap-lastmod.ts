import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hubPaths, sitePageRegistry } from '../lib/site/registry';
import {
  getAudioTools,
  getFileMergeTools,
  getImageTools,
  getJsonTools,
  getOtherTools,
  getPdfTools,
  getTextTools,
  toolRegistry,
} from '../lib/tools/registry';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, '..');
const outputPath = path.join(rootDir, 'lib/site/sitemap-lastmod.generated.json');

type RouteDates = Record<string, string>;

const hubTools = new Map<string, typeof toolRegistry>([
  ['/json-tools', getJsonTools()],
  ['/image', getImageTools()],
  ['/audio', getAudioTools()],
  ['/pdf', getPdfTools()],
  ['/file-merge', getFileMergeTools()],
  ['/text', getTextTools()],
  ['/other', getOtherTools()],
]);

function latestDate(values: string[]): string {
  return values.reduce((latest, value) => value > latest ? value : latest, '');
}

function getGitDate(relativePaths: string[]): string {
  const trackedPaths = relativePaths.filter((relativePath) =>
    fs.existsSync(path.join(rootDir, relativePath))
  );
  if (trackedPaths.length === 0) return '';

  return execFileSync(
    'git',
    ['--literal-pathspecs', 'log', '-1', '--format=%cs', '--', ...trackedPaths],
    { cwd: rootDir, encoding: 'utf8' }
  ).trim();
}

function requireDate(routePath: string, candidates: string[]): string {
  const date = latestDate(candidates.filter(Boolean));
  if (!date) throw new Error(`Could not derive sitemap lastmod for ${routePath || '/'}`);
  return date;
}

function generateRouteDates(): RouteDates {
  const dates: RouteDates = {};

  for (const tool of toolRegistry) {
    dates[tool.path] = requireDate(tool.path, [
      getGitDate([
        `app/[locale]${tool.path}`,
        `lib/tools/content/${tool.id}.ts`,
      ]),
    ]);
  }

  for (const hubPath of hubPaths) {
    const childDates = (hubTools.get(hubPath) ?? []).map((tool) => dates[tool.path]);
    dates[hubPath] = requireDate(hubPath, [
      getGitDate([`app/[locale]${hubPath}`]),
      ...childDates,
    ]);
  }

  for (const page of sitePageRegistry) {
    dates[page.path] = requireDate(page.path, [
      getGitDate([`app/[locale]${page.path}`]),
    ]);
  }

  dates[''] = requireDate('/', [
    getGitDate(['app/page.tsx', 'components/HomePageContent.tsx']),
    ...Object.values(dates),
  ]);

  return Object.fromEntries(
    Object.entries(dates).sort(([left], [right]) => left.localeCompare(right))
  );
}

if (!fs.existsSync(path.join(rootDir, '.git'))) {
  if (!fs.existsSync(outputPath)) {
    throw new Error('Git metadata is unavailable and no generated sitemap lastmod file exists.');
  }
  console.log('Preserved generated sitemap lastmod metadata because Git history is unavailable.');
} else {
  const dates = generateRouteDates();
  fs.writeFileSync(outputPath, `${JSON.stringify(dates, null, 2)}\n`);
  console.log(`Generated sitemap lastmod metadata for ${Object.keys(dates).length} routes.`);
}
