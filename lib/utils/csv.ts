import { FormatOutcome, parseLooseJSON } from './json';

/** JSON 数组 → CSV 字符串 */
export function jsonToCsv(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = parseLooseJSON(input);
    if (!Array.isArray(parsed)) {
      return { ok: false, message: '输入必须是 JSON 数组' };
    }
    if (parsed.length === 0) {
      return { ok: false, message: '数组为空' };
    }

    // 收集所有 key（扁平一层）
    const headers = [...new Set(parsed.flatMap((row) =>
      typeof row === 'object' && row !== null ? Object.keys(row as object) : []
    ))];

    if (headers.length === 0) {
      return { ok: false, message: '数组元素不是对象，无法转为 CSV' };
    }

    const escape = (val: unknown): string => {
      const s = val === null || val === undefined ? '' : String(val);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    const rows = [
      headers.join(','),
      ...(parsed as Record<string, unknown>[]).map((row) =>
        headers.map((h) => escape(row[h])).join(',')
      ),
    ];

    return { ok: true, output: rows.join('\n'), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
