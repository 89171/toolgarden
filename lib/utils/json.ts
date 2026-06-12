/**
 * JSON 工具函数库
 *
 * 所有函数为纯函数，无副作用，便于单元测试。
 * 页面组件只负责 UI 状态管理，逻辑调用此模块。
 */

// ── 解析 ────────────────────────────────────────────────────────

/**
 * 宽松解析 JSON（兼容 JS 对象字面量风格）
 * - 支持无引号的 key
 * - 支持单引号字符串
 */
export function parseLooseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    const fixed = input
      .replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*:)/g, '"$1"$2')
      .replace(/'/g, '"');
    return JSON.parse(fixed); // 若仍失败则向上抛出
  }
}

// ── 格式化 ──────────────────────────────────────────────────────

export interface FormatResult {
  ok: true;
  output: string;
  parsed: unknown;
}
export interface FormatError {
  ok: false;
  message: string;
}
export type FormatOutcome = FormatResult | FormatError;
export type ParseOutcome = { ok: true; parsed: unknown } | FormatError;

/** 将 JSON 值序列化为字符串，供示例、展示、复制和下载使用 */
export function stringifyJSONValue(value: unknown, indent?: number): string {
  return JSON.stringify(value, null, indent) ?? String(value);
}

/** 解析 JSON 字符串，返回判别联合类型 */
export function parseJSONValue(input: string): ParseOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    return { ok: true, parsed: parseLooseJSON(input) };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 格式化 JSON，返回带缩进的字符串 */
export function formatJSON(input: string, indent = 2): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = parseLooseJSON(input);
    return { ok: true, output: stringifyJSONValue(parsed, indent), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 压缩 JSON，移除所有空白 */
export function minifyJSON(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '请输入 JSON 数据' };
  try {
    const parsed = parseLooseJSON(input);
    return { ok: true, output: stringifyJSONValue(parsed), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 删除顶层对象 key 或数组 index，返回更新后的格式化 JSON */
export function deleteTopLevelJSONEntry(input: string, keyName?: string, indent = 2): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };

  try {
    const parsed = parseLooseJSON(input);

    if (keyName !== undefined) {
      if (Array.isArray(parsed)) {
        const index = Number.parseInt(keyName, 10);
        if (!Number.isNaN(index)) parsed.splice(index, 1);
      } else if (typeof parsed === 'object' && parsed !== null) {
        delete (parsed as Record<string, unknown>)[keyName];
      }
    }

    return { ok: true, output: stringifyJSONValue(parsed, indent), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

// ── 编解码 ──────────────────────────────────────────────────────

/** URL 解码 */
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

/** 将非 ASCII 字符转为 \uXXXX */
export function unicodeEncode(input: string): string {
  return input
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char;
    })
    .join('');
}

/** 将 \uXXXX 转回 Unicode 字符 */
export function unicodeDecode(input: string): string {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );
}
