import { FormatOutcome } from './json';

/** 将 snake_case / kebab-case 转为 PascalCase */
function toPascalCase(s: string): string {
  return s
    .replace(/[-_\s](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^(.)/, (_, c: string) => c.toUpperCase());
}

/** 从 JSON 值递归生成 TypeScript 类型声明 */
function inferType(value: unknown, interfaces: Map<string, string>, hint = 'Root'): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    if (value.length === 0) return 'unknown[]';
    const itemType = inferType(value[0], interfaces, hint);
    return `${itemType}[]`;
  }
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const name = toPascalCase(hint);
    const fields = Object.entries(obj)
      .map(([k, v]) => {
        const fieldType = inferType(v, interfaces, k);
        const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `"${k}"`;
        return `  ${key}: ${fieldType};`;
      })
      .join('\n');
    interfaces.set(name, `interface ${name} {\n${fields}\n}`);
    return name;
  }
  if (typeof value === 'string') return 'string';
  if (typeof value === 'number') return Number.isInteger(value) ? 'number' : 'number';
  if (typeof value === 'boolean') return 'boolean';
  return 'unknown';
}

/** JSON 字符串 → TypeScript interface 声明 */
export function jsonToTypeScript(input: string): FormatOutcome {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = JSON.parse(input);
    const interfaces = new Map<string, string>();

    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object') {
      inferType(parsed[0], interfaces, 'Item');
    } else {
      inferType(parsed, interfaces, 'Root');
    }

    // 依赖顺序：先输出嵌套类型，Root 最后
    const names = [...interfaces.keys()];
    const rootName = names[names.length - 1];
    const others = names.slice(0, -1);
    const blocks = [
      ...others.map((n) => interfaces.get(n)!),
      interfaces.get(rootName)!,
    ];

    const output = blocks.join('\n\n');
    return { ok: true, output, parsed: output };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
