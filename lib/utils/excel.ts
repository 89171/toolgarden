import { FormatOutcome } from './json';

/** JSON 数组 → xlsx ArrayBuffer（供下载） */
export async function jsonToExcelBuffer(input: string): Promise<{ ok: true; buffer: ArrayBuffer; parsed: unknown } | { ok: false; message: string }> {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const XLSX = await import('xlsx');
    const parsed = JSON.parse(input);
    if (!Array.isArray(parsed)) return { ok: false, message: '输入必须是 JSON 数组' };
    if (parsed.length === 0) return { ok: false, message: '数组为空' };

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(parsed as object[]);
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
    const parsed = XLSX.utils.sheet_to_json(ws);
    return { ok: true, output: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
