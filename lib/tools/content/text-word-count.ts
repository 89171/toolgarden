import { defineToolContent } from './define';

export const textWordCountContent = defineToolContent({
  zh: {
    overview: ['字数统计会分析输入文本的字符、词语、句子、段落和阅读长度等指标，帮助控制文章、摘要、表单和演讲稿的篇幅。中文通常以字符为主要计量，英文等空格分词语言更常按单词统计，两种结果不能直接等同。', '不同平台对空格、标点、emoji、连字符词和换行的计数规则可能不同。本工具适合写作阶段估算与比较，投稿、考试或广告平台有硬性上限时，应以对方最终计数器为准。'],
    steps: [['粘贴完整文本', '保留真实段落和标点，避免漏掉标题、脚注或引用。'], ['查看相关指标', '中文关注字符数，英文关注词数，同时检查段落和预计阅读时间。'], ['按目标精简', '优先删除重复和空泛表达，再在目标平台复核最终长度。']],
    example: {
      caption: "同一段中英混排文本的各项指标。中文按字计、英文按词计的差别在这里一目了然。",
      inputLabel: "输入文本",
      input: "你好，world。这是一行测试文本。",
      outputLabel: "统计结果",
      output: "字符数（含空格）   16\n字符数（不含空格）  15\n词数              6\n行数              1\n句子数            2\n字节大小（UTF-8）  38 B",
      language: "text",
    },
    scenarios: [['控制投稿篇幅', '检查摘要、简介和文章是否接近字数要求。'], ['估算朗读时长', '用词数和阅读速度粗略安排演讲、视频旁白或课程节奏。'], ["核对翻译稿的膨胀率", "中译英通常会显著变长，对照字符数和词数能提前判断译文是否超出版面限制。"]],
    notes: ['阅读时间是按平均速度估算，技术内容、外语和停顿会明显改变实际时长。', 'emoji 和组合字符在视觉上可能是一个符号，但底层由多个码点组成。', '不同分词规则会对中文词数和带连字符英文词产生不同结果。'],
    specs: [["统计项", "字符数、词数、行数、段落数、句子数、字节大小"], ["中英文差异", "中文按字符计，英文按空格分词计。同一段中英混排文本，两个数字会相差很大"], ["字节大小", "按 UTF-8 计算。一个中文字符通常占 3 字节，因此字节数远大于字符数"], ["是否含空格", "同时给出含空格与不含空格的字符数：投稿要求指的通常是其中特定一项"], ["句子判定", "按句末标点切分。缩写、小数点和省略号可能造成误判"], ["处理位置", "全部在浏览器内完成，文本不上传，可直接处理未公开稿件"]],
    faq: [{ question: "为什么我的字数和 Word 统计的不一样？", answer: "口径不同。Word 的中文字数统计包含标点、按「字符（不计空格）」计，而不同平台对标点、数字、空格是否计入的规则各不相同。这里同时给出多个指标，就是为了让你能对上目标平台的那一种。" }, { question: "投稿说的「3000 字」指哪个数字？", answer: "中文语境下通常指字符数（含标点），英文语境下通常指词数。规则不明确时以投稿方的说明为准，或者取最保守的那个指标：按较大的数字控制篇幅不会出错。" }],
    reference: [['character', '文本中的字符计量单位，具体实现可能按 Unicode 码点或序列统计。'], ['word segmentation', '根据语言规则把连续文本划分为词语的过程。']],
  },
  en: {
    overview: ['Word count analyzes characters, words, sentences, paragraphs, and estimated reading length for articles, summaries, forms, and scripts. Chinese is commonly constrained by characters, while space-delimited languages such as English are usually measured by words, and the two totals are not interchangeable.', 'Platforms differ in treatment of spaces, punctuation, emoji, hyphenated terms, and line breaks. Use this tool for drafting and comparison, but follow the destination counter for a strict submission, exam, or advertising limit.'],
    steps: [['Paste the complete text', 'Retain real paragraphs and punctuation and include headings, notes, and quotations.'], ['Read the relevant metrics', 'Use character count for character-based limits and words for English, along with paragraphs and reading time.'], ['Edit toward the target', 'Remove repetition and empty phrasing first, then recheck in the destination platform.']],
    example: {
      caption: "Every metric for one mixed-script line. The gap between counting CJK by character and Latin by word is visible at a glance.",
      inputLabel: "Input text",
      input: "Hello 世界。This is a test line.",
      outputLabel: "Counts",
      output: "Characters (with spaces)     30\nCharacters (no spaces)      25\nWords                        7\nLines                        1\nSentences                    2\nByte size (UTF-8)           34 B",
      language: "text",
    },
    scenarios: [['Meeting a submission length', 'Check whether an abstract, biography, or article is near its limit.'], ['Estimating spoken duration', 'Use words and an average pace to plan a talk, video narration, or lesson.'], ["Checking translation expansion", "Translations often run substantially longer than the source, and comparing character and word counts flags a layout overflow before it happens."]],
    notes: ['Reading time is an average; technical content, a second language, and deliberate pauses change real duration.', 'One visible emoji or composed character can contain multiple Unicode code points.', 'Segmentation rules produce different counts for Chinese words and hyphenated English terms.'],
    specs: [["What it counts", "Characters, words, lines, paragraphs, sentences and byte size"], ["CJK vs Latin", "CJK is counted per character, Latin per whitespace-delimited word. Mixed text produces two very different numbers"], ["Byte size", "Computed as UTF-8, where a CJK character usually takes 3 bytes; so bytes far exceed characters"], ["With and without spaces", "Both character counts are shown, since a submission limit normally means one specific one"], ["Sentence detection", "Split on terminal punctuation; abbreviations, decimals and ellipses can throw it off"], ["Where it runs", "Entirely in the browser; nothing is uploaded, so unpublished drafts are safe"]],
    faq: [{ question: "Why does my count differ from Word's?", answer: "Different definitions. Word counts CJK characters including punctuation under \"characters (no spaces)\", and platforms disagree on whether punctuation, digits and spaces count at all. Several figures are shown here precisely so you can match whichever one your target uses." }, { question: "A submission says \"3000 words\"; which number is that?", answer: "In a CJK context it usually means characters including punctuation; in English it usually means words. When the rule is unstated, follow the publisher's guidance, or work to the more conservative figure; staying under the larger number is never wrong." }],
    reference: [['character', 'A text-counting unit that an implementation may measure by Unicode code points or sequences.'], ['word segmentation', 'The language-dependent process of dividing continuous text into words.']],
  },
});
