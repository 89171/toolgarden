import type {
  BlogArticle,
  BlogArticleTranslation,
  BlogBlock,
  BlogFaqItem,
} from './articles';

interface ArticleSection {
  heading: string;
  paragraphs: string[];
  items?: string[];
  table?: Extract<BlogBlock, { type: 'table' }>;
  code?: Extract<BlogBlock, { type: 'code' }>;
}

interface ArticleCopy {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  readingTime: string;
  tags: string[];
  relatedTools: BlogArticleTranslation['relatedTools'];
  lead: string;
  intro: string;
  sections: ArticleSection[];
  callout: Extract<BlogBlock, { type: 'callout' }>;
  conclusion: string;
  faq: BlogFaqItem[];
}

function buildTranslation(copy: ArticleCopy, summaryHeading: string): BlogArticleTranslation {
  const blocks: BlogBlock[] = [
    { type: 'lead', text: copy.lead },
    { type: 'paragraph', text: copy.intro },
  ];

  for (const section of copy.sections) {
    blocks.push({ type: 'heading', level: 2, text: section.heading });
    blocks.push(...section.paragraphs.map((text): BlogBlock => ({ type: 'paragraph', text })));
    if (section.table) blocks.push(section.table);
    if (section.code) blocks.push(section.code);
    if (section.items?.length) blocks.push({ type: 'list', items: section.items });
  }

  blocks.push(
    copy.callout,
    { type: 'heading', level: 2, text: summaryHeading },
    { type: 'paragraph', text: copy.conclusion },
  );

  return {
    title: copy.title,
    excerpt: copy.excerpt,
    metaTitle: copy.metaTitle,
    metaDescription: copy.metaDescription,
    readingTime: copy.readingTime,
    tags: copy.tags,
    relatedTools: copy.relatedTools,
    blocks,
    faq: copy.faq,
  };
}

function article(slug: string, en: ArticleCopy, zh: ArticleCopy): BlogArticle {
  return {
    slug,
    publishedAt: '2026-07-22',
    updatedAt: '2026-07-22',
    translations: {
      en: buildTranslation(en, 'Key takeaways'),
      zh: buildTranslation(zh, '总结'),
    },
  };
}

const fontSubsetCode = `import { createFont } from 'fonteditor-core';
import { deflateSync, inflateSync } from 'fflate';

const codePoints = [...new Set(
  Array.from(text, char => char.codePointAt(0)!)
)];

const input = await file.arrayBuffer();
const font = createFont(input, {
  type: 'ttf',
  subset: codePoints,
  hinting: false,
  kerning: false,
  inflate: data => Array.from(inflateSync(new Uint8Array(data))),
});

const output = font.write({
  type: 'woff',
  deflate: data => Array.from(deflateSync(new Uint8Array(data))),
});`;

const fontPreviewCode = `const blob = new Blob([output], { type: 'font/woff' });
const url = URL.createObjectURL(blob);

const face = new FontFace('SubsetPreview', \`url(\${url})\`);
await face.load();
document.fonts.add(face);

// Revoke the previous URL when regenerating or leaving the page.
URL.revokeObjectURL(url);`;

const tldrawCode = `// Client component: load the editor only after hydration.
useEffect(() => {
  let active = true;

  import('tldraw').then(({ Tldraw, DefaultToolbar }) => {
    if (!active) return;
    setEditor(() => Tldraw);
    setToolbar(() => DefaultToolbar);
  });

  return () => { active = false; };
}, []);

return Editor ? (
  <Editor
    assetUrls={assetUrls}
    locale={locale === 'zh' ? 'zh-cn' : 'en'}
    persistenceKey="my-whiteboard"
    cameraOptions={{ wheelBehavior: fullscreen ? 'pan' : 'none' }}
  />
) : <LoadingState />;`;

const tldrawAssetsCode = `const base = '/tldraw-assets';

export const assetUrls = {
  icons: { 'align-left': \`\${base}/icons/align-left.svg\` },
  fonts: { tldraw_sans: \`\${base}/fonts/IBMPlexSans-Medium.woff2\` },
  translations: { 'zh-cn': \`\${base}/translations/zh-cn.json\` },
  embedIcons: { youtube: \`\${base}/embed-icons/youtube.png\` },
};`;

const excalidrawCode = `const ASSET_PATH = '/excalidraw/';

function configureAssets() {
  if (typeof window !== 'undefined') {
    window.EXCALIDRAW_ASSET_PATH = ASSET_PATH;
  }
}

useEffect(() => {
  let active = true;
  configureAssets();

  import('@excalidraw/excalidraw').then(({ Excalidraw }) => {
    if (active) setEditor(() => Excalidraw);
  });

  return () => { active = false; };
}, []);`;

const excalidrawUiCode = `<Excalidraw
  langCode={locale === 'zh' ? 'zh-CN' : 'en'}
  name="product-sketch"
  theme="light"
  initialData={{
    appState: {
      viewBackgroundColor: '#ffffff',
      currentItemStrokeColor: '#111827',
    },
  }}
  UIOptions={{
    canvasActions: {
      clearCanvas: true,
      loadScene: true,
      saveAsImage: true,
      toggleTheme: true,
    },
    tools: { image: true },
  }}
/>`;

const mindElixirInitCode = `const [{ default: MindElixir }, i18n] = await Promise.all([
  import('mind-elixir'),
  import('mind-elixir/i18n'),
]);

const mind = new MindElixir({
  el: hostElement,
  direction: MindElixir.SIDE,
  editable: true,
  contextMenu: {
    locale: locale === 'zh' ? i18n.zh_CN : i18n.en,
    focus: true,
    link: true,
  },
  keypress: true,
  overflowHidden: true,
  toolBar: false,
});

mind.init(data);
mind.scaleFit();

// On unmount:
mind.destroy();`;

const markdownParserCode = `type Outcome =
  | { ok: true; data: MindElixirData }
  | { ok: false; message: string };

function parseLine(line: string) {
  const heading = line.match(/^\\s*(#{1,6})\\s+(.+)$/u);
  if (heading) return { level: heading[1].length, topic: heading[2] };

  const bullet = line.match(/^(\\s*)[-*+]\\s+(.+)$/u);
  if (bullet) {
    return {
      level: Math.floor(bullet[1].replace(/\\t/g, '  ').length / 2) + 2,
      topic: bullet[2],
    };
  }

  return null;
}`;

