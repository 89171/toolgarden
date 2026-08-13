import { defineToolContent } from './define';

export const audioTtsContent = defineToolContent({
  zh: {
    overview: [
      '文字转语音使用 Kokoro 神经网络模型，在浏览器中把中文或英文文字合成为更自然、稳定的语音。它不再依赖操作系统自带音色，因此不同设备可以获得更一致的效果。',
      '每种语言提供两款经过筛选的音色，并支持调整语速。生成完成后可以直接试听或下载标准 WAV 文件，适合旁白草稿、发音检查、无障碍试听和原型配音。',
    ],
    steps: [
      ['输入并选择语言', '粘贴中文或英文内容，使用标点控制停顿，单次最多输入 2000 个字符。'],
      ['选择音色和语速', '从当前语言的两款音色中选择，并在 0.75x 到 1.5x 之间调整语速。'],
      ['生成、试听并下载', '等待浏览器完成本地合成，试听结果后下载 WAV 文件。'],
    ],
    scenarios: [
      ['制作旁白草稿', '把视频脚本、产品介绍或课程文案快速转换为可下载的参考语音。'],
      ['检查内容可听性', '听取页面文案或提示语，发现拗口句子、错误停顿和数字读法问题。'],
      ['辅助阅读与原型验证', '为阅读辅助、交互演示和语音界面原型提供稳定的中英文语音。'],
    ],
    notes: [
      '首次生成需要下载约 130 MB 的量化模型，后续访问通常会复用浏览器缓存。',
      '模型在浏览器本地运行，生成速度取决于设备性能，较长文本会自动分段合成。',
      '合成语音仍可能读错姓名、缩写和特殊数字，发布前请完整试听。',
      '不要用合成语音冒充真实人物或制作未经授权的欺骗性内容。',
    ],
    specs: [
      ['合成引擎', 'Kokoro 82M 中英双语模型，使用量化 ONNX 版本在浏览器中运行'],
      ['语言支持', '中文和英语'],
      ['可用音色', '中文女声、中文男声、美式女声和英式女声'],
      ['可调参数', '语速 0.75x 到 1.5x'],
      ['输出格式', '24 kHz WAV 音频，可在线试听和下载'],
      ['处理位置', '文字和生成音频保留在当前浏览器，不发送到 ToolGarden 服务器'],
    ],
    faq: [
      { question: '为什么第一次生成比较慢？', answer: '浏览器首次使用时需要下载并初始化约 130 MB 的语音模型。模型被缓存后，再次使用通常只需等待合成过程。' },
      { question: '可以把生成结果保存成文件吗？', answer: '可以。生成完成后可在输出面板试听，并点击下载按钮保存为 WAV 文件。' },
      { question: '为什么只保留中文和英语？', answer: '当前模型针对中文和英语进行了优化。精简语言列表可以保证每个选项都有稳定音色，避免显示设备上质量不一致的系统语音。' },
    ],
    reference: [
      ['Kokoro', '一款轻量的开放权重文本转语音模型，用于把文本转换为自然语音。'],
      ['WAV', '保存未压缩 PCM 音频的通用格式，便于播放、剪辑和继续处理。'],
    ],
  },
  en: {
    overview: [
      'Text to speech uses a Kokoro neural model in the browser to turn Chinese or English text into more natural and consistent speech. It no longer relies on operating-system voices, so results stay more predictable across devices.',
      'Each language has two curated voices plus a speed control. Preview the result or download a standard WAV file for draft narration, pronunciation review, accessible listening, and voice-interface prototypes.',
    ],
    steps: [
      ['Enter text and choose a language', 'Paste Chinese or English text, use punctuation for pauses, and keep each request within 2,000 characters.'],
      ['Choose a voice and speed', 'Pick one of the two voices for the selected language and set a rate from 0.75x to 1.5x.'],
      ['Generate, preview, and download', 'Let the browser synthesize the audio locally, listen to the result, then download the WAV file.'],
    ],
    scenarios: [
      ['Drafting narration', 'Turn a video script, product introduction, or lesson into downloadable reference audio.'],
      ['Checking how content sounds', 'Listen for awkward sentences, misplaced pauses, and incorrect number readings.'],
      ['Accessible reading and prototypes', 'Add stable Chinese or English speech to reading aids, interaction demos, and voice-interface prototypes.'],
    ],
    notes: [
      'The first generation downloads about 130 MB of quantized model data. Later visits can usually reuse the browser cache.',
      'The model runs locally in the browser. Generation speed depends on your device, and longer text is synthesized in chunks.',
      'Synthetic speech can still misread names, abbreviations, and unusual numbers, so review the complete output before publishing.',
      'Do not use synthetic speech to impersonate a real person or create unauthorized deceptive material.',
    ],
    specs: [
      ['Synthesis engine', 'The bilingual Kokoro 82M model, using a quantized ONNX build in the browser'],
      ['Languages', 'Chinese and English'],
      ['Voices', 'Chinese female, Chinese male, US female, and UK female'],
      ['Adjustable', 'Speed from 0.75x to 1.5x'],
      ['Output', '24 kHz WAV audio with in-page preview and download'],
      ['Where it runs', 'Text and generated audio stay in your browser and are not sent to ToolGarden servers'],
    ],
    faq: [
      { question: 'Why is the first generation slower?', answer: 'The browser must download and initialize about 130 MB of voice model data the first time. Once cached, later uses usually only wait for synthesis.' },
      { question: 'Can I save the generated speech?', answer: 'Yes. Preview it in the output panel, then use the download button to save a WAV file.' },
      { question: 'Why are only Chinese and English available?', answer: 'The current model is optimized for Chinese and English. A focused list ensures every choice has a stable voice instead of exposing inconsistent system voices.' },
    ],
    reference: [
      ['Kokoro', 'A lightweight open-weight text-to-speech model that turns text into natural spoken audio.'],
      ['WAV', 'A common uncompressed PCM audio format suited to playback, editing, and further processing.'],
    ],
  },
});
