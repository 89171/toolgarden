#!/usr/bin/env node
/**
 * 把每个工具的 layout.tsx 从「纯透传」改成「用 ToolMessagesProvider 包一层」，
 * 这样 tool_faq / organic_keywords 只会给当前工具那一份，不会把全站 87 个工具的
 * 份额都塞进这一页。
 *
 * 只改动严格匹配既有模板的文件（见下方 TEMPLATE_BODY），避免误改有额外导入
 * （例如白板 / Excalidraw / 思维导图三个页面各自 import 了第三方 CSS）的文件。
 * 那三个改动方式相同，只是要保留那一行 CSS import，脚本对此单独处理。
 *
 * 幂等：已经改过的文件（能找到 ToolMessagesProvider 导入）会被跳过。
 *
 *   node scripts/scope-tool-messages.mjs            # 执行改写
 *   node scripts/scope-tool-messages.mjs --check    # 只报告，不改文件
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const checkOnly = process.argv.includes('--check');

const NON_TOOL_LAYOUTS = new Set([
  "app/[locale]/file-merge/layout.tsx",
  "app/[locale]/file-merge/pdf/layout.tsx",
  "app/[locale]/file-merge/documents/layout.tsx",
  "app/[locale]/json-tools/layout.tsx",
  "app/[locale]/qr-code/layout.tsx",
]);

function findLayouts() {
  const out = execSync(
    "find 'app/[locale]' -mindepth 2 -maxdepth 3 -name layout.tsx",
    { encoding: 'utf8' }
  );
  return out
    .split('\n')
    .filter(Boolean)
    .filter((p) => !NON_TOOL_LAYOUTS.has(p));
}

const OLD_DEFAULT_EXPORT =
  `export default function Layout({ children }: { children: React.ReactNode }) {\n` +
  `  return <>{children}</>;\n` +
  `}\n`;

function buildNewSource(src) {
  if (src.includes('ToolMessagesProvider')) return null; // 已处理，幂等跳过
  if (!src.includes(OLD_DEFAULT_EXPORT)) return { error: 'default export 与预期模板不一致' };

  let next = src;

  // import 插在最后一条 import 之后，保留既有顺序（含第三方 CSS import）
  const importLine = `import { ToolMessagesProvider } from '@/components/ToolMessagesProvider';\n`;
  const imports = [...next.matchAll(/^import [\s\S]*?;$/gm)];
  const last = imports.at(-1);
  if (!last) return { error: '找不到任何 import 语句' };
  next =
    next.slice(0, last.index + last[0].length) +
    `\n${importLine}` +
    next.slice(last.index + last[0].length);

  const newDefaultExport =
    `export default async function Layout({\n` +
    `  children,\n` +
    `  params,\n` +
    `}: {\n` +
    `  children: React.ReactNode;\n` +
    `  params: Promise<{ locale: string }>;\n` +
    `}) {\n` +
    `  const { locale } = await params;\n` +
    `  return (\n` +
    `    <ToolMessagesProvider locale={locale} toolId={TOOL_ID}>\n` +
    `      {children}\n` +
    `    </ToolMessagesProvider>\n` +
    `  );\n` +
    `}\n`;

  next = next.replace(OLD_DEFAULT_EXPORT, newDefaultExport);
  return { src: next };
}

const layouts = findLayouts();
const done = [];
const skipped = [];
const failed = [];

for (const path of layouts) {
  const src = readFileSync(path, 'utf8');
  const idMatch = src.match(/const TOOL_ID = '([^']+)';/);
  if (!idMatch) {
    failed.push(`${path}: 找不到 TOOL_ID`);
    continue;
  }

  const result = buildNewSource(src);
  if (result === null) {
    skipped.push(path);
    continue;
  }
  if (result.error) {
    failed.push(`${path}: ${result.error}`);
    continue;
  }

  if (!checkOnly) writeFileSync(path, result.src);
  done.push(path);
}

console.log(`${checkOnly ? 'would update' : 'updated'}: ${done.length}   already done: ${skipped.length}`);
if (failed.length) {
  console.error(`\nfailed: ${failed.length}`);
  for (const f of failed) console.error(`  - ${f}`);
  process.exit(1);
}
