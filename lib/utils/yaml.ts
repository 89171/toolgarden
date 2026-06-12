import * as YAML from 'yaml';
import { FormatOutcome } from './json';

/** JSON 字符串 → YAML 字符串 */
export function jsonToYaml(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = JSON.parse(input);
    const output = YAML.stringify(parsed, { indent: 2 });
    return { ok: true, output: output.trimEnd(), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** YAML 字符串 → JSON 字符串 */
export function yamlToJson(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = YAML.parse(input);
    return { ok: true, output: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
