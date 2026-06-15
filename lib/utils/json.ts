/**
 * JSON 工具函数库
 *
 * 所有函数为纯函数，无副作用，便于单元测试。
 * 页面组件只负责 UI 状态管理，逻辑调用此模块。
 */

// ── 解析 ────────────────────────────────────────────────────────

function isIdentifierStart(char: string): boolean {
  return /[a-zA-Z_$]/.test(char);
}

function isIdentifierPart(char: string): boolean {
  return /[a-zA-Z0-9_$]/.test(char);
}

function previousSignificantChar(input: string, index: number): string | undefined {
  for (let i = index - 1; i >= 0; i -= 1) {
    if (!/\s/.test(input[i])) return input[i];
  }
  return undefined;
}

function quoteUnquotedKeys(input: string): string {
  let output = '';
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (quote) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    const prev = previousSignificantChar(input, i);
    if ((prev === '{' || prev === ',') && isIdentifierStart(char)) {
      let end = i + 1;
      while (end < input.length && isIdentifierPart(input[end])) end += 1;

      let next = end;
      while (/\s/.test(input[next] ?? '')) next += 1;

      if (input[next] === ':') {
        output += `"${input.slice(i, end)}"`;
        i = end - 1;
        continue;
      }
    }

    output += char;
  }

  return output;
}

function convertSingleQuotedStrings(input: string): string {
  let output = '';
  let inDoubleQuote = false;
  let inSingleQuote = false;
  let escaped = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];

    if (inDoubleQuote) {
      output += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === '"') {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inSingleQuote) {
      if (escaped) {
        if (char === "'") {
          output += "'";
        } else if (char === '"') {
          output += '\\"';
        } else {
          output += `\\${char}`;
        }
        escaped = false;
        continue;
      }

      if (char === '\\') {
        escaped = true;
        continue;
      }

      if (char === "'") {
        output += '"';
        inSingleQuote = false;
        continue;
      }

      if (char === '"') {
        output += '\\"';
        continue;
      }

      if (char === '\n') {
        output += '\\n';
        continue;
      }

      if (char === '\r') {
        output += '\\r';
        continue;
      }

      output += char;
      continue;
    }

    if (char === '"') {
      inDoubleQuote = true;
      output += char;
      continue;
    }

    if (char === "'") {
      inSingleQuote = true;
      output += '"';
      continue;
    }

    output += char;
  }

  return output;
}

function normalizeLooseJSON(input: string): string {
  return convertSingleQuotedStrings(quoteUnquotedKeys(input));
}

/**
 * 宽松解析 JSON（兼容 JS 对象字面量风格）
 * - 支持无引号的 key
 * - 支持单引号字符串
 */
export function parseLooseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return JSON.parse(normalizeLooseJSON(input)); // 若仍失败则向上抛出
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
export type JSONPathSegment = string | number;

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

function toArrayIndex(segment: JSONPathSegment): number | null {
  if (typeof segment === 'number') return Number.isInteger(segment) ? segment : null;
  if (!/^\d+$/.test(segment)) return null;
  return Number.parseInt(segment, 10);
}

function deleteFromContainer(container: unknown, segment: JSONPathSegment): boolean {
  if (Array.isArray(container)) {
    const index = toArrayIndex(segment);
    if (index === null || index < 0 || index >= container.length) return false;
    container.splice(index, 1);
    return true;
  }

  if (typeof container === 'object' && container !== null && typeof segment === 'string') {
    const record = container as Record<string, unknown>;
    if (!Object.prototype.hasOwnProperty.call(record, segment)) return false;
    delete record[segment];
    return true;
  }

  return false;
}

function getChildAtSegment(container: unknown, segment: JSONPathSegment): unknown {
  if (Array.isArray(container)) {
    const index = toArrayIndex(segment);
    return index === null ? undefined : container[index];
  }

  if (typeof container === 'object' && container !== null && typeof segment === 'string') {
    return (container as Record<string, unknown>)[segment];
  }

  return undefined;
}

/** 删除指定路径上的对象 key 或数组 index，返回更新后的格式化 JSON */
export function deleteJSONEntryAtPath(
  input: string,
  path: readonly JSONPathSegment[],
  indent = 2
): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };

  try {
    const parsed = parseLooseJSON(input);

    if (path.length > 0) {
      let container = parsed;
      for (const segment of path.slice(0, -1)) {
        container = getChildAtSegment(container, segment);
      }

      deleteFromContainer(container, path[path.length - 1]);
    }

    return { ok: true, output: stringifyJSONValue(parsed, indent), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 删除顶层对象 key 或数组 index，返回更新后的格式化 JSON */
export function deleteTopLevelJSONEntry(input: string, keyName?: string, indent = 2): FormatOutcome {
  return deleteJSONEntryAtPath(input, keyName === undefined ? [] : [keyName], indent);
}

// ── 编解码 ──────────────────────────────────────────────────────

/** URL 解码 */
export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}

/** URL 编码 */
export function urlEncode(input: string): string {
  return encodeURIComponent(input);
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
