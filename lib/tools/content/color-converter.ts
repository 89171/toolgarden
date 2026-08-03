import { defineToolContent } from './define';

export const colorConverterContent = defineToolContent({
  zh: {
    overview: [
      '同一种屏幕颜色可以用 HEX、RGB、HSL 等不同模型描述。HEX 适合复制到 CSS，RGB 直接表达红绿蓝通道，HSL 则更便于围绕色相、饱和度和亮度做成组调整。格式转换不会改变目标颜色，只会改变它的表示方式。',
      '工具会解析支持的颜色写法并同步生成其它格式，适合在设计稿、样式表和代码变量之间核对数值。颜色空间转换存在取整过程，因此往返转换后个别通道可能相差一个单位，这通常不构成可见差异。',
    ],
    steps: [
      ['输入颜色值', '粘贴一种受支持的 HEX、RGB 或 HSL 表达，并检查预览是否符合预期。'],
      ['读取等价值', '从结果中选择目标格式，关注通道范围、百分比与透明度是否保留。'],
      ['复制到目标环境', '将结果写入 CSS、设计变量或文档，并在实际背景上再次检查对比度。'],
    ],
    example: {
      caption: "同一个颜色的五种表示。注意 HSL 的 L 与 HSV 的 V 数值不同，因为两者定义不同。",
      inputLabel: "HEX",
      input: "#2563EB",
      outputLabel: "其它格式",
      output: "RGB   37, 99, 235\nHSL   221, 83%, 53%\nHSV   221, 84%, 92%\nCMYK  84, 58, 0, 8",
      language: "text",
    },
    scenarios: [
      ['设计交付开发', '把设计工具提供的 RGB 数值转换为前端常用的 HEX 或 HSL。'],
      ['整理主题色板', '用 HSL 调整一组颜色的明暗关系，再输出为项目约定的表示格式。'],
      ["按明度调整生成配色变体", "把品牌色转成 HSL 后只改亮度分量，就能得到一组色调一致的深浅变体，用于 hover、禁用等状态。"],
    ],
    notes: [
      '转换只处理颜色数值，不会自动判断文字与背景是否满足无障碍对比度。',
      '带透明度的颜色必须同时确认目标格式和使用环境支持 alpha 通道。',
      'HEX 简写只有在每对通道数字相同时才与六位写法等价。',
    ],
    specs: [["支持格式", "HEX、RGB、HSL、HSV、CMYK 互转，并实时预览色板"], ["HSL 与 HSV 的区别", "两者的第三个分量含义不同：HSL 的 L 是亮度（100% 为白），HSV 的 V 是明度（100% 为纯色）"], ["CMYK 的局限", "CMYK 是印刷色彩空间，与屏幕的 RGB 无法精确对应。转换结果是数学近似，不能替代印刷打样"], ["透明度", "HEX 的 8 位写法可携带 alpha 通道，RGB / HSL 对应 rgba / hsla"], ["色域", "计算基于 sRGB。广色域（P3）颜色转换后会被压缩到 sRGB 范围内"], ["常见用途", "在设计稿、CSS、绘图软件和印刷规范之间统一色值"]],
    faq: [{ question: "HSL 和 HSV 该用哪个？", answer: "调整深浅、生成同色系变体用 HSL：它的 L 到 100% 是白色，符合「更浅」的直觉。从取色器读数或做色彩选择界面用 HSV：它的 V 到 100% 是纯色，符合「更亮」的直觉。" }, { question: "转出的 CMYK 能直接交给印刷厂吗？", answer: "不建议直接用。CMYK 与屏幕 RGB 之间没有精确的数学对应，实际结果还取决于纸张、油墨和印刷设备的色彩配置文件。转换值可以作为沟通起点，正式印刷请以打样为准。" }],
    reference: [
      ['RGB', '以红、绿、蓝三个光通道组合颜色的加色模型。'],
      ['HSL', '以色相、饱和度和亮度组织颜色，常用于生成有规律的色阶。'],
    ],
  },
  en: {
    overview: [
      'The same screen color can be described with HEX, RGB, or HSL. HEX is convenient in CSS, RGB exposes the red, green, and blue channels, and HSL makes coordinated hue, saturation, and lightness changes easier. Conversion changes the notation, not the intended color.',
      'The tool parses a supported color value and produces equivalent formats for checking values across design files, stylesheets, and code tokens. Color conversion includes rounding, so a round trip may change a channel by one unit without producing a meaningful visual difference.',
    ],
    steps: [
      ['Enter a color', 'Paste a supported HEX, RGB, or HSL value and confirm that the preview matches the intended color.'],
      ['Read an equivalent value', 'Choose the target notation and check channel ranges, percentages, and whether alpha is retained.'],
      ['Use it in context', 'Copy the result into CSS, a design token, or documentation and recheck contrast on the real background.'],
    ],
    example: {
      caption: "One colour in five notations. Note that HSL's L and HSV's V differ numerically, because they are defined differently.",
      inputLabel: "HEX",
      input: "#2563EB",
      outputLabel: "Other formats",
      output: "RGB   37, 99, 235\nHSL   221, 83%, 53%\nHSV   221, 84%, 92%\nCMYK  84, 58, 0, 8",
      language: "text",
    },
    scenarios: [
      ['Design handoff', 'Convert RGB values from a design application into the HEX or HSL notation used by the frontend.'],
      ['Building a theme palette', 'Adjust related shades in HSL, then export each color in the notation required by the project.'],
      ["Generating tonal variants by lightness", "Convert a brand colour to HSL and change only the lightness to get a consistent set of lighter and darker variants for hover and disabled states."],
    ],
    notes: [
      'Numeric conversion does not determine whether text and background colors meet accessibility contrast requirements.',
      'For transparent colors, confirm that both the target notation and the destination support an alpha channel.',
      'A short HEX value is equivalent to six-digit HEX only when each channel digit can be doubled.',
    ],
    specs: [["Supported formats", "HEX, RGB, HSL, HSV and CMYK, with a live swatch preview"], ["HSL vs HSV", "The third component differs: L in HSL is lightness (100% is white), V in HSV is value (100% is the pure hue)"], ["CMYK's limits", "CMYK is a print space with no exact mapping to screen RGB. The result is a mathematical approximation, not a substitute for a proof"], ["Alpha", "The 8-digit HEX form carries an alpha channel, matching rgba and hsla"], ["Colour gamut", "Calculations assume sRGB; wide-gamut (P3) colours are compressed into the sRGB range"], ["Common use", "Reconciling colour values across design files, CSS, drawing software and print specifications"]],
    faq: [{ question: "HSL or HSV?", answer: "Use HSL for adjusting shade and building same-hue variants; its L reaching 100% gives white, which matches the intuition of \"lighter\". Use HSV when reading from a picker or building a colour-selection UI; its V reaching 100% gives the pure hue, matching \"brighter\"." }, { question: "Can I send the converted CMYK straight to a printer?", answer: "Not directly. There is no exact mathematical mapping between CMYK and screen RGB, and the real result depends on the paper, ink and device colour profile. Use the numbers as a starting point for the conversation and defer to a physical proof." }],
    reference: [
      ['RGB', 'An additive model that combines red, green, and blue light channels.'],
      ['HSL', 'A model organized by hue, saturation, and lightness, useful for constructing systematic shade ramps.'],
    ],
  },
});
