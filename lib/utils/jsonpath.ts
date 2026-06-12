import { JSONPath } from 'jsonpath-plus';
import { FormatOutcome } from './json';

/** 对 JSON 执行 JSONPath 查询 */
export function queryJsonPath(jsonInput: string, path: string): FormatOutcome {
  if (!jsonInput.trim()) return { ok: false, message: '请输入 JSON 数据' };
  if (!path.trim()) return { ok: false, message: '请输入 JSONPath 表达式' };
  try {
    const json = JSON.parse(jsonInput);
    const result = JSONPath({ path, json });
    return { ok: true, output: JSON.stringify(result, null, 2), parsed: result };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
