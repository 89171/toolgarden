import { FormatOutcome, parseLooseJSON, stringifyJSONValue } from './json';

export type ExcelPreviewOutcome =
  | { ok: true; rowCount: number; parsed: unknown }
  | { ok: false; message: string };

export type ExcelTablePreviewOutcome =
  | {
      ok: true;
      rowCount: number;
      columns: string[];
      rows: Array<Record<string, unknown>>;
      truncated: boolean;
      parsed: unknown;
    }
  | { ok: false; message: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenExcelValue(
  value: unknown,
  delimiter: string,
  prefix: string,
  result: Record<string, unknown>
) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      if (prefix) result[prefix] = stringifyJSONValue(value, 0);
      return;
    }

    value.forEach((item, index) => {
      const path = prefix ? `${prefix}${delimiter}${index}` : String(index);
      flattenExcelValue(item, delimiter, path, result);
    });
    return;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length === 0) {
      if (prefix) result[prefix] = stringifyJSONValue(value, 0);
      return;
    }

    entries.forEach(([key, item]) => {
      const path = prefix ? `${prefix}${delimiter}${key}` : key;
      flattenExcelValue(item, delimiter, path, result);
    });
    return;
  }

  result[prefix || '$'] = value;
}

function flattenExcelRow(row: unknown, delimiter = '>'): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};
  flattenExcelValue(row, delimiter, '', flattened);
  return flattened;
}

function flattenExcelRows(rows: unknown[], delimiter = '>'): Array<Record<string, unknown>> {
  return rows.map((row) => flattenExcelRow(row, delimiter));
}

function getExcelColumns(rows: Array<Record<string, unknown>>): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();

  rows.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (seen.has(key)) return;
      seen.add(key);
      columns.push(key);
    });
  });

  return columns;
}

function shouldCreateArray(nextSegment: string | undefined): boolean {
  return typeof nextSegment === 'string' && /^\d+$/.test(nextSegment);
}

function assignExcelPath(target: Record<string, unknown>, segments: string[], value: unknown) {
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

function unflattenExcelRow(row: Record<string, unknown>, delimiter = '>'): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.entries(row).forEach(([path, value]) => {
    if (path === '$') {
      result.$ = value;
      return;
    }

    assignExcelPath(result, path.split(delimiter).filter(Boolean), value);
  });

  return result;
}

/** JSON 数组预览校验（供输入驱动 UI 展示行数） */
export function previewJsonToExcel(input: string): ExcelPreviewOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = parseLooseJSON(input);
    if (!Array.isArray(parsed)) return { ok: false, message: '输入必须是 JSON 数组' };
    if (parsed.length === 0) return { ok: false, message: '数组为空' };
    return { ok: true, rowCount: parsed.length, parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export function previewJsonToExcelTable(input: string, maxRows = 20): ExcelTablePreviewOutcome {
  if (!input.trim()) return { ok: false, message: '' };

  try {
    const parsed = parseLooseJSON(input);
    if (!Array.isArray(parsed)) return { ok: false, message: '输入必须是 JSON 数组' };
    if (parsed.length === 0) return { ok: false, message: '数组为空' };

    const flattenedRows = flattenExcelRows(parsed);
    return {
      ok: true,
      rowCount: parsed.length,
      columns: getExcelColumns(flattenedRows),
      rows: flattenedRows.slice(0, maxRows),
      truncated: flattenedRows.length > maxRows,
      parsed,
    };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** JSON 数组 → xlsx ArrayBuffer（供下载） */
export async function jsonToExcelBuffer(input: string): Promise<{ ok: true; buffer: ArrayBuffer; parsed: unknown } | { ok: false; message: string }> {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const XLSX = await import('xlsx');
    const parsed = parseLooseJSON(input);
    if (!Array.isArray(parsed)) return { ok: false, message: '输入必须是 JSON 数组' };
    if (parsed.length === 0) return { ok: false, message: '数组为空' };

    const wb = XLSX.utils.book_new();
    const rows = flattenExcelRows(parsed);
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    return { ok: true, buffer, parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** xlsx ArrayBuffer → JSON 字符串 */
export async function excelBufferToJson(buffer: ArrayBuffer): Promise<FormatOutcome> {
  try {
    const XLSX = await import('xlsx');
    const wb = XLSX.read(buffer, { type: 'array' });
    const sheetName = wb.SheetNames[0];
    const ws = wb.Sheets[sheetName];
    const parsed = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws).map((row) => unflattenExcelRow(row));
    return { ok: true, output: stringifyJSONValue(parsed, 2), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
