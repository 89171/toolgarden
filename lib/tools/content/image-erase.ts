import { defineToolContent } from './define';

export const imageEraseContent = defineToolContent({
  zh: {
    overview: [
      '擦除工具用画笔标出要去掉的物体，模型只重建被涂到的像素，其余部分逐位保留原图。和框选式去水印相比，涂抹能贴着不规则轮廓走，因此路人、电线、地面杂物这类形状不规则的目标不必连带一大片背景一起重算。',
      '重建结果是模型根据周围像素的推测，不是被遮挡内容的还原。涂抹范围应当刚好盖住物体及其投影和边缘接触部分：漏涂会留下残影，涂太大则会把可用的邻近信息一起抹掉，反而更难猜对。',
    ],
    steps: [
      ['涂抹要去掉的物体', '调整画笔粗细，沿物体轮廓涂抹，连同边缘的阴影和倒影一起盖住；涂错可以撤销上一笔。'],
      ['执行擦除', '点击擦除后模型在本地重建涂抹区域，首次使用需要下载模型资源。'],
      ['检查接缝并导出', '放大查看重建区域与周围的纹理是否连续，必要时补涂残留部分重跑，再选择导出格式。'],
    ],
    scenarios: [
      ['去掉背景里的路人', '风景或建筑照片中误入画面的行人、车辆，沿轮廓涂抹后由模型补回背景。'],
      ['清理地面和墙面杂物', '拍摄场地遗留的插排、垃圾桶、临时标识，擦掉后得到干净的场景底图。'],
      ['移除画面里的电线和杆子', '天空背景规律，横跨画面的电线与立杆用细画笔涂抹后通常能补得比较自然。'],
    ],
    notes: [
      '涂抹区域越大，模型可参考的邻近信息越少，结果越容易出现模糊或重复纹理。',
      '人脸、文字、规则几何线条被遮挡后无法准确重建，输出只是看起来合理的合成内容。',
      '对同一处反复擦除会累积模糊，建议从原图重新涂抹一次，而不是在已擦除的结果上继续处理。',
    ],
    specs: [
      ['操作方式', '用画笔涂抹要去掉的物体，模型只重建被涂到的像素'],
      ['修复模型', 'MI-GAN 512 与 LaMa 两个 ONNX 模型，在浏览器本地推理'],
      ['输出', 'JPG、PNG 或 WebP，尺寸与原图一致'],
      ['效果较好', '背景规律、纹理连续，且物体占画面比例较小的情况'],
      ['效果不佳', '物体压在人脸、文字、密集纹理上，或涂抹区域占画面很大比例'],
      ['失败处理', '两个模型都无法在当前设备运行时直接报错，不会输出未经 AI 修复的图片'],
    ],
    faq: [
      {
        question: '和图片去水印有什么区别？',
        answer: '底层用的是同两个修复模型，区别在怎么指定范围。去水印是拖一个矩形选区，适合规整的水印块；擦除是用画笔涂抹，适合路人、电线这类不规则轮廓，能少动周围的像素。',
      },
      {
        question: '擦除后原来的位置变模糊了？',
        answer: '说明涂抹区域相对可参考的背景太大了。模型只能从涂抹区周围推测内容，范围越大推测越没有依据。可以分几次擦除较小的区域，或者先擦最显眼的部分。',
      },
    ],
    reference: [
      ['inpainting', '根据缺失区域周围的结构和纹理估计该区域像素的图像修复过程。'],
      ['mask', '标记哪些像素需要重建的二值图像，这里由画笔涂抹生成。'],
    ],
  },
  en: {
    overview: [
      'Paint over an object and the model rebuilds only the pixels you marked, leaving the rest of the image bit-for-bit identical. Compared with a rectangular watermark selection, a brush follows an irregular outline, so a passer-by, a cable, or clutter on the ground does not force a large block of usable background through the model as well.',
      'The rebuilt area is the model inferring from surrounding pixels, not a recovery of what was hidden. Cover the object plus its shadow and the edge where it meets the background: missing a sliver leaves a ghost, while painting far too wide removes the neighbouring evidence the fill depends on.',
    ],
    steps: [
      ['Mark the area', 'Set the brush size and paint along the object, including its shadow or reflection at the edges. Undo removes the last stroke if you overshoot.'],
      ['Erase object', 'Run the erase and the model rebuilds the painted region locally. The first run downloads the model files.'],
      ['Check the seam and export', 'Zoom into the rebuilt region to confirm texture continuity, repaint any remaining fragment and rerun, then choose an output format.'],
    ],
    scenarios: [
      ['Removing a stranger from the background', 'A pedestrian or car that wandered into a landscape or architecture shot is painted along its outline and the background is filled back in.'],
      ['Clearing clutter from floors and walls', 'Power strips, bins, or temporary signage left in a location shot come out, leaving a clean plate of the scene.'],
      ['Taking out cables and poles', 'Against a regular sky, overhead lines and posts crossing the frame usually fill in convincingly with a thin brush.'],
    ],
    notes: [
      'The larger the painted region, the less neighbouring evidence the model has, and the more likely the fill turns blurry or repeats texture.',
      'Faces, text, and regular geometric lines cannot be reconstructed accurately once covered; the output is plausible-looking synthesis only.',
      'Erasing the same spot repeatedly accumulates blur. Restart from the source and repaint rather than processing an already-erased result again.',
    ],
    specs: [
      ['How it works', 'Paint over the object with a brush and the model rebuilds only the painted pixels'],
      ['Repair models', 'MI-GAN 512 and LaMa, two ONNX models running locally in the browser'],
      ['Output', 'JPG, PNG or WebP at the source dimensions'],
      ['Works well on', 'Regular, continuous backgrounds where the object covers a small share of the frame'],
      ['Works poorly on', 'Objects over faces, text or dense texture, and painted regions covering much of the frame'],
      ['On failure', 'If neither model can run on the device the tool reports an error instead of returning an image that skipped AI repair'],
    ],
    faq: [
      {
        question: 'How is this different from the watermark remover?',
        answer: 'Both use the same two repair models; they differ in how you specify the region. The watermark remover drags a rectangle, which suits tidy watermark blocks. The eraser paints, which suits irregular outlines like people or cables and leaves more of the surrounding pixels untouched.',
      },
      {
        question: 'The erased spot came out blurry; why?',
        answer: 'The painted region was too large relative to the background the model can reference. It can only infer content from around the region, so a wider area means a weaker basis for the guess. Erase smaller regions in several passes, or start with the most noticeable part.',
      },
    ],
    reference: [
      ['inpainting', 'An image-repair process that estimates the pixels of a missing region from surrounding structure and texture.'],
      ['mask', 'A binary image marking which pixels must be rebuilt, produced here by the brush strokes.'],
    ],
  },
});
