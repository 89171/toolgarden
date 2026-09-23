import { createFont, type TTF } from 'fonteditor-core';

/**
 * 按需加载中日韩字体，并裁成只含用到字符的子集，用来把中文等非 WinAnsi 文字
 * 写成真正的 PDF 文字而不是图片。
 *
 * 为什么自己裁子集：pdf-lib 的 `embedFont(..., { subset: true })` 对这类字体
 * 会写出错位的字形——实测「张三」被渲染成「引」，变体 TTF 更是整组字形为空。
 * 所以这里先用 fonteditor-core（仓库里字体子集工具用的就是它）把字体裁成几 KB
 * 的静态 TTF，再交给 pdf-lib 原样嵌入。
 *
 * 字体本体 8MB 出头，只在用户真的输入了非 Latin 字符时才下载，和 ffmpeg core、
 * OCR 模型一样走 CDN，不进仓库。换字体只要改这个 URL，钉死版本即可。
 */
const CJK_FONT_URL =
  'https://cdn.jsdelivr.net/npm/@expo-google-fonts/noto-sans-sc@0.2.3/NotoSansSC_400Regular.ttf';

let sourcePromise: Promise<ArrayBuffer | null> | null = null;

function fetchFontSource(): Promise<ArrayBuffer | null> {
  sourcePromise ??= fetch(CJK_FONT_URL)
    .then(async (response) => {
      if (!response.ok) throw new Error(`font request failed: ${response.status}`);
      return response.arrayBuffer();
    })
    .catch(() => {
      // 下载失败不缓存，下次保存时可以再试
      sourcePromise = null;
      return null;
    });
  return sourcePromise;
}

/** 这份字体文件是 CFF（OTTO）还是 glyf，fonteditor-core 需要知道。 */
function detectFontType(source: ArrayBuffer): 'otf' | 'ttf' {
  const tag = new Uint8Array(source, 0, 4);
  return String.fromCharCode(...tag) === 'OTTO' ? 'otf' : 'ttf';
}

/**
 * 修掉子集里不合理的字形宽度。
 *
 * fonteditor-core 把 CFF 转成 glyf 时，空格这类空字形的 advanceWidth 会写成负数
 * （实测 Noto Sans SC 的空格 224 被写成 -411），按无符号 16 位读出来就是 65125，
 * 结果是空格后面的字被推到页面外面去。返回被修正的字形个数。
 */
export function repairGlyphAdvances(glyphs: TTF.Glyph[], unitsPerEm: number): number {
  const sane = unitsPerEm * 4;
  let repaired = 0;

  for (const glyph of glyphs) {
    const advance = glyph.advanceWidth;
    if (typeof advance === 'number' && advance >= 0 && advance <= sane) continue;
    const isEmpty = (glyph.contours?.length ?? 0) === 0;
    glyph.advanceWidth = isEmpty ? Math.round(unitsPerEm / 4) : unitsPerEm;
    repaired += 1;
  }

  return repaired;
}

/**
 * 从字体字节里裁出只含 `characters` 的 TTF 子集。
 * 解析失败、或有字符在字体里找不到时返回 null，调用方应退回栅格化。
 */
export function subsetFontBytes(source: ArrayBuffer, characters: string): Uint8Array | null {
  const codePoints = [...new Set([...characters])]
    .map((char) => char.codePointAt(0) ?? 0)
    // 空格也要留在子集里，否则会被渲染成 .notdef 豆腐块
    .filter((codePoint) => codePoint >= 0x20);
  if (codePoints.length === 0) return null;

  try {
    const font = createFont(source.slice(0), {
      type: detectFontType(source),
      subset: codePoints,
      hinting: false,
      kerning: false,
    });

    const fontObject = font.get();
    const included = new Set<number>();
    for (const glyph of fontObject.glyf ?? []) {
      for (const codePoint of glyph.unicode ?? []) included.add(codePoint);
    }
    repairGlyphAdvances(fontObject.glyf ?? [], fontObject.head?.unitsPerEm || 1000);
    // 少一个字形就整体放弃：宁可栅格化，也不要导出一串豆腐块
    if (codePoints.some((codePoint) => !included.has(codePoint))) return null;

    return new Uint8Array(font.write({ type: 'ttf', hinting: false, kerning: false }) as ArrayBuffer);
  } catch {
    return null;
  }
}

/** 按需下载中日韩字体并裁出子集；任何一步失败都返回 null。 */
export async function loadCjkFontSubset(characters: string): Promise<Uint8Array | null> {
  if (characters.trim() === '') return null;
  const source = await fetchFontSource();
  return source ? subsetFontBytes(source, characters) : null;
}
