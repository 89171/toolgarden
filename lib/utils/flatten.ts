import { FormatOutcome, parseLooseJSON, stringifyJSONValue } from './json';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenValue(value: unknown, delimiter: string, prefix: string, result: Record<string, unknown>) {
  if (Array.isArray(value)) {
    if (value.length === 0 && prefix) result[prefix] = [];
    value.forEach((item, index) => {
      const path = prefix ? `${prefix}${delimiter}${index}` : String(index);
      flattenValue(item, delimiter, path, result);
    });
    return;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0 && prefix) result[prefix] = {};
    entries.forEach(([key, item]) => {
      const path = prefix ? `${prefix}${delimiter}${key}` : key;
      flattenValue(item, delimiter, path, result);
    });
    return;
  }

  result[prefix || '$'] = value;
}

export function flattenJson(input: string, delimiter = '.'): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  if (!delimiter) return { ok: false, message: '分隔符不能为空' };

  try {
    const parsed = parseLooseJSON(input);
    const flattened: Record<string, unknown> = {};
    flattenValue(parsed, delimiter, '', flattened);
    return { ok: true, output: stringifyJSONValue(flattened, 2), parsed: flattened };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

function shouldCreateArray(nextSegment: string | undefined): boolean {
  return typeof nextSegment === 'string' && /^\d+$/.test(nextSegment);
}

function assignPath(target: Record<string, unknown>, segments: string[], value: unknown) {
  let cursor: Record<string, unknown> | unknown[] = target;

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const key: string | number = Array.isArray(cursor) && /^\d+$/.test(segment)
      ? Number.parseInt(segment, 10)
      : segment;

    if (isLast) {
      (cursor as Record<string, unknown>)[key] = value;
      return;
    }

    const nextSegment = segments[index + 1];
    const nextValue = (cursor as Record<string, unknown>)[key];
    if (typeof nextValue !== 'object' || nextValue === null) {
      (cursor as Record<string, unknown>)[key] = shouldCreateArray(nextSegment) ? [] : {};
    }

    cursor = (cursor as Record<string, unknown>)[key] as Record<string, unknown> | unknown[];
  });
}

export function unflattenJson(input: string, delimiter = '.'): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  if (!delimiter) return { ok: false, message: '分隔符不能为空' };

  try {
    const parsed = parseLooseJSON(input);
    if (!isPlainObject(parsed)) return { ok: false, message: '输入必须是平铺后的 JSON 对象' };

    const result: Record<string, unknown> = {};
    Object.entries(parsed).forEach(([path, value]) => {
      if (path === '$') {
        result.$ = value;
        return;
      }
      assignPath(result, path.split(delimiter).filter(Boolean), value);
    });

    return { ok: true, output: stringifyJSONValue(result, 2), parsed: result };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