export const creativeToolEngineeringArticles: BlogArticle[] = [
  article(
    'build-online-font-subsetter-fonteditor-core',
    {
      title: 'How to Build an Online Font Subsetter with fonteditor-core',
      excerpt: 'A practical browser-only implementation for extracting used characters from TTF or WOFF files, previewing the result, and exporting a smaller web font.',
      metaTitle: 'Build an Online Font Subsetter with fonteditor-core',
      metaDescription: 'Learn how to subset TTF and WOFF fonts in the browser with fonteditor-core, Unicode code points, WOFF compression, previews, validation, and safe Blob downloads.',
      readingTime: '11 min read',
      tags: ['browser tool development', 'font subsetting', 'fonteditor-core', 'web fonts', 'frontend engineering'],
      relatedTools: [
        {
          label: 'Online Font Subsetter',
          href: '/other/font-subset',
          description: 'Upload a TTF or WOFF file, keep only selected characters, preview the result, and export a smaller font locally.',
        },
        {
          label: 'Other Browser Tools',
          href: '/other',
          description: 'Explore local whiteboards, mind maps, and other browser-based utilities built with mature open-source libraries.',
        },
      ],
      lead: 'Chinese, Japanese, and Korean font files can contain thousands of glyphs, while a landing page may use only a headline and a few labels. Font subsetting removes unused glyphs so the browser downloads only the characters the product actually needs.',
      intro: 'A useful online subsetter is more than a file input around a font library. It needs Unicode-safe character collection, format validation, WOFF decompression and compression, missing-glyph reporting, preview isolation, object-URL cleanup, and clear limits. The following architecture is based on a production browser-local implementation using fonteditor-core and fflate.',
      sections: [
        {
          heading: 'What font subsetting changes',
          paragraphs: [
            'A font is a collection of glyph outlines plus mapping, metrics, naming, hinting, kerning, and other tables. Subsetting keeps the glyphs reachable from a requested set of Unicode code points and rewrites the related tables. This differs from generic compression: ZIP or Brotli can shrink bytes in transit, but they do not remove thousands of unused glyphs from the decoded font.',
            'The biggest wins usually come from large CJK fonts, icon fonts, campaign fonts, and one-off branded headings. A Latin font that is already small may gain less, especially when kerning and hinting tables are retained.',
          ],
          table: {
            type: 'table',
            headers: ['Input', 'Subset source', 'Typical output'],
            rows: [
              ['Marketing headline font', 'Final headline and button text', 'Small WOFF for one page'],
              ['CJK UI font', 'Product copy and supported punctuation', 'Language-specific WOFF files'],
              ['Icon font', 'Icons used by the current bundle', 'Reduced icon font'],
              ['Document font', 'Characters detected in one document', 'Portable TTF subset'],
            ],
          },
        },
        {
          heading: 'Use a browser-local processing pipeline',
          paragraphs: [
            'The page should own file selection, options, progress, preview, and errors. A utility module should accept a File and explicit options, then return a discriminated outcome. Keeping font parsing out of the React component makes failure cases testable and prevents UI state from leaking into the conversion layer.',
            'For ordinary subsetting there is no reason to upload the font or the requested text. File.arrayBuffer reads the selected file into the current browser tab, fonteditor-core parses and rewrites it, and the result becomes a Blob for preview and download.',
          ],
          items: [
            'Validate byte size and format before reading the entire file.',
            'Accept both trustworthy MIME values and file extensions because browsers often leave font MIME types empty.',
            'Return typed error codes such as unsupported_input, empty_chars, parse_failed, and no_glyphs.',
            'Keep a maximum input size so one accidental font collection cannot exhaust the tab.',
          ],
        },
        {
          heading: 'Collect Unicode code points, not UTF-16 units',
          paragraphs: [
            'JavaScript string indexing works in UTF-16 code units. Some characters outside the Basic Multilingual Plane use a surrogate pair, so splitting with text.split(\'\') can turn one character into two invalid values. Iterate with for...of or Array.from, read codePointAt(0), and deduplicate the numeric code points with a Set.',
            'Ignore C0 and C1 control characters, but do not discard whitespace blindly: a normal space is a real glyph and should often be kept. Also report characters that the source font does not contain instead of silently suggesting complete coverage.',
          ],
        },
        {
          heading: 'Create and write the subset with fonteditor-core',
          paragraphs: [
            'fonteditor-core can parse TTF and WOFF inputs, select glyphs by Unicode code point, and write TTF or WOFF output. WOFF uses compressed table data, so fflate adapters provide the inflate and deflate callbacks. The same options should be applied consistently at parse and write time.',
          ],
          code: { type: 'code', language: 'typescript', code: fontSubsetCode },
          items: [
            'Disable hinting for smaller web assets unless the target rendering environment needs it.',
            'Keep kerning when typographic quality matters, but measure the size difference for the actual font.',
            'Name output files predictably, for example brand.subset.woff.',
            'Treat WOFF2 as a separate capability; fonteditor-core in this pipeline writes WOFF, not WOFF2.',
          ],
        },
        {
          heading: 'Verify coverage and show useful metrics',
          paragraphs: [
            'A successful write does not prove that every requested character exists. Inspect the Unicode mappings on the resulting glyphs, compare them with the requested code points, and return included and missing character lists. This turns a vague font preview into an actionable validation result.',
            'Show the original size, output size, saved bytes, saved percentage, requested count, included count, and glyph count. A negative saving is possible for an already tiny font or an output format with different overhead, so the UI should display the actual value rather than promising every subset is smaller.',
          ],
        },
        {
          heading: 'Preview with a temporary font and clean it up',
          paragraphs: [
            'The output can be previewed without sending it anywhere. Wrap the ArrayBuffer in a Blob, create an object URL, and load it through FontFace or a generated @font-face rule with a unique family name. Render only known-included characters so browser fallback fonts do not hide missing glyphs.',
          ],
          code: { type: 'code', language: 'typescript', code: fontPreviewCode },
          items: [
            'Revoke the previous object URL before replacing the result.',
            'Remove the loaded FontFace when the preview is no longer needed.',
            'Use a unique family name per result to avoid cached preview confusion.',
            'Download from the Blob URL and remove the temporary anchor immediately afterward.',
          ],
        },
        {
          heading: 'Production limits and font edge cases',
          paragraphs: [
            'Variable fonts, color emoji fonts, OpenType layout rules, ligatures, and complex scripts need more care than a simple Unicode list. A text sample may require shaping-related glyphs that are not directly mapped from individual characters. Test the actual languages, browsers, and font licenses before shipping generated assets.',
            'For a static website, build-time subsetting with a mature font tool may be more reproducible. The online approach is valuable for exploration, one-off assets, internal workflows, and privacy-sensitive files; it should not replace typography QA.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Try the complete browser-local flow',
        text: 'Choose a TTF or WOFF file, enter the exact characters you need, compare the size and coverage, preview the subset, and download it without uploading the source font.',
        href: '/other/font-subset',
        linkLabel: 'Open Font Subsetter',
      },
      conclusion: 'A dependable online font subsetter combines Unicode-correct input handling, typed validation, real glyph coverage checks, explicit table options, and careful Blob lifecycle management. Keep the parser in a utility layer, make missing characters visible, and test complex fonts rather than assuming every OpenType file behaves like a basic Latin TTF.',
      faq: [
        { question: 'Is font subsetting the same as font compression?', answer: 'No. Subsetting removes unused glyphs and rewrites font tables. Compression encodes the remaining bytes more efficiently. A WOFF subset benefits from both: fewer glyphs first, compressed table data second.' },
        { question: 'Why does the generated font still contain more glyphs than requested characters?', answer: 'Fonts normally retain required glyphs such as .notdef, and the parser may keep glyphs needed by mappings or internal relationships. The glyph count therefore does not need to equal the unique character count exactly.' },
        { question: 'Can this browser approach output WOFF2?', answer: 'Not with the fonteditor-core plus fflate path shown here. It produces TTF or WOFF. WOFF2 needs a separate encoder, often WebAssembly or a build-time tool such as fonttools, and should be exposed only after browser and license testing.' },
        { question: 'Does subsetting a font change its license?', answer: 'No. Technical processing does not grant redistribution rights. Some font licenses allow web embedding or modification and others restrict it. Check the source font license before hosting, modifying, or redistributing a subset.' },
        { question: 'Why are some emoji or complex-script results incomplete?', answer: 'Some fonts use color tables, variation tables, ligatures, or shaping rules that go beyond a one-code-point-to-one-glyph mapping. Validate real words and sentences in the target script, and use a shaping-aware production pipeline when those features are required.' },
      ],
    },
    {
      title: '怎么实现在线字体裁剪？基于 fonteditor-core 的浏览器方案',
      excerpt: '从 TTF/WOFF 解析、Unicode 去重、字体表裁剪到预览和下载，完整实现一个无需上传文件的在线字体子集工具。',
      metaTitle: '在线字体裁剪怎么实现：fonteditor-core 字体子集化',
      metaDescription: '讲解如何用 fonteditor-core 在浏览器裁剪 TTF 和 WOFF 字体，覆盖 Unicode、WOFF 压缩、缺字检测、字体预览与 Blob 下载。',
      readingTime: '约 11 分钟阅读',
      tags: ['浏览器工具开发', '字体裁剪', 'fonteditor-core', 'Web 字体', '前端工程'],
      relatedTools: [
        {
          label: '在线字体裁剪',
          href: '/other/font-subset',
          description: '上传 TTF 或 WOFF 字体，按指定字符生成更小的字体子集，在本地预览并下载。',
        },
        {
          label: '其他浏览器工具',
          href: '/other',
          description: '查看基于成熟开源库实现的本地白板、思维导图等浏览器工具。',
        },
      ],
      lead: '中文、日文和韩文字体往往包含成千上万个字形，但一个落地页可能只用到一句标题和几个按钮。字体裁剪就是删除未使用字形，只让浏览器下载页面真正需要的字符。',
      intro: '一个可用的在线字体裁剪工具，并不是给字体库外面套一个文件上传框。它还要正确处理 Unicode、判断字体格式、解压和压缩 WOFF、报告缺失字形、隔离预览字体、释放 Object URL，并限制内存占用。下面这套方案来自 fonteditor-core 与 fflate 的浏览器本地实现。',
      sections: [
        {
          heading: '字体裁剪到底裁掉了什么？',
          paragraphs: [
            '字体文件不仅包含字形轮廓，还包含字符映射、度量、命名、hinting、kerning 等表。子集化会保留目标 Unicode 码点对应的字形，并重写相关字体表。它和普通压缩不是一回事：ZIP 或 Brotli 只能压缩传输字节，不能从解码后的字体中删除几千个没用到的汉字。',
            '收益最明显的场景通常是 CJK 大字库、图标字体、活动专题字体和只用于品牌标题的字体。如果拉丁字体本来就很小，或者必须保留 kerning、hinting 等表，体积下降可能没有想象中大。',
          ],
          table: {
            type: 'table',
            headers: ['输入字体场景', '字符来源', '常见输出'],
            rows: [
              ['营销页标题字体', '最终标题和按钮文案', '单页使用的小体积 WOFF'],
              ['中文 UI 字体', '产品文案与允许的标点', '按语言拆分的 WOFF'],
              ['图标字体', '当前前端包真正使用的图标', '裁剪后的图标字体'],
              ['文档内嵌字体', '从目标文档提取的字符', '便于携带的 TTF 子集'],
            ],
          },
        },
        {
          heading: '先设计浏览器本地处理链路',
          paragraphs: [
            '页面只负责选文件、设置选项、显示进度、预览和错误；工具函数接收 File 与明确参数，返回判别联合结果。把字体解析从 React 组件中移出去后，失败分支更容易测试，转换逻辑也不会被 UI state 绑死。',
            '普通字体裁剪没有上传文件和字符文本的必要。File.arrayBuffer 在当前标签页读取用户选择的文件，fonteditor-core 完成解析与重写，结果再包装成 Blob 供预览和下载。',
          ],
          items: [
            '读取完整文件前先检查字节大小和格式。',
            '同时参考 MIME 与扩展名，因为浏览器经常不给字体文件填写 MIME。',
            '返回 unsupported_input、empty_chars、parse_failed、no_glyphs 等明确错误码。',
            '设置最大输入体积，避免误选超大字体集合导致标签页内存耗尽。',
          ],
        },
        {
          heading: '按 Unicode 码点收集字符，不要直接 split',
          paragraphs: [
            'JavaScript 字符串底层使用 UTF-16。基本多文种平面之外的字符可能由一对代理项组成，text.split(\'\') 会把一个字符拆成两个无效单元。应该使用 for...of 或 Array.from 遍历，再调用 codePointAt(0)，最后用 Set 对数字码点去重。',
            'C0、C1 控制字符可以忽略，但不要粗暴删除所有空白；普通空格本身也是字体需要保留的字形。源字体不存在的字符也应明确列出，不能只靠浏览器回退字体制造“看起来都支持”的假象。',
          ],
        },
        {
          heading: '用 fonteditor-core 生成字体子集',
          paragraphs: [
            'fonteditor-core 可以解析 TTF、WOFF，按 Unicode 码点选择字形，再写出 TTF 或 WOFF。WOFF 的字体表使用压缩数据，因此需要用 fflate 提供 inflate 与 deflate 适配器。解析阶段和写出阶段的 hinting、kerning 参数应保持一致。',
          ],
          code: { type: 'code', language: 'typescript', code: fontSubsetCode },
          items: [
            '网页字体如果不依赖小字号屏显优化，可默认关闭 hinting 以减小体积。',
            '排版质量敏感时保留 kerning，但要用真实字体对比体积差异。',
            '输出文件名保持可预测，例如 brand.subset.woff。',
            'WOFF2 是另一项能力；这条 fonteditor-core 链路输出的是 WOFF，不是 WOFF2。',
          ],
        },
        {
          heading: '验证字符覆盖率，而不是只判断写出成功',
          paragraphs: [
            '文件成功生成，不代表请求字符全部存在。应读取结果字形上的 Unicode 映射，与请求码点逐一比对，分别返回已包含字符和缺失字符。这样用户看到的是可操作的检测结果，而不是一块可能偷偷使用系统回退字体的预览区。',
            '界面可以展示原始体积、输出体积、节省字节、节省比例、请求字符数、命中字符数和字形总数。对本来很小的字体，或者转换为开销不同的格式，输出甚至可能变大，因此不要承诺“裁剪后一定更小”。',
          ],
        },
        {
          heading: '用临时字体预览，并正确释放资源',
          paragraphs: [
            '生成结果不必上传也能预览。把 ArrayBuffer 包装为 Blob，创建 Object URL，再通过 FontFace 或动态 @font-face 加载，并给每次结果分配唯一 font-family。预览内容最好只使用确认已经包含的字符，避免系统回退字体掩盖缺字。',
          ],
          code: { type: 'code', language: 'typescript', code: fontPreviewCode },
          items: [
            '重新生成前先 revoke 上一个 Object URL。',
            '预览不再使用时，从 document.fonts 中移除对应 FontFace。',
            '每份结果使用唯一字体名，避免浏览器缓存造成预览错乱。',
            '下载完成后立即移除临时 a 标签。',
          ],
        },
        {
          heading: '上线前必须考虑的字体边界',
          paragraphs: [
            '可变字体、彩色 Emoji、OpenType 布局规则、连字和复杂文字塑形，都比“一个码点对应一个字形”复杂。某段文本可能依赖没有直接 Unicode 映射的替代字形。正式上线前应使用目标语言、目标浏览器和真实字体授权做验证。',
            '对于静态网站，构建阶段使用成熟字体工具通常更容易复现。在线裁剪适合探索、一次性素材、内部工作流和不方便上传的字体文件，但不能取代字体授权与排版质量检查。',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: '体验完整的本地字体裁剪流程',
        text: '选择 TTF 或 WOFF，输入真正需要的字符，对比体积和覆盖率，预览子集并直接下载，源字体不会上传到处理服务器。',
        href: '/other/font-subset',
        linkLabel: '打开字体裁剪工具',
      },
      conclusion: '可靠的在线字体裁剪需要同时做好 Unicode 遍历、类型化校验、真实字形覆盖检测、字体表选项和 Blob 生命周期管理。把解析写进独立工具层，把缺字明确展示出来，并用复杂字体做真实测试，才能让它从演示代码变成可用工具。',
      faq: [
        { question: '字体裁剪和字体压缩是一回事吗？', answer: '不是。裁剪会删除未使用字形并重写字体表；压缩只是更高效地编码剩余字节。WOFF 子集通常同时获得两层收益：先减少字形，再压缩字体表。' },
        { question: '为什么输出字体的字形数比输入字符数多？', answer: '字体通常必须保留 .notdef 等基础字形，解析器也可能保留字符映射或内部关系依赖的字形。因此字形总数不需要和去重字符数完全相等。' },
        { question: '这个浏览器方案能输出 WOFF2 吗？', answer: '本文的 fonteditor-core 加 fflate 链路只能输出 TTF 或 WOFF。WOFF2 需要单独编码器，常见方案是 WebAssembly 或构建阶段的 fonttools，并在浏览器兼容性和字体授权验证后再开放。' },
        { question: '裁剪字体后，字体授权会变化吗？', answer: '不会。技术处理不会自动赋予再分发权。有些字体允许网页嵌入或修改，有些会限制使用方式。托管、修改或分发字体子集前必须检查源字体许可证。' },
        { question: '为什么 Emoji 或复杂文字可能裁剪不完整？', answer: '部分字体依赖彩色字体表、可变字体表、连字或文字塑形规则，并不是简单的一码点一字形。复杂文字应使用真实词句验证，生产环境需要时应改用支持塑形关系的字体流水线。' },
      ],
    },
  ),
  article(
    'wrap-tldraw-react-whiteboard',
    {
      title: 'How to Wrap tldraw into a Production React Whiteboard',
      excerpt: 'A practical tldraw integration for Next.js covering client-only loading, self-hosted assets, persistence, toolbar layout, page scrolling, fullscreen, and cleanup.',
      metaTitle: 'How to Wrap tldraw into a React Whiteboard',
      metaDescription: 'Build a production React whiteboard with tldraw: dynamic client loading, local assets, persistence, custom toolbars, wheel behavior, fullscreen, i18n, and error states.',
      readingTime: '12 min read',
      tags: ['browser tool development', 'tldraw', 'React whiteboard', 'Next.js', 'frontend engineering'],
      relatedTools: [
        {
          label: 'tldraw Whiteboard',
          href: '/other/whiteboard',
          description: 'Draw shapes, notes, arrows, images, and multi-page diagrams in a browser-local tldraw editor.',
        },
        {
          label: 'Excalidraw Board',
          href: '/other/excalidraw-board',
          description: 'Use a hand-drawn diagram editor when a sketch-like visual language fits the task better.',
        },
      ],
      lead: 'tldraw gives React applications a capable infinite canvas, but dropping <Tldraw /> into a Next.js page is only the first five percent of the work. Production integration starts where the demo ends: loading, assets, persistence, scroll ownership, responsive controls, fullscreen, and deployment licensing.',
      intro: 'This guide follows a real browser-local wrapper. The result keeps the document in the user’s browser, self-hosts editor assets, adapts Chinese and English locales, places the main toolbar vertically on wide canvases, and allows the page to scroll normally until the user enters fullscreen.',
      sections: [
        {
          heading: 'Define the wrapper boundary before adding features',
          paragraphs: [
            'Treat tldraw as an editor runtime inside your product shell. The shell owns page layout, loading and retry states, privacy copy, fullscreen, analytics boundaries, and navigation. tldraw owns shapes, selection, camera, undo history, pages, and its native export UI.',
            'This boundary prevents a common failure mode: rebuilding editor features that the library already handles while neglecting the product behavior around the canvas.',
          ],
          table: {
            type: 'table',
            headers: ['Concern', 'Owner'],
            rows: [
              ['Shapes, tools, selection, pages', 'tldraw'],
              ['Route, header, help text, error state', 'Application shell'],
              ['Document persistence', 'tldraw persistenceKey or a custom store'],
              ['Collaboration and authentication', 'Your backend and sync architecture'],
              ['Asset hosting and CSP', 'Application deployment'],
            ],
          },
        },
        {
          heading: 'Load tldraw only in the browser',
          paragraphs: [
            'Canvas editors depend on browser APIs and add substantial JavaScript. Put the wrapper in a client component, import tldraw/tldraw.css in the route layout, and dynamically import the runtime after hydration. Store the component function with setState(() => Component); passing it directly to setState can make React treat it as an updater.',
            'Track whether the effect is still active so a slow import does not update state after unmount. A retry counter can re-run the import after a failed chunk request.',
          ],
          code: { type: 'code', language: 'tsx', code: tldrawCode },
        },
        {
          heading: 'Self-host every asset the editor requests',
          paragraphs: [
            'A whiteboard can render correctly in development and then fail under a strict Content Security Policy or offline deployment because fonts, translations, icons, or embed thumbnails still point to a remote host. Use assetUrls to map the editor’s runtime assets to a versioned directory under the same origin.',
            'Keep the mapping in one utility module. When tldraw is upgraded, compare its asset manifest with your copied files and make missing assets a build-time check instead of waiting for a broken production toolbar.',
          ],
          code: { type: 'code', language: 'typescript', code: tldrawAssetsCode },
          items: [
            'Copy the icon sprite or required individual icons.',
            'Include all font weights and styles exposed by text tools.',
            'Provide the locale JSON files that your locale switcher can select.',
            'Self-host embed icons if embeds are enabled.',
          ],
        },
        {
          heading: 'Use persistenceKey for a local-first single-user board',
          paragraphs: [
            'A stable persistenceKey gives the editor a browser-local place to restore the board after refresh. It is ideal for a single-user utility because no scene bytes need to be sent to an application API. Use a product-specific key so two boards on the same origin do not overwrite each other.',
            'Local persistence is not cloud backup. Clearing site data, changing browser profiles, or using private browsing can remove the document. If users expect account sync, collaboration, history, or cross-device access, design those as explicit backend capabilities rather than implying that persistenceKey provides them.',
          ],
          items: [
            'Document what is stored locally and how users can clear it.',
            'Do not put user IDs or secrets in a client-visible key.',
            'Provide export for portable backups.',
            'Version or migrate stored documents when library upgrades change schema expectations.',
          ],
        },
        {
          heading: 'Resolve the canvas-versus-page scroll conflict',
          paragraphs: [
            'An infinite canvas naturally wants wheel events for panning and zooming. A whiteboard embedded halfway down a long tool page should not trap ordinary vertical scrolling. One workable policy is to set wheelBehavior to none while embedded, forward non-modified wheel movement to window.scrollBy, and restore canvas panning in fullscreen.',
            'Preserve Ctrl or Command plus wheel for editor zoom gestures, and do not forward zero-delta events. Test trackpads as well as mouse wheels because horizontal and inertial deltas behave differently.',
          ],
        },
        {
          heading: 'Customize the toolbar through editor components',
          paragraphs: [
            'The components prop lets the application replace selected editor UI regions without forking tldraw. For a tall work area, wrapping DefaultToolbar with a vertical orientation keeps frequently used tools visible and frees horizontal space. CSS can then position the vertical toolbar within the canvas frame.',
            'Prefer composition over copying internal toolbar implementation. Default components inherit keyboard shortcuts, tool state, and accessibility behavior from the library; a copied toolbar can drift after upgrades.',
          ],
          items: [
            'Set minimum and maximum visible item counts for the real canvas height.',
            'Keep tool labels or tooltips reachable on touch and keyboard.',
            'Use the editor’s semantic components API before overriding internal class names.',
            'Limit CSS overrides to positioning and product tokens where possible.',
          ],
        },
        {
          heading: 'Implement fullscreen with a resilient fallback',
          paragraphs: [
            'Native requestFullscreen gives the best isolation, but it may reject when the browser, embedding context, or permissions policy disallows it. Catch that rejection and switch to a fixed inset-0 container as a CSS fallback. While the fallback is active, lock body scrolling and let Escape exit.',
            'Both native and fallback transitions should dispatch a resize event after layout settles. Canvas editors cache viewport measurements, and a stale measurement can leave controls clipped or the camera centered on the old size.',
          ],
        },
        {
          heading: 'Plan for errors, licensing, and upgrades',
          paragraphs: [
            'Show a real loading surface while the chunk is downloading, catch import failures, and offer retry. Verify the version’s licensing requirements and configure the client license key according to tldraw’s deployment rules. A browser-delivered key is not a secret; domain restrictions and the vendor’s license terms are the relevant controls.',
            'Pin the package version, test persistence and exports before upgrades, and inspect the Network panel for unexpected asset hosts. If collaboration is added later, treat it as a separate architecture project with authorization, document access control, presence, conflict handling, and storage retention.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Inspect the embedded and fullscreen behavior',
        text: 'Open the local tldraw whiteboard, draw a few shapes, refresh to test browser persistence, and compare wheel behavior before and after fullscreen.',
        href: '/other/whiteboard',
        linkLabel: 'Open tldraw Whiteboard',
      },
      conclusion: 'A production tldraw wrapper is mostly integration engineering: client-only loading, deterministic assets, clear persistence semantics, deliberate wheel ownership, component-level customization, and reliable viewport changes. Keep those responsibilities in the product shell and leave drawing primitives to the editor runtime.',
      faq: [
        { question: 'Can tldraw be rendered as a Next.js Server Component?', answer: 'The surrounding route and metadata can be server-rendered, but the editor itself depends on browser APIs and should live in a client component. Dynamic import after hydration also keeps its large runtime out of the server-rendering path.' },
        { question: 'Does persistenceKey sync a board across devices?', answer: 'No. It provides browser-local persistence on the current origin and profile. Cross-device sync or multiplayer collaboration needs an authenticated storage and synchronization layer.' },
        { question: 'Why self-host tldraw assets?', answer: 'Self-hosting makes asset availability, CSP rules, offline behavior, caching, and version matching controllable by the application. It also prevents a remote asset outage from breaking the editor UI.' },
        { question: 'Why does the page stop scrolling when the pointer is over the canvas?', answer: 'The editor consumes wheel events for camera movement. Embedded integrations need an explicit policy: disable or intercept ordinary canvas wheel movement so the document page can scroll, then restore editor panning in fullscreen.' },
        { question: 'Is tldraw persistence enough for important documents?', answer: 'It is useful for local drafts, but it is not a managed backup. Important documents should also be exportable, and products promising account storage need a tested backend, retention policy, and recovery workflow.' },
      ],
    },
    {
      title: '怎么封装 tldraw 实现在线白板：从动态加载到本地持久化',
      excerpt: '基于 Next.js 和 React 封装 tldraw，完整处理客户端加载、静态资源、本地持久化、工具栏、页面滚动与全屏适配。',
      metaTitle: '怎么封装 tldraw 实现在线白板：React 实战',
      metaDescription: '实战讲解 tldraw 白板封装：动态加载、本地资源、persistenceKey、工具栏、滚轮冲突、全屏、国际化与异常重试。',
      readingTime: '约 12 分钟阅读',
      tags: ['浏览器工具开发', 'tldraw', '在线白板', 'Next.js', '前端工程'],
      relatedTools: [
        {
          label: 'tldraw 在线白板',
          href: '/other/whiteboard',
          description: '在浏览器本地绘制图形、便签、箭头和图片，支持多页面与编辑器原生导出。',
        },
        {
          label: 'Excalidraw 画板',
          href: '/other/excalidraw-board',
          description: '需要手绘风格时，可以使用 Excalidraw 完成草图与流程图。',
        },
      ],
      lead: 'tldraw 能快速给 React 应用增加无限画布，但把 <Tldraw /> 放进 Next.js 页面，只完成了不到百分之五。真正的产品封装从加载、资源、持久化、滚动归属、响应式控制、全屏和授权部署开始。',
      intro: '本文拆解一套真实的浏览器本地封装：白板数据保存在用户浏览器中，编辑器字体与图标由站点自行托管，支持中英文界面，宽屏使用纵向工具栏，并且在普通页面中优先让网页滚动，进入全屏后再把滚轮交回画布。',
      sections: [
        {
          heading: '先划清 tldraw 与产品外壳的职责',
          paragraphs: [
            '把 tldraw 当作产品外壳里的编辑器运行时。页面布局、加载与重试、隐私提示、全屏、统计边界和导航属于应用；图形、选择、相机、撤销历史、页面和原生导出属于 tldraw。',
            '边界明确后，就不会一边重复实现库已经做好的编辑能力，一边忽略画布周围真正影响用户体验的产品行为。',
          ],
          table: {
            type: 'table',
            headers: ['能力', '负责方'],
            rows: [
              ['图形、工具、选择、多页面', 'tldraw'],
              ['路由、标题、帮助文案、异常状态', '应用外壳'],
              ['文档持久化', 'persistenceKey 或自定义 store'],
              ['协作与身份认证', '业务后端和同步架构'],
              ['静态资源与 CSP', '应用部署层'],
            ],
          },
        },
        {
          heading: '只在浏览器加载 tldraw',
          paragraphs: [
            '画布编辑器依赖浏览器 API，而且 JavaScript 体积不小。把封装组件标记为 client component，在该工具的 route layout 引入 tldraw/tldraw.css，等页面 hydration 后再动态 import 运行时。保存组件函数时要使用 setState(() => Component)，否则 React 可能把组件函数当作状态更新器执行。',
            'effect 内还要记录组件是否仍然挂载，避免慢速加载完成后更新已经卸载的页面。加载失败时可以递增加载次数，让用户点击按钮重新请求 chunk。',
          ],
          code: { type: 'code', language: 'tsx', code: tldrawCode },
        },
        {
          heading: '把编辑器运行时资源全部本地化',
          paragraphs: [
            '白板可能在开发环境一切正常，上线后却因为严格 CSP、离线部署或外部资源不可用而丢失字体、翻译、图标和嵌入缩略图。通过 assetUrls 把运行时资源统一映射到同源的版本化目录。',
            '资源映射应集中在一个工具模块里。升级 tldraw 时，对比新版资源清单与本地文件，把缺失资源变成构建期错误，而不是等生产工具栏出现空白才发现。',
          ],
          code: { type: 'code', language: 'typescript', code: tldrawAssetsCode },
          items: [
            '复制图标雪碧图或实际需要的独立图标。',
            '包含文字工具会用到的全部字体粗细和斜体。',
            '准备语言切换器可能选择的 locale JSON。',
            '开放嵌入能力时，同时托管 embed icons。',
          ],
        },
        {
          heading: '用 persistenceKey 实现单用户本地白板',
          paragraphs: [
            '稳定的 persistenceKey 让编辑器在刷新后从浏览器本地恢复白板，很适合无需账号的单用户工具，画布内容也不必提交到应用 API。key 要带产品前缀，避免同一域名下的多个白板互相覆盖。',
            '本地持久化不是云端备份。清除站点数据、切换浏览器配置或使用无痕模式，都可能让文档消失。如果产品承诺账号同步、多人协作、历史版本或跨设备访问，就应把它们设计成明确的后端能力，不能暗示 persistenceKey 已经做到。',
          ],
          items: [
            '说明本地保存了什么，以及用户如何清除。',
            '不要在客户端可见的 key 里放用户密钥。',
            '提供导出能力，让用户可以自行备份。',
            '升级库导致数据结构变化时，准备版本标识或迁移策略。',
          ],
        },
        {
          heading: '解决画布滚轮与网页滚动冲突',
          paragraphs: [
            '无限画布天然希望独占滚轮做平移和缩放，但嵌在长页面中间的白板不应该截断网页纵向滚动。一种实用策略是：普通嵌入状态把 wheelBehavior 设为 none，把没有修饰键的滚轮位移转发给 window.scrollBy；进入全屏后再把滚轮恢复为画布 pan。',
            'Ctrl 或 Command 加滚轮通常用于编辑器缩放，应保留给画布；零位移事件无需转发。除普通鼠标外还要测试触控板，因为横向位移和惯性滚动差异很大。',
          ],
        },
        {
          heading: '通过 components 定制工具栏',
          paragraphs: [
            'components prop 允许应用替换部分编辑器 UI，而不需要 fork tldraw。对于纵向空间充足的工作区，可以用 DefaultToolbar 包一层 vertical orientation，把常用工具放在左侧，同时释放顶部横向空间，再用少量 CSS 把它定位在画布框内。',
            '优先组合默认组件，不要复制内部工具栏实现。默认组件会继承库里的快捷键、工具状态与可访问性行为，复制版本在升级后很容易漂移。',
          ],
          items: [
            '按真实画布高度设置最小和最大可见工具数。',
            '保证触摸和键盘用户仍能访问工具说明。',
            '先使用编辑器提供的组件 API，再考虑覆盖内部 class。',
            'CSS 覆盖尽量只处理定位和产品语义色。',
          ],
        },
        {
          heading: '实现有降级能力的全屏',
          paragraphs: [
            '原生 requestFullscreen 隔离效果最好，但浏览器、iframe 或 Permissions Policy 都可能拒绝。捕获异常后，可以把容器切换为 fixed inset-0 作为 CSS 全屏降级；降级状态下锁住 body 滚动，并监听 Escape 退出。',
            '无论原生全屏还是 CSS 降级，布局稳定后都应触发一次 resize。画布编辑器会缓存视口尺寸，如果仍使用旧尺寸，工具栏可能被裁掉，相机中心也会偏移。',
          ],
        },
        {
          heading: '上线前处理异常、授权与升级',
          paragraphs: [
            'chunk 下载过程中显示真实 loading surface，import 失败后展示可理解的错误和重试按钮。根据所用版本确认 tldraw 的授权要求，并按官方部署规则配置客户端 license key。浏览器下发的 key 不是秘密，真正约束来自域名限制和许可证条款。',
            '固定依赖版本，升级前回归本地持久化和导出，并在 Network 面板检查是否仍有意外外部资源。如果未来加入协作，应把身份认证、文档访问控制、在线状态、冲突解决与保存周期当作独立架构项目。',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: '实际检查嵌入与全屏行为',
        text: '打开本地 tldraw 白板，画几个图形后刷新验证浏览器持久化，再对比普通页面和全屏状态下的滚轮行为。',
        href: '/other/whiteboard',
        linkLabel: '打开 tldraw 白板',
      },
      conclusion: '生产级 tldraw 封装的重点是集成工程：只在客户端加载、确定性托管资源、明确本地持久化语义、设计滚轮归属、通过组件 API 定制，以及可靠处理视口变化。应用外壳做好这些边界，图形编辑能力则交给编辑器运行时。',
      faq: [
        { question: 'tldraw 可以直接放在 Next.js Server Component 里吗？', answer: '路由外壳和 metadata 可以服务端渲染，但编辑器本身依赖浏览器 API，应放在 client component。hydration 后动态加载还能让较大的编辑器运行时离开服务端渲染路径。' },
        { question: 'persistenceKey 能让白板跨设备同步吗？', answer: '不能。它提供的是当前域名、当前浏览器配置下的本地持久化。跨设备同步或多人协作需要带身份认证的存储与同步层。' },
        { question: '为什么要自己托管 tldraw 静态资源？', answer: '同源托管能让资源可用性、CSP、离线行为、缓存和版本匹配都由应用控制，也能避免外部资源故障导致编辑器 UI 不完整。' },
        { question: '为什么鼠标放在画布上后网页不能滚动？', answer: '编辑器会消费滚轮事件来移动相机。嵌入页面必须制定明确策略：普通状态禁用或拦截画布滚轮，让文档页面滚动；全屏时再恢复画布平移。' },
        { question: 'tldraw 本地持久化适合保存重要文档吗？', answer: '它适合本地草稿，但不是受管理的备份。重要文档还应支持导出；如果产品承诺账号存储，则需要经过测试的后端、保存周期与恢复流程。' },
      ],
    },
  ),
  article(
    'wrap-excalidraw-nextjs',
    {
      title: 'How to Embed Excalidraw in Next.js without Asset or SSR Problems',
      excerpt: 'A focused Excalidraw wrapper for Next.js covering dynamic import, local asset paths, editor options, localization, fullscreen fallback, export, and persistence choices.',
      metaTitle: 'How to Embed Excalidraw in Next.js',
      metaDescription: 'Wrap Excalidraw in Next.js with client-only loading, a local EXCALIDRAW_ASSET_PATH, UI options, localization, responsive fullscreen, exports, and persistence decisions.',
      readingTime: '10 min read',
      tags: ['browser tool development', 'Excalidraw', 'Next.js', 'diagram editor', 'frontend engineering'],
      relatedTools: [
        {
          label: 'Excalidraw Board',
          href: '/other/excalidraw-board',
          description: 'Create hand-drawn diagrams locally with shapes, text, images, scene files, and image export.',
        },
        {
          label: 'tldraw Whiteboard',
          href: '/other/whiteboard',
          description: 'Use a general-purpose infinite canvas with notes, pages, media, and a different interaction model.',
        },
      ],
      lead: 'Excalidraw is attractive because one React component provides a complete hand-drawn editor. The two failures that appear most often in real Next.js deployments are not drawing bugs: the editor is evaluated during server rendering, or its fonts, locales, and data chunks resolve from the wrong asset path.',
      intro: 'A robust wrapper therefore starts with client-only loading and deterministic asset hosting. After that, the application can decide which native actions to expose, how to localize the editor, whether scenes remain ephemeral or persist, and how fullscreen behaves when the native browser API is unavailable.',
      sections: [
        {
          heading: 'Choose Excalidraw when the visual language fits',
          paragraphs: [
            'Excalidraw excels at architecture sketches, rough flows, workshop notes, and diagrams that should feel informal rather than pixel-perfect. It includes selection, connectors, text, images, scene loading, and image export. That makes it a strong embedded editor when the product does not need a custom shape engine.',
            'A hand-drawn style is also a product decision. If users need multi-page canvases, a heavily customized UI, precise design tooling, or deep domain-specific shapes, compare the editor APIs before committing to the visual result alone.',
          ],
          table: {
            type: 'table',
            headers: ['Requirement', 'Excalidraw fit'],
            rows: [
              ['Hand-drawn flows and architecture sketches', 'Strong'],
              ['Scene import and image export', 'Built in'],
              ['Simple local single-user board', 'Strong'],
              ['Custom collaboration backend', 'Possible, but separate architecture'],
              ['Pixel-precise UI design editor', 'Usually not the target'],
            ],
          },
        },
        {
          heading: 'Keep the editor out of the server-rendering path',
          paragraphs: [
            'Use a client component and import @excalidraw/excalidraw/index.css from the route layout. In an effect, configure the asset base and then dynamically import the package. This avoids evaluating DOM-dependent code on the server and keeps the editor chunk off unrelated pages.',
            'The asset path must be assigned before the runtime tries to resolve fonts, locales, or data chunks. A helper guarded by typeof window is safe to call at module initialization in the client bundle and again immediately before import.',
          ],
          code: { type: 'code', language: 'tsx', code: excalidrawCode },
        },
        {
          heading: 'Copy and version the Excalidraw assets',
          paragraphs: [
            'EXCALIDRAW_ASSET_PATH should point to a directory served by the same deployment, such as /excalidraw/. Copy the version-matched package assets into public/excalidraw and keep the trailing slash. Test a clean production build because development resolution can hide missing files.',
            'Open the browser Network panel and filter for failed fonts, locale modules, and data chunks. Strict CSP deployments should allow the editor’s required workers and blobs only as narrowly as the chosen feature set requires.',
          ],
          items: [
            'Version package and copied assets together.',
            'Do not depend on node_modules paths at runtime.',
            'Verify Chinese and English locale chunks explicitly.',
            'Exercise image insertion and export after deployment, not only basic rectangles.',
          ],
        },
        {
          heading: 'Expose native UI actions instead of rebuilding them',
          paragraphs: [
            'UIOptions controls which native canvas actions and tools are visible. A general local board can enable clear, scene loading, save-to-file, image export, background changes, theme switching, and image insertion. This provides a complete workflow without duplicating modal, file, and serialization behavior in the product shell.',
            'Use initialData for a predictable first canvas state, but do not confuse it with controlled state. It initializes the scene; continuous persistence should be built through change callbacks or Excalidraw’s imperative API.',
          ],
          code: { type: 'code', language: 'tsx', code: excalidrawUiCode },
        },
        {
          heading: 'Localize at the editor boundary',
          paragraphs: [
            'Map the application locale to Excalidraw’s langCode in one place. For example, zh becomes zh-CN while English uses en. The outer page title, privacy note, loading text, retry action, and fullscreen labels remain in the application’s message catalog.',
            'This split keeps editor-owned strings aligned with the package translation while product-owned strings follow the website’s i18n workflow. Test the longest labels because the editor toolbar can wrap differently across locales.',
          ],
        },
        {
          heading: 'Decide whether scenes are ephemeral, local, or synced',
          paragraphs: [
            'A minimal wrapper can rely on Excalidraw’s native load and save actions without retaining a copy in React state. That is a good privacy-first default for a utility page: the application does not collect the scene, and users explicitly save files when they want portability.',
            'If automatic local restore is required, serialize elements, app state, and files carefully through onChange and store them in browser storage with debouncing and quota handling. If account sync or collaboration is required, file blobs, document permissions, encryption, migrations, and conflict handling become backend concerns.',
          ],
          items: [
            'Do not write to storage on every pointer movement without debounce.',
            'Persist referenced files as well as scene elements or images will disappear.',
            'Strip transient app-state fields before long-term storage.',
            'Show users whether the board is unsaved, local-only, or synced.',
          ],
        },
        {
          heading: 'Make fullscreen a product feature, not a CSS accident',
          paragraphs: [
            'The editor needs a container with an explicit height in embedded mode. For fullscreen, request native fullscreen on the wrapper and fall back to a fixed viewport container when the request rejects. Lock body scrolling in the fallback and release it during cleanup.',
            'After entering or leaving either mode, dispatch resize so Excalidraw recalculates its viewport. Use min-h-0 on flex ancestors; without it, the canvas can overflow instead of shrinking inside a fullscreen column.',
          ],
        },
        {
          heading: 'Handle loading and teardown deliberately',
          paragraphs: [
            'A blank white rectangle during a slow dynamic import looks broken. Render a neutral loading surface, switch to a localized error with retry if import fails, and cancel state updates after unmount. If the wrapper registers fullscreen or keyboard listeners, remove every listener and restore body styles in effect cleanup.',
            'Keep analytics outside scene callbacks unless there is a clear, privacy-reviewed need. Tool usage can usually be measured with page and button events without collecting drawing elements, text, filenames, or embedded images.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Try a self-contained Excalidraw wrapper',
        text: 'Create a sketch, insert an image, switch language or theme, export the result, and test fullscreen without sending the scene to a processing API.',
        href: '/other/excalidraw-board',
        linkLabel: 'Open Excalidraw Board',
      },
      conclusion: 'The reliable Excalidraw recipe is small but strict: client component, asset path before dynamic import, version-matched public assets, native UI composition, explicit persistence semantics, and a container that survives fullscreen changes. Most integration bugs disappear when those boundaries are designed first.',
      faq: [
        { question: 'Why does Excalidraw fail with window is not defined in Next.js?', answer: 'The package is being evaluated in a server-rendering context. Keep the editor in a client component and dynamically import it after mount so DOM-dependent code only runs in the browser.' },
        { question: 'What does EXCALIDRAW_ASSET_PATH control?', answer: 'It tells the Excalidraw runtime where to load supporting assets such as fonts, locale chunks, and other packaged resources. Point it to a version-matched public directory and configure it before importing the editor.' },
        { question: 'Does Excalidraw automatically save an embedded scene?', answer: 'Do not assume that it does. Native scene save and load actions let users manage files, while automatic restore requires an explicit persistence design using change data, files, storage limits, and migrations.' },
        { question: 'Why are inserted images missing after restoring a scene?', answer: 'Scene elements can reference binary files stored separately. Persisting only elements and app state loses those file blobs. Store and restore the files collection as part of the same document.' },
        { question: 'Should I use Excalidraw or tldraw?', answer: 'Choose by product needs. Excalidraw is excellent for a recognizable hand-drawn diagram style and native scene workflows. tldraw offers a different general whiteboard model with pages and extensive editor composition. Prototype both with your required persistence, assets, and mobile interactions.' },
      ],
    },
    {
      title: '怎么封装 Excalidraw：解决 Next.js SSR、资源路径与全屏问题',
      excerpt: '在 Next.js 中稳定集成 Excalidraw，解决动态加载、静态资源路径、工具配置、国际化、全屏降级、导出与持久化取舍。',
      metaTitle: '怎么封装 Excalidraw：Next.js 集成实战',
      metaDescription: '讲解 Excalidraw 在 Next.js 中的封装方法，包括客户端动态加载、EXCALIDRAW_ASSET_PATH、UI 配置、国际化、全屏与持久化。',
      readingTime: '约 10 分钟阅读',
      tags: ['浏览器工具开发', 'Excalidraw', 'Next.js', '在线画板', '前端工程'],
      relatedTools: [
        {
          label: 'Excalidraw 在线画板',
          href: '/other/excalidraw-board',
          description: '使用图形、文字和图片在浏览器本地创建手绘风示意图，支持场景文件和图片导出。',
        },
        {
          label: 'tldraw 在线白板',
          href: '/other/whiteboard',
          description: '需要便签、多页面和另一套交互模型时，可使用通用无限画布。',
        },
      ],
      lead: 'Excalidraw 很适合嵌入 React：一个组件就能得到完整的手绘风编辑器。但 Next.js 上线后最常见的两个问题往往不是画图，而是编辑器在服务端被执行，或者字体、语言包与数据 chunk 从错误地址加载。',
      intro: '因此，可靠封装要从“只在客户端加载”和“确定性托管静态资源”开始。做好这两点后，应用再决定开放哪些原生操作、如何映射语言、场景是否自动保存，以及原生全屏不可用时如何降级。',
      sections: [
        {
          heading: '先确认 Excalidraw 是否适合产品场景',
          paragraphs: [
            'Excalidraw 很适合架构草图、粗略流程、会议共创和希望保持非正式感的示意图。它已经提供选择、连线、文字、图片、场景加载和图片导出，产品不必自己实现图形引擎。',
            '手绘风格也是产品取舍。如果用户需要多页面、深度定制编辑器 UI、像素级设计或大量业务专用图形，应先比较编辑器 API，而不是只被默认视觉效果吸引。',
          ],
          table: {
            type: 'table',
            headers: ['需求', 'Excalidraw 适配度'],
            rows: [
              ['手绘风流程图与架构草图', '很适合'],
              ['场景导入和图片导出', '原生支持'],
              ['简单的本地单用户画板', '很适合'],
              ['自建多人协作后端', '可以，但属于独立架构'],
              ['像素级 UI 设计编辑器', '通常不是目标'],
            ],
          },
        },
        {
          heading: '让编辑器离开服务端渲染路径',
          paragraphs: [
            '封装组件使用 client component，并在该工具 route layout 引入 @excalidraw/excalidraw/index.css。在 effect 中先配置资源根路径，再动态 import 包。这样既不会在服务端求值依赖 DOM 的代码，也不会让无关页面加载编辑器 chunk。',
            '运行时解析字体、语言包或数据 chunk 之前，必须已经写入资源路径。可以封装一个带 typeof window 判断的函数，在客户端模块初始化时执行一次，import 前再执行一次。',
          ],
          code: { type: 'code', language: 'tsx', code: excalidrawCode },
        },
        {
          heading: '复制并锁定 Excalidraw 静态资源',
          paragraphs: [
            'EXCALIDRAW_ASSET_PATH 应指向部署站点提供的目录，例如 /excalidraw/。把与依赖版本匹配的包资源复制到 public/excalidraw，并保留末尾斜杠。一定要测试干净的生产构建，因为开发环境的解析方式可能掩盖缺失文件。',
            '打开 Network 面板，重点检查字体、locale 模块和数据 chunk 是否 404。严格 CSP 场景只为实际使用的功能开放必要 worker 与 blob 来源。',
          ],
          items: [
            '依赖包版本与复制出来的资源必须一起升级。',
            '运行时不要依赖 node_modules 路径。',
            '分别验证中文和英文语言资源。',
            '部署后测试图片插入和导出，而不只是画一个矩形。',
          ],
        },
        {
          heading: '优先开放原生操作，不要重复造 UI',
          paragraphs: [
            'UIOptions 可以控制显示哪些画布操作和工具。通用本地画板可以开放清空、加载场景、保存文件、图片导出、背景设置、主题切换和图片插入。这样不必在产品外壳里重写弹窗、文件选择与序列化。',
            'initialData 适合设置可预测的首次画布状态，但它不是受控状态。它只负责初始化；持续持久化应通过变化回调或 Excalidraw imperative API 单独设计。',
          ],
          code: { type: 'code', language: 'tsx', code: excalidrawUiCode },
        },
        {
          heading: '在编辑器边界做国际化映射',
          paragraphs: [
            '把站点 locale 到 Excalidraw langCode 的映射集中处理，例如 zh 对应 zh-CN，英文使用 en。页面标题、隐私提示、加载文案、重试按钮和全屏按钮仍然进入网站自己的消息字典。',
            '这样编辑器内部文案跟随依赖包翻译，产品文案则继续遵循网站 i18n 流程。不同语言下工具栏宽度可能变化，必须用最长文案测试换行和遮挡。',
          ],
        },
        {
          heading: '明确场景是临时、本地保存还是云端同步',
          paragraphs: [
            '最小封装可以只使用 Excalidraw 原生加载和保存功能，不在 React state 中保留场景副本。对于强调隐私的工具页，这是很好的默认值：应用不收集画布，用户需要携带时主动保存文件。',
            '如果需要自动本地恢复，应通过 onChange 谨慎序列化 elements、appState 和 files，做防抖并处理浏览器配额。如果需要账号同步或协作，文件 Blob、文档权限、加密、迁移与冲突解决都会变成后端问题。',
          ],
          items: [
            '不要在每次指针移动时无防抖写存储。',
            '除了场景元素还要保存引用文件，否则图片会消失。',
            '长期存储前过滤临时 appState 字段。',
            '明确告诉用户画板是未保存、本地保存还是已经同步。',
          ],
        },
        {
          heading: '把全屏当成产品功能，而不是偶然 CSS',
          paragraphs: [
            '嵌入状态下，编辑器容器必须有明确高度。进入全屏时在外层 wrapper 调用 requestFullscreen；如果浏览器拒绝，则降级为 fixed 覆盖整个视口。CSS 全屏时锁住 body 滚动，并在 cleanup 恢复。',
            '进入或退出两种全屏模式后，都应触发 resize，让 Excalidraw 重新计算视口。flex 祖先还要设置 min-h-0，否则画布可能溢出，而不是在全屏列布局中收缩。',
          ],
        },
        {
          heading: '认真处理加载、清理与隐私边界',
          paragraphs: [
            '动态 import 较慢时，纯白矩形看起来像坏掉了。应该显示中性的加载面，import 失败后切换为本地化错误和重试操作，组件卸载后也不能继续 setState。全屏和键盘监听器必须全部移除，body 样式也要在 effect cleanup 中恢复。',
            '除非经过明确隐私评审，不要在 scene change 回调里做统计。通常只记录页面访问和按钮事件就足够，不需要收集图形、文字、文件名或嵌入图片。',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: '体验完整的 Excalidraw 封装',
        text: '创建草图、插入图片、切换语言或主题、导出结果并测试全屏，整个场景无需提交到处理 API。',
        href: '/other/excalidraw-board',
        linkLabel: '打开 Excalidraw 画板',
      },
      conclusion: '稳定的 Excalidraw 集成并不复杂，但边界必须严格：client component、动态加载前设置资源路径、复制与版本匹配的公共资源、组合原生 UI、明确持久化语义，并让容器正确适应全屏变化。优先设计这些边界，大部分集成问题都会消失。',
      faq: [
        { question: '为什么 Next.js 集成 Excalidraw 会报 window is not defined？', answer: '依赖包在服务端渲染上下文中被执行了。把编辑器放进 client component，并在挂载后动态 import，让依赖 DOM 的代码只在浏览器运行。' },
        { question: 'EXCALIDRAW_ASSET_PATH 控制什么？', answer: '它告诉 Excalidraw 运行时从哪里加载字体、语言 chunk 等配套资源。应指向与依赖版本匹配的 public 目录，并在 import 编辑器之前完成设置。' },
        { question: '嵌入 Excalidraw 后会自动保存场景吗？', answer: '不要默认它会自动保存。原生场景加载和保存操作可以让用户管理文件；自动恢复需要显式设计变化数据、文件、存储上限和迁移。' },
        { question: '为什么恢复场景后，插入的图片不见了？', answer: '场景元素引用的二进制文件可能单独保存。只持久化 elements 和 appState 会丢失文件 Blob，必须把 files 集合当作同一文档的一部分保存与恢复。' },
        { question: '应该选择 Excalidraw 还是 tldraw？', answer: '取决于产品需求。Excalidraw 适合鲜明的手绘图风格和原生场景工作流；tldraw 提供另一套通用白板模型、多页面与丰富的编辑器组合能力。应使用真实的持久化、资源和移动端需求分别做原型。' },
      ],
    },
  ),
  article(
    'build-online-mind-map-with-mind-elixir',
    {
      title: 'How to Build an Online Mind Map with MindElixir and Markdown',
      excerpt: 'Build a browser-local MindElixir editor with a Markdown outline, lifecycle cleanup, selection synchronization, keyboard behavior, panning, fullscreen, and multi-format export.',
      metaTitle: 'Build an Online Mind Map with MindElixir',
      metaDescription: 'Learn to wrap MindElixir in React with Markdown conversion, client-only initialization, event synchronization, keyboard editing, canvas panning, fullscreen, and SVG/PNG/JSON export.',
      readingTime: '13 min read',
      tags: ['browser tool development', 'MindElixir', 'online mind map', 'Markdown', 'frontend engineering'],
      relatedTools: [
        {
          label: 'Online Mind Map',
          href: '/other/mind-map',
          description: 'Edit a browser-local mind map and import or export Markdown, JSON, SVG, PNG, and a standalone HTML snapshot.',
        },
        {
          label: 'Markdown File Merger',
          href: '/file-merge/markdown',
          description: 'Combine multiple Markdown files locally when a larger outline or document is split across separate sources.',
        },
      ],
      lead: 'MindElixir can render an editable mind map quickly, but a useful online editor needs more than mind.init(data). Users expect the visual tree and a portable outline to stay synchronized, keyboard editing to feel predictable, the canvas to pan, fullscreen to refit, and exports to preserve their work.',
      intro: 'The architecture below treats MindElixir as an imperative browser runtime and Markdown as a readable interchange format. React owns the shell and derived UI state; pure utility functions own Markdown and JSON conversion; the editor instance owns interactive nodes, history, links, summaries, focus mode, zoom, and rendering.',
      sections: [
        {
          heading: 'Use one canonical tree shape at each boundary',
          paragraphs: [
            'MindElixir’s native data centers on nodeData: every node has an id, topic, and optional children, while direction describes left, right, or two-sided layout. The live editor should operate on this native tree. Markdown and JSON are import or export representations, not competing live stores.',
            'For the product shell, derive a snapshot after editor operations: current Markdown, selected topic, selected count, whether delete or focus is available, zoom percentage, focus mode, and layout. This avoids re-rendering the imperative editor from React on every selection change.',
          ],
          table: {
            type: 'table',
            headers: ['Representation', 'Purpose'],
            rows: [
              ['MindElixirData', 'Live editor data and native JSON backup'],
              ['Markdown outline', 'Human-readable editing and interchange'],
              ['React snapshot', 'Buttons, status, selection, zoom, and layout UI'],
              ['SVG or PNG', 'Sharing a visual result'],
              ['Standalone HTML', 'Portable visual plus readable outline'],
            ],
          },
        },
        {
          heading: 'Initialize the imperative editor after mount',
          paragraphs: [
            'Import mind-elixir/style.css from the route layout, then dynamically load both the runtime and its i18n module inside an effect. Create the instance with a real host element, initialize it once, and destroy it during cleanup. A disposed flag prevents late asynchronous work from reviving an unmounted editor.',
            'Store the instance in a ref, not React state. Changing selection, camera position, or node text should not cause React to recreate the canvas. A ResizeObserver can call scaleFit after the host size changes.',
          ],
          code: { type: 'code', language: 'typescript', code: mindElixirInitCode },
        },
        {
          heading: 'Convert Markdown with a pure stack-based parser',
          paragraphs: [
            'A practical outline format can accept ATX headings and indented bullets. Parse each non-empty line into a level and topic, then maintain a stack of the most recent node at each level. Before appending a new node, pop stack entries whose level is greater than or equal to the incoming level; the remaining top is its parent.',
            'If the document contains multiple top-level roots, create a synthetic fallback root. Generate fresh node IDs during import and normalize line breaks out of topic text during export. Return an outcome object instead of throwing parser errors into the component.',
          ],
          code: { type: 'code', language: 'typescript', code: markdownParserCode },
          items: [
            'Use two spaces as one bullet nesting level, and normalize tabs consistently.',
            'Trim bullet markers without removing meaningful punctuation inside a topic.',
            'Export the root as a heading and descendants as indented bullets.',
            'Keep parsing and serialization independent of React and the DOM.',
          ],
        },
        {
          heading: 'Synchronize from editor events, not a polling loop',
          paragraphs: [
            'MindElixir exposes an event bus for operations, selection, new nodes, and scaling. Subscribe once after initialization and schedule snapshot reads for the next task so the editor has finished updating its internal data and DOM. Remove the exact listener functions during cleanup.',
            'Do not update the Markdown editor while the user has an outline draft open. Keep latest committed Markdown in a ref and only replace the draft after an explicit import or when the outline is closed. Otherwise a selection event can overwrite half-written Markdown.',
          ],
          items: [
            'operation: update document-derived UI and detect beginEdit.',
            'selectNewNode: synchronize a newly created editable node.',
            'selectNodes and unselectNodes: update action availability.',
            'scale: update the displayed zoom percentage without rebuilding the map.',
          ],
        },
        {
          heading: 'Make keyboard editing predictable',
          paragraphs: [
            'Imperative editors often create a temporary contenteditable element for node editing. Global shortcuts can fire before that editor commits, causing Enter or Tab to add another node while the current text is still transient. Capture keydown at the editor container, commit Enter or Tab, restore the original text on Escape, and then synchronize the snapshot.',
            'When starting an edit programmatically, wait for the input element to exist, focus it, and select its text. After finishing, return focus to the map container so undo, redo, insertion, and deletion shortcuts continue to work.',
          ],
        },
        {
          heading: 'Add canvas panning without breaking node interaction',
          paragraphs: [
            'A full editor should pan when the user drags empty canvas, but dragging a topic, expansion control, link, summary, input, or button must retain its native behavior. On pointerdown, detect whether the target belongs to an interactive element; only capture the pointer for true background drags.',
            'Track the last pointer position and call mind.move(dx, dy) on pointermove. Release pointer capture on pointerup or pointercancel, reset the cursor, and restore editor focus. Pointer Events give one path for mouse, pen, and touch.',
          ],
        },
        {
          heading: 'Expose editor features through small action adapters',
          paragraphs: [
            'Wrap imperative actions in one runMapAction helper that catches errors, schedules a snapshot refresh, and restores focus. Buttons can then call addChild, insertSibling, beginEdit, removeNodes, undo, redo, scaleFit, initLeft, initRight, initSide, focusNode, cancelFocus, createSummary, or createArrow without duplicating lifecycle code.',
            'For link creation, store the source topic and one-way or two-way mode in refs. The next valid topic click becomes the target, after which the mode is cleared. This is easier to reason about than trying to infer two selected nodes after unrelated selection events.',
          ],
        },
        {
          heading: 'Export data for editing, sharing, and recovery',
          paragraphs: [
            'Native JSON is the safest round-trip backup because it retains MindElixir data. Markdown is the most readable interchange format. SVG is ideal for scalable documents, PNG for quick sharing, and a standalone HTML snapshot can combine the exported SVG with a collapsible Markdown outline.',
            'When importing JSON, validate nodeData recursively instead of trusting a cast. Every node should have string id and topic fields, children must be a recursive node array, and direction should be limited to supported values. Download through Blob object URLs and revoke them immediately after use.',
          ],
          items: [
            'JSON: native editable backup.',
            'Markdown: portable outline and easy text editing.',
            'SVG: resolution-independent visual export.',
            'PNG: convenient image sharing.',
            'HTML: self-contained snapshot with accessible outline.',
          ],
        },
        {
          heading: 'Refit after fullscreen and container changes',
          paragraphs: [
            'Use the same native-fullscreen plus fixed-position fallback pattern as other canvas tools. After every transition, call scaleFit after layout settles. A ResizeObserver on the map host handles responsive sidebars, orientation changes, and other container size updates.',
            'Destroy the observer, event listeners, pointer state, link mode, and MindElixir instance when the component unmounts. Hot reload can otherwise leave duplicate keyboard handlers and event bus subscriptions that make every action run twice.',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: 'Try the complete MindElixir workflow',
        text: 'Edit nodes, switch layouts, create links and summaries, open the Markdown outline, then export JSON, SVG, PNG, Markdown, or a standalone HTML snapshot.',
        href: '/other/mind-map',
        linkLabel: 'Open Mind Map',
      },
      conclusion: 'The maintainable MindElixir architecture separates the imperative editor from React and separates conversion from both. Initialize once, synchronize through events, protect in-progress outline edits, adapt actions through one error boundary, and offer native JSON plus readable Markdown. That produces a real tool rather than a canvas demo.',
      faq: [
        { question: 'Should Markdown or MindElixirData be the live source of truth?', answer: 'Use MindElixirData while the visual editor is active. Derive Markdown after committed operations and import it explicitly when the user applies an outline draft. Rebuilding the editor from Markdown on every event loses editor-specific state and can overwrite in-progress edits.' },
        { question: 'Why store the MindElixir instance in a ref?', answer: 'It is a mutable imperative runtime, not render state. A ref keeps the same instance across React renders without causing rerenders when selection, zoom, or history changes.' },
        { question: 'Why call destroy during cleanup?', answer: 'The instance owns DOM, event bus subscriptions, keyboard behavior, and other resources. Destroying it and removing custom listeners prevents duplicate handlers after route changes or hot reload.' },
        { question: 'Which export format is best for restoring a map?', answer: 'Native JSON is best for round-trip editing because it preserves the tree and editor-specific data. Markdown is more portable and human-readable but may not preserve links, summaries, styles, or every layout detail.' },
        { question: 'How can an online mind map remain private?', answer: 'Keep parsing, rendering, import, and export in the browser; do not send node text or files to an API; and keep analytics free of content. Users should still understand that clearing browser data removes local state unless they exported a backup.' },
      ],
    },
    {
      title: '怎么使用 MindElixir 实现在线思维导图：Markdown、交互与导出',
      excerpt: '用 React 封装 MindElixir，实现 Markdown 大纲转换、节点状态同步、快捷键、画布拖动、全屏与多格式导出。',
      metaTitle: '怎么使用 MindElixir 实现在线思维导图',
      metaDescription: '实战讲解 React 封装 MindElixir：Markdown 转换、客户端初始化、事件同步、快捷键、画布拖动、全屏及 SVG、PNG、JSON 导出。',
      readingTime: '约 13 分钟阅读',
      tags: ['浏览器工具开发', 'MindElixir', '在线思维导图', 'Markdown', '前端工程'],
      relatedTools: [
        {
          label: '在线思维导图',
          href: '/other/mind-map',
          description: '在浏览器本地编辑思维导图，支持 Markdown、JSON、SVG、PNG 与独立 HTML 的导入导出。',
        },
        {
          label: 'Markdown 文件合并',
          href: '/file-merge/markdown',
          description: '当大纲或文档分散在多个来源中时，先在浏览器本地合并 Markdown 文件。',
        },
      ],
      lead: 'MindElixir 可以很快渲染一张可编辑思维导图，但真正可用的在线编辑器远不止 mind.init(data)。用户会期待视觉树与可携带的大纲保持同步、快捷键编辑符合直觉、空白画布可以拖动、全屏后自动适配，并且能够可靠导出成果。',
      intro: '下面这套架构把 MindElixir 视为命令式浏览器运行时，把 Markdown 视为易读的交换格式。React 管理产品外壳和派生 UI 状态；纯工具函数负责 Markdown、JSON 转换；编辑器实例负责节点、历史、连线、概要、专注模式、缩放与渲染。',
      sections: [
        {
          heading: '每个边界只保留一种标准树结构',
          paragraphs: [
            'MindElixir 原生数据以 nodeData 为中心：每个节点包含 id、topic 和可选 children，direction 表示左侧、右侧或双侧布局。视觉编辑过程中应使用这棵原生树；Markdown 和 JSON 是导入导出表示，不是同时竞争的实时状态源。',
            '产品外壳可以在编辑器操作后派生一份快照：当前 Markdown、选中主题、选中数量、是否允许删除或专注、缩放比例、专注模式和布局。这样选择节点时不需要 React 重新渲染整个命令式画布。',
          ],
          table: {
            type: 'table',
            headers: ['数据表示', '用途'],
            rows: [
              ['MindElixirData', '实时编辑数据与原生 JSON 备份'],
              ['Markdown 大纲', '人类可读编辑和数据交换'],
              ['React 快照', '按钮、状态、选择、缩放与布局 UI'],
              ['SVG 或 PNG', '分享视觉结果'],
              ['独立 HTML', '同时携带视觉图与可读大纲'],
            ],
          },
        },
        {
          heading: '组件挂载后再初始化命令式编辑器',
          paragraphs: [
            '在 route layout 引入 mind-elixir/style.css，然后在 effect 中动态加载运行时与 i18n 模块。拿到真实 host 元素后只创建一次实例，卸载时调用 destroy。disposed 标记可以防止异步加载完成后重新激活已卸载的编辑器。',
            '实例应保存在 ref，而不是 React state。改变选择、相机位置或节点文字，都不应该让 React 重新创建画布。还可以用 ResizeObserver 监听容器变化并调用 scaleFit。',
          ],
          code: { type: 'code', language: 'typescript', code: mindElixirInitCode },
        },
        {
          heading: '用纯函数和栈解析 Markdown',
          paragraphs: [
            '实用的大纲格式可以同时接受 ATX 标题和缩进列表。把每个非空行解析成 level 与 topic，再用栈记录各层最近节点。添加新节点前，弹出 level 大于等于当前层级的栈项，剩余栈顶就是父节点。',
            '如果文档出现多个顶级根节点，则创建一个兜底根节点。导入时为节点生成新 ID，导出时把 topic 内换行规范为单行。解析错误返回 Outcome，不要把异常直接抛进组件。',
          ],
          code: { type: 'code', language: 'typescript', code: markdownParserCode },
          items: [
            '约定两个空格为一级列表缩进，并统一规范 Tab。',
            '只移除行首列表标记，不破坏主题内部标点。',
            '导出时根节点使用标题，后代使用缩进列表。',
            '解析和序列化都不依赖 React 与 DOM。',
          ],
        },
        {
          heading: '监听编辑器事件同步，不要轮询',
          paragraphs: [
            'MindElixir 提供 operation、selection、新节点和 scale 等事件。初始化后一次性订阅，并把快照读取安排到下一个任务，让编辑器先完成内部数据与 DOM 更新。cleanup 时必须移除完全相同的监听函数引用。',
            '用户打开 Markdown 大纲并正在编辑时，不要用选择事件覆盖输入框。可以用 ref 保存最近一次已提交 Markdown，只有用户明确应用大纲或大纲面板关闭时才替换 draft，否则点一下节点就可能丢掉写到一半的内容。',
          ],
          items: [
            'operation：更新文档派生 UI，并识别 beginEdit。',
            'selectNewNode：同步刚创建、正准备编辑的新节点。',
            'selectNodes 与 unselectNodes：更新操作按钮可用状态。',
            'scale：只更新缩放百分比，不重建地图。',
          ],
        },
        {
          heading: '让快捷键编辑行为符合预期',
          paragraphs: [
            '命令式编辑器通常会临时创建 contenteditable 节点用于改名。全局快捷键可能在内容提交前触发，导致 Enter 或 Tab 一边新增节点，一边让当前文字停留在临时状态。可以在编辑器容器捕获 keydown：Enter、Tab 先提交，Escape 恢复原文，然后再同步快照。',
            '通过按钮开始编辑时，要等输入节点真正出现，再聚焦并选中文字。结束后把焦点还给地图容器，撤销、重做、新增与删除快捷键才能继续工作。',
          ],
        },
        {
          heading: '增加画布拖动，但不要破坏节点交互',
          paragraphs: [
            '完整编辑器应该允许拖动空白画布，但拖动主题、展开按钮、连线、概要、输入框或按钮时必须保留原生行为。pointerdown 时先判断目标是否位于交互元素内，只有真正的背景拖动才 capturePointer。',
            '记录上一次指针位置，在 pointermove 调用 mind.move(dx, dy)。pointerup 或 pointercancel 时释放捕获、恢复鼠标样式并把焦点还给编辑器。Pointer Events 可以统一处理鼠标、触控笔和触摸。',
          ],
        },
        {
          heading: '用小型适配器暴露编辑器能力',
          paragraphs: [
            '用一个 runMapAction 包住命令式操作，统一捕获错误、延迟同步快照和恢复焦点。按钮就可以安全调用 addChild、insertSibling、beginEdit、removeNodes、undo、redo、scaleFit、initLeft、initRight、initSide、focusNode、cancelFocus、createSummary 或 createArrow，不必重复生命周期代码。',
            '创建连线时，把来源节点与单向/双向模式存进 ref，下一次点击有效主题时把它作为目标，然后清除连线模式。这比在无关 selection 事件之后猜测两个选中节点更容易理解。',
          ],
        },
        {
          heading: '为编辑、分享和恢复提供不同导出格式',
          paragraphs: [
            '原生 JSON 最适合往返备份，因为它保留 MindElixir 数据；Markdown 最容易阅读和交换；SVG 适合文档中的高清矢量图；PNG 方便即时分享；独立 HTML 可以把导出的 SVG 和可折叠 Markdown 大纲放在一起。',
            '导入 JSON 时必须递归验证 nodeData，不能只做类型断言。每个节点都要有字符串 id、topic，children 必须是递归节点数组，direction 只能取支持值。下载使用 Blob Object URL，完成后立即 revoke。',
          ],
          items: [
            'JSON：原生可编辑备份。',
            'Markdown：便携大纲和文本编辑。',
            'SVG：不受分辨率影响的视觉导出。',
            'PNG：方便直接分享图片。',
            'HTML：包含可访问大纲的独立快照。',
          ],
        },
        {
          heading: '全屏和容器变化后重新适配',
          paragraphs: [
            '沿用其他画布工具的“原生全屏加 fixed 降级”模式。每次模式切换后，等布局稳定再调用 scaleFit。map host 上的 ResizeObserver 还能处理响应式侧栏、屏幕方向和其他容器尺寸变化。',
            '组件卸载时销毁 observer、事件监听、指针状态、连线模式和 MindElixir 实例。否则热更新后可能留下重复的键盘与事件总线监听，让每个操作执行两次。',
          ],
        },
      ],
      callout: {
        type: 'callout',
        title: '体验完整 MindElixir 工作流',
        text: '编辑节点、切换布局、创建连线与概要，打开 Markdown 大纲，然后导出 JSON、SVG、PNG、Markdown 或独立 HTML。',
        href: '/other/mind-map',
        linkLabel: '打开在线思维导图',
      },
      conclusion: '可维护的 MindElixir 架构要把命令式编辑器与 React 分开，也要把转换逻辑与两者分开。实例只初始化一次，通过事件同步，保护正在编辑的大纲，用统一错误边界适配操作，并同时提供原生 JSON 与易读 Markdown，才能从画布示例成长为真正的在线工具。',
      faq: [
        { question: 'Markdown 和 MindElixirData 谁应该是实时唯一数据源？', answer: '视觉编辑期间使用 MindElixirData。每次已提交操作后派生 Markdown，用户明确应用大纲草稿时再导入。每个事件都从 Markdown 重建编辑器，会丢失编辑器专属状态，也可能覆盖未完成输入。' },
        { question: '为什么 MindElixir 实例要放在 ref？', answer: '它是可变的命令式运行时，不是渲染状态。ref 能让实例跨 React render 保持不变，也不会因为选择、缩放或历史变化触发组件重渲染。' },
        { question: '为什么卸载时必须调用 destroy？', answer: '实例拥有 DOM、事件总线订阅、快捷键和其他资源。destroy 并移除自定义监听，可以避免切换路由或热更新后出现重复处理器。' },
        { question: '哪种导出格式最适合以后恢复编辑？', answer: '原生 JSON 最适合往返编辑，因为它能保留树结构和编辑器专属数据。Markdown 更便携、更易读，但未必保留连线、概要、样式和所有布局细节。' },
        { question: '在线思维导图如何保护隐私？', answer: '让解析、渲染、导入和导出都在浏览器完成，不把节点文本或文件发送到 API，也不在统计中记录内容。同时要说明：如果没有导出备份，用户清除浏览器数据后，本地状态可能消失。' },
      ],
    },
  ),
];
