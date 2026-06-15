import { JSONPath } from 'jsonpath-plus';
import { FormatOutcome, parseLooseJSON, stringifyJSONValue } from './json';

type JSONPathInput = string | number | boolean | object | unknown[] | null;

/** 对 JSON 执行 JSONPath 查询 */
export function queryJsonPath(jsonInput: string, path: string): FormatOutcome {
  if (!jsonInput.trim()) return { ok: false, message: '请输入 JSON 数据' };
  if (!path.trim()) return { ok: false, message: '请输入 JSONPath 表达式' };
  try {
    const json = parseLooseJSON(jsonInput) as JSONPathInput;
    const result = JSONPath({ path, json });
    return { ok: true, output: stringifyJSONValue(result, 2), parsed: result };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
