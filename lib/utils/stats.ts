export interface JsonStats {
  /** 原始 JSON 体积（字节） */
  rawBytes: number;
  /** 压缩后体积（字节） */
  minifiedBytes: number;
  /** 最大嵌套层级 */
  maxDepth: number;
  /** 总 key 数（含嵌套） */
  totalKeys: number;
  /** 各类型数量 */
  typeCounts: Record<string, number>;
  /** 数组数量 */
  arrayCount: number;
  /** 对象数量 */
  objectCount: number;
  /** 最长字符串 */
  longestString: { value: string; length: number };
}

function walk(
  value: unknown,
  depth: number,
  stats: Omit<JsonStats, 'rawBytes' | 'minifiedBytes'>
): number {
  let maxDepth = depth;

  stats.typeCounts[typeof value] = (stats.typeCounts[typeof value] ?? 0) + 1;

  if (value === null) {
    stats.typeCounts['null'] = (stats.typeCounts['null'] ?? 0) + 1;
    delete stats.typeCounts['object']; // null is typeof 'object', correct it
    return maxDepth;
  }

  if (Array.isArray(value)) {
    stats.arrayCount++;
    for (const item of value) {
      maxDepth = Math.max(maxDepth, walk(item, depth + 1, stats));
    }
  } else if (typeof value === 'object') {
    stats.objectCount++;
    const obj = value as Record<string, unknown>;
    for (const [, v] of Object.entries(obj)) {
      stats.totalKeys++;
      maxDepth = Math.max(maxDepth, walk(v, depth + 1, stats));
    }
  } else if (typeof value === 'string') {
    if (value.length > stats.longestString.length) {
      stats.longestString = { value, length: value.length };
    }
  }

  return maxDepth;
}

/** 分析 JSON 字符串，返回统计信息 */
export function analyzeJson(input: string): { ok: true; stats: JsonStats } | { ok: false; message: string } {
  if (!input.trim()) return { ok: false, message: '' };
  try {
    const parsed = JSON.parse(input);
    const partial: Omit<JsonStats, 'rawBytes' | 'minifiedBytes'> = {
      maxDepth: 0,
      totalKeys: 0,
      typeCounts: {},
      arrayCount: 0,
      objectCount: 0,
      longestString: { value: '', length: 0 },
    };
    partial.maxDepth = walk(parsed, 0, partial);

    const stats: JsonStats = {
      rawBytes: new TextEncoder().encode(input).length,
      minifiedBytes: new TextEncoder().encode(JSON.stringify(parsed)).length,
      ...partial,
    };

    return { ok: true, stats };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
