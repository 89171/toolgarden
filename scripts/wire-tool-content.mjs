#!/usr/bin/env node
/**
 * 把 lib/tools/content/<id>.ts 接到对应工具页的 <ToolLayout>。
 *
 * 为什么要显式接线，而不是让 ToolLayout 按 id 查表：
 * 查表会把 87 个工具的正文全部拉进 ToolLayout 所在的共享 chunk，
 * 于是每个工具页都要下载全站正文。由各自的 page.tsx import 自己的内容模块，
 * Next.js 的按路由分包才能生效。
 *
 * 这个脚本是幂等的：已经接好的页面会被跳过。
 *
 *   node scripts/wire-tool-content.mjs            # 接所有已存在的内容模块
 *   node scripts/wire-tool-content.mjs --check    # 只报告状态，不改文件
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = 'lib/tools/content';
const SKIP = new Set(['define.ts', 'index.ts', 'types.ts']);
const checkOnly = process.argv.includes('--check');

/** 从 registry.ts 读取 id -> path，用来定位工具页文件。 */
function readRegistryPaths() {
  const src = readFileSync('lib/tools/registry.ts', 'utf8');
  const paths = new Map();
  const re = /id:\s*'([^']+)',[\s\S]*?path:\s*'([^']+)',/g;
  for (const [, id, path] of src.matchAll(re)) {
    if (!paths.has(id)) paths.set(id, path);
  }
  return paths;
}

/** content 模块导出的变量名：json-format -> jsonFormatContent */
function exportName(id) {
  return `${id.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())}Content`;
}

/**
 * 找出真正渲染 <ToolLayout toolId="<id>"> 的文件。
 *
 * 三种情况：
 *  1. page.tsx 自己渲染 ToolLayout —— 就地接线。
 *  2. page.tsx 只是渲染一个 1:1 的组件（如 PdfMergeTool）—— 接到那个组件里。
 *  3. 多个工具共用一个组件（AudioTool / FileMergeTool 等，toolId 由 prop 传入）——
 *     由 page.tsx import 当前路由的正文并通过 content prop 传入，继续保持按路由分包。
 *     脚本能识别已完成的接线，但不会猜测共享组件的 prop 结构。
 */
function locateToolLayout(id, pagePath) {
  const literal = new RegExp(`<ToolLayout(?:\\s+[^>]*?)?toolId=(?:"${id}"|\\{'${id}'\\})`);
  const pageSrc = readFileSync(pagePath, 'utf8');
  if (literal.test(pageSrc)) return { file: pagePath, src: pageSrc };

  for (const [, componentPath] of pageSrc.matchAll(
    /import \{ \w+ \} from '@\/components\/([\w/]+)'/g
  )) {
    const file = `components/${componentPath}.tsx`;
    if (!existsSync(file)) continue;
    const src = readFileSync(file, 'utf8');
    if (literal.test(src)) return { file, src };
  }
  return null;
}

const registryPaths = readRegistryPaths();
const results = { wired: [], already: [], missingPage: [], noToolLayout: [], badExport: [] };

for (const file of readdirSync(CONTENT_DIR).sort()) {
  if (!file.endsWith('.ts') || SKIP.has(file)) continue;
  const id = file.replace(/\.ts$/, '');
  const name = exportName(id);

  if (!readFileSync(join(CONTENT_DIR, file), 'utf8').includes(`export const ${name}`)) {
    results.badExport.push(`${id} (expected export const ${name})`);
    continue;
  }

  const toolPath = registryPaths.get(id);
  const pagePath = toolPath ? join('app/[locale]', toolPath, 'page.tsx') : null;
  if (!pagePath || !existsSync(pagePath)) {
    results.missingPage.push(id);
    continue;
  }

  // 共享组件由路由把专属 content 作为 prop 传入。这样既保持按路由分包，
  // 也避免共享组件维护一份会随工具数量增长的正文索引。
  const pageSrc = readFileSync(pagePath, 'utf8');
  if (pageSrc.includes(`content={${name}}`)) {
    results.already.push(id);
    continue;
  }

  const target = locateToolLayout(id, pagePath);
  if (!target) {
    results.noToolLayout.push(id);
    continue;
  }

  const { file: targetPath, src } = target;
  if (src.includes(`content={${name}}`)) {
    results.already.push(id);
    continue;
  }

  const targetLayout = new RegExp(
    `(<ToolLayout(?:\\s+[^>]*?)?toolId=(?:"${id}"|\\{'${id}'\\})[^>]*?)(\\s*>)`
  );
  let next = src.replace(
    targetLayout,
    (_, head, tail) => `${head} content={${name}}${tail}`
  );

  // import 插在最后一条 import 之后，保持既有顺序不被打乱
  const importLine = `import { ${name} } from '@/lib/tools/content/${id}';\n`;
  const imports = [...next.matchAll(/^import [\s\S]*?;$/gm)];
  const last = imports.at(-1);
  next = last
    ? `${next.slice(0, last.index + last[0].length)}\n${importLine}${next.slice(last.index + last[0].length + 1)}`
    : importLine + next;

  if (!checkOnly) writeFileSync(targetPath, next);
  results.wired.push(id);
}

const label = checkOnly ? 'would wire' : 'wired';
console.log(`${label}: ${results.wired.length}   already wired: ${results.already.length}`);
if (results.wired.length) console.log(`  ${label}: ${results.wired.join(', ')}`);
for (const [key, title] of [
  ['missingPage', 'content module has no matching tool page'],
  ['noToolLayout', 'no file renders <ToolLayout toolId="<id>"> literally; if the route uses a shared component, pass this route content through its content prop'],
  ['badExport', 'content module missing the expected export'],
]) {
  if (results[key].length) {
    console.error(`\n${title}:`);
    for (const item of results[key]) console.error(`  - ${item}`);
  }
}

const failed = results.missingPage.length + results.noToolLayout.length + results.badExport.length;
if (failed > 0) process.exit(1);

// 覆盖率：还有多少工具没有内容模块
const withContent = new Set([...results.wired, ...results.already]);
const missing = [...registryPaths.keys()].filter((id) => !withContent.has(id));
console.log(`\ncoverage: ${withContent.size}/${registryPaths.size} tools have article content`);
if (missing.length) console.log(`remaining (${missing.length}): ${missing.join(', ')}`);
