import { FormatOutcome } from './json';

/** 压缩 JSON 并转义为适合嵌入字符串的形式（\\n, \\\", 等） */
export function escapeJson(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = JSON.parse(input);
    const minified = JSON.stringify(parsed);
    const escaped = minified
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
    return { ok: true, output: escaped, parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 反转义字符串并格式化为 JSON */
export function unescapeJson(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    // 先执行反转义
    const unescaped = input
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    const parsed = JSON.parse(unescaped);
    return { ok: true, output: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
