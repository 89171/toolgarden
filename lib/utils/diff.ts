import { parseLooseJSON } from './json';

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffLine {
  path: string;
  type: DiffType;
  leftValue?: unknown;
  rightValue?: unknown;
}

/** 深度对比两个 JSON 值，返回 DiffLine 列表 */
export function diffJson(left: unknown, right: unknown, path = ''): DiffLine[] {
  const lines: DiffLine[] = [];

  const isSameType = (a: unknown, b: unknown) =>
    Array.isArray(a) === Array.isArray(b) &&
    (typeof a === 'object') === (typeof b === 'object');

  // 基本类型或不同类型
  if (
    typeof left !== 'object' || left === null ||
    typeof right !== 'object' || right === null ||
    !isSameType(left, right)
  ) {
    if (left === undefined) {
      lines.push({ path, type: 'added', rightValue: right });
    } else if (right === undefined) {
      lines.push({ path, type: 'removed', leftValue: left });
    } else if (JSON.stringify(left) === JSON.stringify(right)) {
      lines.push({ path, type: 'unchanged', leftValue: left, rightValue: right });
    } else {
      lines.push({ path, type: 'changed', leftValue: left, rightValue: right });
    }
    return lines;
  }

  // 数组
  if (Array.isArray(left) && Array.isArray(right)) {
    const len = Math.max(left.length, right.length);
    for (let i = 0; i < len; i++) {
      const p = path ? `${path}[${i}]` : `[${i}]`;
      if (i >= left.length) {
        lines.push({ path: p, type: 'added', rightValue: right[i] });
      } else if (i >= right.length) {
        lines.push({ path: p, type: 'removed', leftValue: left[i] });
      } else {
        lines.push(...diffJson(left[i], right[i], p));
      }
    }
    return lines;
  }

  // 对象
  const leftObj = left as Record<string, unknown>;
  const rightObj = right as Record<string, unknown>;
  const keys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
  for (const key of keys) {
    const p = path ? `${path}.${key}` : key;
    if (!(key in leftObj)) {
      lines.push({ path: p, type: 'added', rightValue: rightObj[key] });
    } else if (!(key in rightObj)) {
      lines.push({ path: p, type: 'removed', leftValue: leftObj[key] });
    } else {
      lines.push(...diffJson(leftObj[key], rightObj[key], p));
    }
  }

  return lines;
}

export interface DiffSummary {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
  lines: DiffLine[];
}

export function computeDiff(leftJson: string, rightJson: string): { ok: true; summary: DiffSummary } | { ok: false; message: string } {
  try {
    if (!leftJson.trim() && !rightJson.trim()) return { ok: false, message: '' };
    const left = leftJson.trim() ? parseLooseJSON(leftJson) : undefined;
    const right = rightJson.trim() ? parseLooseJSON(rightJson) : undefined;
    const lines = diffJson(left, right);
    const summary: DiffSummary = {
      added: lines.filter((l) => l.type === 'added').length,
      removed: lines.filter((l) => l.type === 'removed').length,
      changed: lines.filter((l) => l.type === 'changed').length,
      unchanged: lines.filter((l) => l.type === 'unchanged').length,
      lines,
    };
    return { ok: true, summary };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
