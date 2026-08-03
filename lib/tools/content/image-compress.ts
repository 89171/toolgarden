import type { ToolContent } from './types';

export const imageCompressContent: ToolContent = {
  zh: {
    overview: [
      '图片压缩做的事是重新编码：把原图解码成像素，再按你选的质量参数编码回去。质量参数控制的是编码器允许丢弃多少人眼不敏感的信息：所以「压缩」在这里是有损的，和 ZIP 那种可以完全还原的无损压缩不是一回事。',
      '体积能降多少，主要取决于图片内容而不是原始体积。照片、渐变、噪点多的画面压缩空间很大；纯色块、截图、线稿本来熵就低，再压也降不了多少，反而可能因为有损编码在文字边缘产生可见的杂色。这类图更适合保持 PNG 或改用无损 WebP。',
      '如果目标是网页加载速度，换格式往往比调质量更有效：同等观感下 WebP 通常比 JPG 小三成左右，AVIF 还能再小一截。工具默认保持原格式，需要时可以显式选择输出 WebP。',
    ],
    steps: [
      {
        title: '选择或拖入图片',
        detail: '支持 JPG、PNG、WebP 等常见格式，可以一次处理多张。图片在浏览器内解码，不会上传。',
      },
      {
        title: '调整质量参数',
        detail: '数值越低体积越小、损失越多。照片类素材通常在 70-80 之间就已经看不出差别；含文字或线条的图建议往高调，或者改用无损输出。',
      },
      {
        title: '对照预览确认可接受',
        detail: '压缩前后可以对比查看。请重点看文字边缘、纯色渐变过渡和暗部：有损编码的痕迹最先出现在这三个地方。',
      },
      {
        title: '导出，必要时换格式',
        detail: '确认效果后导出。多张图片可以打包下载。如果体积仍然不够小，把输出格式改成 WebP 通常比继续降质量更划算。',
      },
    ],
    specs: [
      { label: '输入格式', value: 'JPG、PNG、WebP、GIF、BMP、AVIF 等浏览器可解码的格式' },
      { label: '输出格式', value: '默认与输入相同，可显式选择输出 WebP' },
      { label: '压缩类型', value: '有损重新编码（PNG 输出时为无损优化）' },
      { label: '透明通道', value: '输出 PNG 或 WebP 时保留；输出 JPG 时透明区域会被填充' },
      { label: '元数据', value: '重新编码会丢弃 EXIF。需要保留拍摄信息请先用 EXIF 工具单独查看留存' },
      { label: '体积上限', value: '受浏览器可用内存限制，超大图（尤其多张同时处理）可能失败' },
    ],
    scenarios: [
      {
        title: '让网页图片加载更快',
        detail: '相机直出的照片通常远大于页面实际展示所需。先按展示尺寸缩小，再比较 PNG、JPG 或 WebP 的实际导出结果，可以在可接受观感下减少首屏负担。',
      },
      {
        title: '过邮件或表单的体积限制',
        detail: '很多系统限制单个附件几 MB。降质量比裁剪画面更可取：裁剪会丢内容，压缩只丢肉眼难以察觉的细节。',
      },
      {
        title: '批量统一一组素材',
        detail: '多张图片一次处理并用同一组参数，输出的体积和观感是一致的，比逐张在图像软件里调更省事，也不会漏掉其中某一张。',
      },
    ],
    notes: [
      '有损压缩不可逆。压过一次的图片再压第二次，是在已经损失过的数据上继续丢信息，边缘杂色会明显累积。请始终从原图开始处理，而不是从上一次的输出继续。',
      '截图、线稿、含大量文字的图片不适合有损压缩。这类内容的信息集中在边缘，有损编码正好在边缘产生振铃和杂色，往往是体积没降多少、观感却明显变差。它们更适合 PNG 或无损 WebP。',
      '重新编码会丢掉 EXIF。对公开发布来说这是好事（同时去掉了定位和设备信息），但如果你需要留档拍摄参数，请先另存一份原图。',
      '输出 JPG 会丢掉透明通道，原本透明的区域会变成不透明的填充色。需要保留透明背景请输出 PNG 或 WebP。',
    ],
    reference: [
      { term: '有损 / 无损', definition: '有损编码丢弃部分信息以换取体积，不可还原；无损编码只重新组织数据，可完整还原。JPG 通常使用有损编码，PNG 使用无损编码，WebP 与 AVIF 则支持不同编码模式。' },
      { term: '质量参数', definition: '编码器的取舍旋钮，不是画质百分比。同一个数值在不同格式、不同编码器下的实际效果并不相同，所以要靠预览判断而不是记住一个「安全数值」。' },
      { term: '振铃 (ringing)', definition: '有损编码在高对比边缘附近产生的波纹状杂色。这是文字和线稿不适合有损压缩的直接原因。' },
    ],
    faq: [
      {
        question: '压缩后为什么体积几乎没变？',
        answer: '说明这张图的信息熵本来就低：截图、纯色块、线稿都属于这一类，可压缩的冗余不多。这种情况继续降质量只会让画面变差而体积不变，改用无损 WebP 或保持 PNG 更合适。',
      },
      {
        question: '质量调到多少合适？',
        answer: '没有通用数值，取决于内容和用途。照片类素材 70-80 通常已经看不出差别，含文字的图要更高。请以预览对照为准，重点看文字边缘和渐变过渡。',
      },
      {
        question: '压缩会改变图片尺寸吗？',
        answer: '不会。压缩只改变编码方式，像素宽高保持不变。如果你要的是减小画面尺寸，那是图片尺寸修改要做的事：两者可以配合使用，先缩小尺寸再压缩，降体积效果最明显。',
      },
    ],
  },
  en: {
    overview: [
      'Compressing an image means re-encoding it: decode the original to pixels, then encode back out at the quality you choose. That quality setting governs how much visually insignificant information the encoder is allowed to discard; so compression here is lossy, and a different thing from the fully reversible compression in a ZIP file.',
      'How much you save depends far more on content than on the original file size. Photographs, gradients and noisy scenes have a lot of redundancy to give up. Flat colour, screenshots and line art already have low entropy, so they shrink very little; and lossy encoding may add visible artefacts around the text edges. Those images are better left as PNG, or moved to lossless WebP.',
      'When the goal is page load speed, changing format usually beats tuning quality: at matching perceived quality WebP is typically about thirty percent smaller than JPG, and AVIF smaller again. The tool keeps the original format by default and lets you switch the output to WebP when you want that trade.',
    ],
    steps: [
      {
        title: 'Pick or drop in your images',
        detail: 'JPG, PNG, WebP and the other common formats are accepted, several at a time. Decoding happens in the browser; nothing is uploaded.',
      },
      {
        title: 'Set the quality',
        detail: 'Lower means smaller and lossier. Photographic material is usually indistinguishable at 70-80; anything containing text or fine lines wants a higher setting, or a lossless output format instead.',
      },
      {
        title: 'Compare the preview before you commit',
        detail: 'Check the before and after. Look specifically at text edges, smooth gradient transitions and shadow detail; lossy artefacts surface in those three places first.',
      },
      {
        title: 'Export, changing format if needed',
        detail: 'Export once you are happy; multiple images can be downloaded together. If the result is still too large, switching the output to WebP is usually a better trade than pushing quality lower.',
      },
    ],
    specs: [
      { label: 'Input formats', value: 'JPG, PNG, WebP, GIF, BMP, AVIF; anything the browser can decode' },
      { label: 'Output format', value: 'Matches the input by default; WebP can be selected explicitly' },
      { label: 'Compression type', value: 'Lossy re-encode (lossless optimisation when the output is PNG)' },
      { label: 'Transparency', value: 'Preserved for PNG and WebP output; filled in when the output is JPG' },
      { label: 'Metadata', value: 'Re-encoding discards EXIF. Inspect and save it separately with the EXIF tool if you need it' },
      { label: 'Size limit', value: 'Bounded by browser memory; very large images, especially many at once, can fail' },
    ],
    scenarios: [
      {
        title: 'Making page images load faster',
        detail: 'Straight-from-camera photos are usually much larger than a page needs. Resize to the display dimensions first, then compare the real PNG, JPG, or WebP exports to reduce first-paint cost at an acceptable visual quality.',
      },
      {
        title: 'Getting under an email or form size limit',
        detail: 'Plenty of systems cap an attachment at a few megabytes. Lowering quality beats cropping: cropping removes content, while compression only removes detail you were unlikely to notice.',
      },
      {
        title: 'Normalising a set of assets',
        detail: 'Processing several images with one set of parameters gives consistent size and appearance across the set; less work than adjusting each one in an image editor, and nothing gets missed.',
      },
    ],
    notes: [
      'Lossy compression is irreversible. Compressing an already-compressed image discards information on top of information that is already gone, and edge artefacts accumulate visibly. Always start from the original, never from the previous output.',
      'Screenshots, line art and text-heavy images are poor candidates for lossy compression. Their information sits at the edges, which is exactly where lossy encoding produces ringing; usually a small size saving for a clearly worse image. Use PNG or lossless WebP for these.',
      'Re-encoding drops EXIF. That is helpful before publishing, since location and device data go with it, but if you need the capture settings on file, save a copy of the original first.',
      'JPG output has no alpha channel, so transparent areas become an opaque fill. Export PNG or WebP when the transparent background has to survive.',
    ],
    reference: [
      { term: 'Lossy vs lossless', definition: 'Lossy encoding discards information to buy size and cannot be undone; lossless encoding only reorganises data and restores exactly. JPG and AVIF are lossy, PNG is lossless, WebP offers both modes.' },
      { term: 'Quality setting', definition: 'The encoder\'s trade-off dial, not a percentage of image fidelity. The same number behaves differently across formats and encoders, which is why you judge by preview rather than memorising a "safe" value.' },
      { term: 'Ringing', definition: 'The rippling artefact lossy encoders produce near high-contrast edges. It is the direct reason text and line art compress badly.' },
    ],
    faq: [
      {
        question: 'Why did the file size barely change?',
        answer: 'Because that image had little redundancy to begin with; screenshots, flat colour and line art all fall in this group. Pushing quality lower will degrade the picture without shrinking it; lossless WebP or staying on PNG is the better answer.',
      },
      {
        question: 'What quality setting should I use?',
        answer: 'There is no universal number; it depends on content and purpose. Photographic material is usually indistinguishable at 70-80, and anything with text needs more. Judge from the side-by-side preview, watching text edges and gradient transitions.',
      },
      {
        question: 'Does compressing change the image dimensions?',
        answer: 'No. Compression only changes the encoding; pixel width and height stay the same. If you want smaller dimensions that is Image Resize; and combining the two, resizing first and then compressing, gives by far the biggest size reduction.',
      },
    ],
  },
};
