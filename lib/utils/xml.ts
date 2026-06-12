import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { FormatOutcome } from './json';

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseAttributeValue: true,
};

const builderOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
};

/** JSON 字符串 → XML 字符串 */
export function jsonToXml(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = JSON.parse(input);
    const builder = new XMLBuilder(builderOptions);
    const output = builder.build({ root: parsed }) as string;
    return { ok: true, output, parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** XML 字符串 → JSON 字符串 */
export function xmlToJson(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parser = new XMLParser(parserOptions);
    const parsed = parser.parse(input) as unknown;
    return { ok: true, output: JSON.stringify(parsed, null, 2), parsed };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
