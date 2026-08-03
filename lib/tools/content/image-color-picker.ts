import { defineToolContent } from './define';

export const imageColorPickerContent = defineToolContent({
  zh: {
    overview: [
      '图片取色器会把上传图片绘制到画布，在点击位置读取像素的红、绿、蓝通道，并同时给出 HEX、RGB 和 HSL 表示。历史记录便于比较同一图片中的品牌色、背景色和高光区域。',
      '为了适配工作区，超大图片的预览可能按比例缩小，工具会把指针位置映射回画布像素。单点颜色会受到压缩噪声、抗锯齿、半透明叠加和显示缩放影响，建立色板时应在相邻区域多取几个点再判断。',
    ],
    steps: [
      ['上传参考图片', '选择颜色显示正常且尽量保留原始质量的文件。'],
      ['点击目标像素', '在纯色区域中央取样，避开边缘抗锯齿和高光，必要时记录多个邻近点。'],
      ['复制所需格式', '根据 CSS、设计工具或文档规范选择 HEX、RGB 或 HSL。'],
    ],
    scenarios: [
      ['还原界面颜色', '从截图提取按钮、背景和状态色，作为设计复核的起点。'],
      ['整理图片配色', '从摄影或插画中选取一组代表色，用于标题、图表或主题页面。'],
      ["从参考图里还原配色方案", "看到喜欢的界面或海报配色，逐点取色整理成一套色板，用于自己的设计。"],
    ],
    notes: [
      '压缩图片中的相邻像素可能略有差异，单次点击不一定代表设计源色。',
      '取色结果来自文件解码后的像素，不包含印刷 CMYK 或专色信息。',
      '颜色数值本身不能保证文字可读性，前景与背景仍需做对比度检查。',
    ],
    specs: [["输出格式", "HEX、RGB、HSL 三种表示，可直接复制"], ["取色方式", "上传图片后点击画面任意位置读取该像素的颜色"], ["取的是什么", "屏幕显示的像素值，不含色彩管理信息"], ["色彩偏差来源", "有损压缩会改变像素值，广色域图片在 sRGB 下显示也会偏移：取到的值不一定等于设计稿的原始值"], ["典型用途", "从截图或参考图里还原配色，或核对界面实现与设计稿是否一致"], ["后续处理", "需要转成 HSV、CMYK 等其它表示，用颜色转换器"]],
    faq: [{ question: "取到的颜色和设计稿里的原始值对不上？", answer: "很正常。截图经过有损压缩会改变像素值，广色域素材在 sRGB 下显示也会偏移。取色适合还原「看起来是这个颜色」，要拿到精确的设计 token 还是得看设计源文件。" }, { question: "能取网页上任意位置的颜色吗？", answer: "需要先把画面截图下来再上传。工具读取的是你提供的图片文件，不能直接吸取屏幕上其它窗口的像素：那需要操作系统级别的取色器。" }],
    reference: [
      ['pixel sample', '读取某个画布坐标处解码后的颜色通道值。'],
      ['anti-aliasing', '用混合边缘像素让线条看起来平滑的技术，会影响边界取色。'],
    ],
  },
  en: {
    overview: [
      'The image color picker draws an upload to a canvas, reads red, green, and blue channels at a clicked pixel, and reports HEX, RGB, and HSL equivalents. Sample history helps compare brand colors, backgrounds, and highlights within one image.',
      'A large image may be proportionally reduced for the workspace, with pointer positions mapped to canvas pixels. A single sample can be affected by compression noise, anti-aliasing, transparency compositing, and display scaling, so take several nearby samples before defining a palette.',
    ],
    steps: [
      ['Upload a reference image', 'Choose a file that displays correctly and retains as much source quality as possible.'],
      ['Click the target pixel', 'Sample the center of a flat area away from anti-aliased edges and highlights, recording neighbors when needed.'],
      ['Copy the needed notation', 'Use HEX, RGB, or HSL according to the CSS, design application, or documentation convention.'],
    ],
    scenarios: [
      ['Reconstructing interface colors', 'Sample buttons, backgrounds, and status colors from a screenshot as a starting point for design review.'],
      ['Building an image-led palette', 'Select representative colors from a photograph or illustration for headings, charts, or a themed page.'],
      ["Recovering a palette from a reference image", "Sample point by point from an interface or poster you like and assemble the colours into a palette for your own work."],
    ],
    notes: [
      'Neighboring pixels in a compressed image can vary, so one click may not represent the original design color.',
      'Results come from decoded screen pixels and do not contain print CMYK or spot-color information.',
      'A color value alone does not guarantee readable text; foreground-background contrast still needs testing.',
    ],
    specs: [["Output formats", "HEX, RGB and HSL, ready to copy"], ["How to pick", "Upload an image and click anywhere to read that pixel's colour"], ["What you get", "The displayed pixel value, with no colour-management information attached"], ["Sources of drift", "Lossy compression alters pixel values, and wide-gamut images shift when shown in sRGB; the value may not equal the original design token"], ["Typical use", "Recovering a palette from a screenshot or reference, or checking an implementation against a design"], ["Next step", "Use Colour Converter for HSV, CMYK and other representations"]],
    faq: [{ question: "The colour does not match the original design value; why?", answer: "Expected. Lossy compression alters pixel values in a screenshot, and wide-gamut material shifts when displayed in sRGB. Picking recovers \"the colour it looks like\"; exact design tokens have to come from the source file." }, { question: "Can it pick a colour from anywhere on screen?", answer: "You have to screenshot first and upload that. The tool reads the image file you provide and cannot sample pixels from other windows; that needs an OS-level colour picker." }],
    reference: [
      ['pixel sample', 'The decoded color-channel values read at one canvas coordinate.'],
      ['anti-aliasing', 'Blending edge pixels to make lines look smoother, which changes samples near boundaries.'],
    ],
  },
});
