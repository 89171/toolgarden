import { FormatOutcome, parseLooseJSON, stringifyJSONValue } from './json';

/** 压缩 JSON 并转义为适合嵌入字符串的形式（\\n, \\\", 等） */
export function escapeJson(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = parseLooseJSON(input);
    const minified = stringifyJSONValue(parsed);
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
    const unescaped = input
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\');
    const parsed = parseLooseJSON(unescaped);
    return { ok: true, output: stringifyJSONValue(parsed, 2), parsed };
  } catch (e) {
    try {
      const unwrapped = JSON.parse(input);
      if (typeof unwrapped !== 'string') throw e;
      const parsed = parseLooseJSON(unwrapped);
      return { ok: true, output: stringifyJSONValue(parsed, 2), parsed };
    } catch {
      return { ok: false, message: (e as Error).message };
    }
  }
}
