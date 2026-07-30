import type { BlogArticle } from './articles';

export const audioStemGuideArticles = [
  {
    slug: 'remove-vocals-extract-instrumental-online',
    publishedAt: '2026-07-30',
    updatedAt: '2026-07-30',
    translations: {
      zh: {
        title: '在线提取伴奏教程：如何去除歌曲人声',
        excerpt: '使用浏览器本地音频分轨模型去除歌曲人声，导出鼓、贝斯和其他声部，并重新组合成适合练唱、卡拉 OK 或剪辑的伴奏。',
        metaTitle: '在线提取伴奏教程：免费去除歌曲人声，本地处理不上传',
        metaDescription: '学习如何免费在线去除歌曲人声并提取伴奏。使用浏览器本地 HT-Demucs 模型完成 4 轨分离、试听和 WAV 下载，并了解音质优化与常见问题。',
        readingTime: '约 8 分钟阅读',
        tags: ['提取伴奏', '去除人声', '消除原唱', '卡拉 OK', '音频分轨'],
        relatedTools: [
          {
            label: '音频分轨',
            href: '/audio/split-stems',
            description: '在浏览器本地把歌曲拆成人声、鼓、贝斯和其他轨道，再导出所需伴奏声部。',
          },
          {
            label: '音频剪辑',
            href: '/audio/trim',
            description: '先截取需要练习或制作的歌曲片段，缩短分轨时间并降低内存占用。',
          },
          {
            label: '音频合并',
            href: '/audio/merge',
            description: '把鼓、贝斯和其他轨道按顺序重新合并成一个伴奏文件。',
          },
          {
            label: '音频转 WAV',
            href: '/audio/to-wav',
            description: '将常见音频格式转换成便于剪辑和混音的 WAV 文件。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '想制作卡拉 OK、练唱或给视频保留原曲伴奏，最直接的方法是先把歌曲分成人声和乐器，再去掉人声轨。现在不需要安装大型音频软件，也可以在浏览器中完成这一步。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 使用浏览器本地 HT-Demucs 模型估算歌曲中的不同声部。选择的音频不会上传到远程分轨 API；首次使用需要下载模型，之后的解码、推理和 WAV 导出都在当前设备上完成。',
          },
          {
            type: 'heading',
            level: 2,
            text: '“去除人声”和“提取伴奏”是一回事吗？',
          },
          {
            type: 'paragraph',
            text: '在成品歌曲中，人声、鼓、贝斯和乐器已经混合成同一段波形。所谓去除人声，并不是删除一个现成声道，而是让模型估算出人声轨，再把剩下的乐器声部作为伴奏使用。',
          },
          {
            type: 'paragraph',
            text: '两轨工具通常直接输出“人声”和“伴奏”。四轨工具则输出人声、鼓、贝斯和其他，让你可以单独调整节奏与低频。ToolGarden 还提供六轨模型，能够额外分离吉他和钢琴。',
          },
          {
            type: 'heading',
            level: 2,
            text: '提取伴奏应该选择 4 轨还是 6 轨？',
          },
          {
            type: 'table',
            headers: ['模式', '输出', '适合用途', '建议'],
            rows: [
              [
                '4 轨',
                '人声、鼓、贝斯、其他',
                '去原唱、卡拉 OK、普通练唱',
                '优先选择，伴奏结构更集中',
              ],
              [
                '6 轨',
                '人声、鼓、贝斯、吉他、钢琴、其他',
                '还要单独控制吉他或钢琴',
                '仅在需要独立乐器时选择',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: '只想获得完整伴奏时，建议使用 4 轨。把鼓、贝斯和其他三条轨道一起保留即可。六轨并不会自动让伴奏更干净，它只是把“其他”进一步拆成吉他、钢琴和剩余声部。',
          },
          {
            type: 'heading',
            level: 2,
            text: '在线去除歌曲人声的操作步骤',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '准备一份音质较好的歌曲文件，优先使用 WAV、FLAC 或高码率 MP3。',
              '打开音频分轨工具，点击上传区域或把歌曲拖入页面。',
              '选择 4 轨模型，并勾选鼓、贝斯和其他；需要先检查人声残留时，也可以同时勾选人声。',
              '点击开始分轨，保持页面打开，等待模型加载和音频处理完成。',
              '分别试听鼓、贝斯和其他轨道，确认没有明显断裂或异常。',
              '下载三条 WAV 轨道，在音频编辑器中对齐叠加；也可以下载全部轨道留作后续调整。',
            ],
          },
          {
            type: 'callout',
            title: '免费在线提取伴奏',
            text: '歌曲在浏览器本地完成分轨，不按音频分钟收费，可导出独立 WAV 轨道。',
            href: '/audio/split-stems',
            linkLabel: '打开音频分轨工具',
          },
          {
            type: 'heading',
            level: 2,
            text: '如何把分离结果组合成完整伴奏',
          },
          {
            type: 'paragraph',
            text: '四轨模式下，伴奏由鼓、贝斯和其他组成。这三条 WAV 的起点、时长和采样率一致，只要在编辑器或数字音频工作站中从同一时间位置叠加，就能大致还原去掉主唱后的歌曲。',
          },
          {
            type: 'list',
            items: [
              '鼓轨负责节拍和大部分瞬态，不建议默认大幅降低。',
              '贝斯轨负责低频重量；如果伴奏听起来单薄，先检查贝斯是否被静音。',
              '其他轨通常包含吉他、钢琴、合成器、弦乐和部分和声。',
              '不要对三条轨道分别做时间拉伸，否则重新组合时可能产生错位。',
              '合并前留出峰值空间，避免三条轨道相加后削波失真。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '怎样让提取的伴奏更干净？',
          },
          {
            type: 'list',
            items: [
              '使用未经过多次转码的音源。低码率 MP3 的高频伪影会被模型一起放大。',
              '先用 30–60 秒副歌测试，因为这里通常同时包含主唱、鼓、贝斯和密集乐器。',
              '只做伴奏时优先使用 4 轨，减少在相近乐器之间继续拆分造成的误差。',
              '保留轻微人声残留通常比过度降噪更自然；强力处理可能同时损伤军鼓、吉他和高频。',
              '在耳机和音箱上都试听，检查低频是否完整、中央人声是否明显残留。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '为什么伴奏里还能听到一点原唱？',
          },
          {
            type: 'paragraph',
            text: '模型处理的是已经混合好的歌曲，而不是录音棚原始工程。主唱混响会扩散到左右声道，和声可能与合成器共享频率，失真吉他也可能接近人声谐波，因此少量残留很难完全避免。',
          },
          {
            type: 'paragraph',
            text: '如果残留只在尾音和混响中出现，通常不会明显影响练唱。若整段主唱仍很清楚，可以换用更高质量音源、比较 4 轨与 6 轨结果，或截取问题片段重新测试。',
          },
          {
            type: 'heading',
            level: 2,
            text: '常见问题与解决方法',
          },
          {
            type: 'table',
            headers: ['问题', '可能原因', '解决方法'],
            rows: [
              ['伴奏声音很空', '贝斯或其他轨没有加入', '确认鼓、贝斯和其他三轨都已叠加'],
              ['仍有明显主唱', '混响、和声或频率高度重叠', '换高质量音源并比较两种模型'],
              ['出现节奏重影', '合并时轨道起点没有对齐', '所有 WAV 从同一个时间点开始'],
              ['有爆音或失真', '多条轨道相加后超过峰值', '降低各轨音量后再导出'],
              ['模型无法加载', '浏览器可用内存不足', '关闭其他标签页，改用桌面 Chrome 或 Edge'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '伴奏可以直接发布或商用吗？',
          },
          {
            type: 'paragraph',
            text: '去掉人声不会改变原录音和词曲的版权归属。自己练习、公开演出、上传视频、发行翻唱或商业使用可能适用不同授权规则。请只处理自己拥有、已获授权或法律允许使用的歌曲，并在发布前确认录音与词曲许可。',
          },
          {
            type: 'heading',
            level: 2,
            text: '总结',
          },
          {
            type: 'paragraph',
            text: '在线提取伴奏的关键是先选择合适的分轨模式。普通去人声优先使用 4 轨，保留鼓、贝斯和其他并从同一起点叠加。高质量音源、正确对齐和合理的音质预期，比盲目增加轨道数更重要。',
          },
        ],
        faq: [
          {
            question: '免费提取伴奏时歌曲会上传吗？',
            answer: '使用 ToolGarden 时不会。模型会下载到浏览器，歌曲解码、分轨和 WAV 编码都在设备本地完成。首次加载模型产生网络请求，不代表歌曲被上传。',
          },
          {
            question: '去除人声应该下载哪些轨道？',
            answer: '使用 4 轨模型时下载鼓、贝斯和其他，并把三条轨道从同一时间点叠加。人声轨可以保留用于检查，也可以不下载。',
          },
          {
            question: '为什么去人声后背景和声也消失了？',
            answer: '模型可能把主唱与背景和声一起识别为人声。成品混音没有明确标签，是否保留和声取决于音色、声像、混响和模型判断。',
          },
          {
            question: 'MP3 可以提取伴奏吗？',
            answer: '可以，但音质取决于源文件。高码率 MP3 通常足够练习；需要进一步混音时，优先使用 WAV、FLAC 或来源可靠的高质量文件。',
          },
          {
            question: '手机可以在线去除人声吗？',
            answer: '部分高端手机可能可以，但大型本地模型需要较多内存。桌面版 Chrome 或 Edge 通常更稳定，也更适合处理完整歌曲。',
          },
        ],
      },
      en: {
        title: 'How to Remove Vocals and Extract an Instrumental Online',
        excerpt: 'Use browser-local stem separation to remove vocals, export drums, bass, and other parts, and recombine them into an instrumental for practice, karaoke, or editing.',
        metaTitle: 'Remove Vocals Online: Extract an Instrumental Locally for Free',
        metaDescription: 'Learn how to remove vocals and extract an instrumental online for free with browser-local HT-Demucs separation, four-stem WAV exports, quality tips, and troubleshooting.',
        readingTime: 'About 8 minutes',
        tags: ['instrumental extractor', 'remove vocals', 'karaoke maker', 'vocal remover', 'stem separation'],
        relatedTools: [
          {
            label: 'Audio stem splitter',
            href: '/audio/split-stems',
            description: 'Split a song into vocals, drums, bass, and other locally, then export the parts needed for an instrumental.',
          },
          {
            label: 'Audio trimmer',
            href: '/audio/trim',
            description: 'Trim the section you need before separation to reduce processing time and memory use.',
          },
          {
            label: 'Audio merger',
            href: '/audio/merge',
            description: 'Combine drums, bass, and other tracks into a single instrumental file.',
          },
          {
            label: 'Audio to WAV',
            href: '/audio/to-wav',
            description: 'Convert common audio formats to WAV for editing and mixing.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'The most direct way to make a karaoke track, practice a vocal, or keep the backing music for a video is to separate a song into vocals and instruments, then leave out the vocal stem. You can now do that in a browser without installing a large audio application.',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden uses a browser-local HT-Demucs model to estimate the sources in a song. The selected audio is not sent to a remote separation API. The first use downloads the model, while decoding, inference, and WAV export run on the current device.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Are removing vocals and extracting an instrumental the same thing?',
          },
          {
            type: 'paragraph',
            text: 'Vocals, drums, bass, and instruments in a finished song have already been mixed into the same waveform. Removing vocals does not delete an existing channel. A model estimates a vocal stem, and the remaining sources are used as the instrumental.',
          },
          {
            type: 'paragraph',
            text: 'A two-stem tool normally outputs vocal and instrumental directly. A four-stem tool outputs vocals, drums, bass, and other, giving you separate control over rhythm and low end. ToolGarden also has a six-stem model that adds guitar and piano.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Should you use four stems or six stems?',
          },
          {
            type: 'table',
            headers: ['Mode', 'Output', 'Best use', 'Recommendation'],
            rows: [
              [
                'Four stems',
                'Vocals, drums, bass, other',
                'Vocal removal, karaoke, singing practice',
                'Use this first for a cohesive instrumental',
              ],
              [
                'Six stems',
                'Vocals, drums, bass, guitar, piano, other',
                'Independent guitar or piano control',
                'Choose only when those instruments are needed separately',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: 'For a complete backing track, start with four stems and keep drums, bass, and other. Six stems do not automatically produce cleaner audio. They divide the same mix into more categories by pulling guitar and piano out of other.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Steps to remove vocals online',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Prepare the best available source, ideally WAV, FLAC, or a high-bitrate MP3.',
              'Open the stem splitter and click the upload area or drag the song onto the page.',
              'Choose the four-stem model and select drums, bass, and other. Select vocals too if you want to inspect the separation.',
              'Start separation, keep the page open, and wait for model loading and audio processing.',
              'Preview drums, bass, and other to check for obvious gaps or artifacts.',
              'Download the three WAV files and align them at the same start time in an audio editor, or download all stems for later adjustment.',
            ],
          },
          {
            type: 'callout',
            title: 'Extract an instrumental for free',
            text: 'Split locally in the browser with no per-minute charge and export independent WAV stems.',
            href: '/audio/split-stems',
            linkLabel: 'Open the stem splitter',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to recombine the result into a full instrumental',
          },
          {
            type: 'paragraph',
            text: 'In four-stem mode, the instrumental consists of drums, bass, and other. Those WAV files share the same start point, duration, and sample rate. Align them at the same timeline position in an editor or DAW to reconstruct the song without the lead vocal.',
          },
          {
            type: 'list',
            items: [
              'Drums carry the beat and most transients, so do not reduce them heavily by default.',
              'Bass provides low-end weight; check that it is active when the instrumental sounds thin.',
              'Other normally contains guitars, piano, synths, strings, and sometimes backing vocals.',
              'Do not time-stretch the stems independently or they may drift out of alignment.',
              'Leave headroom before export so summing several stems does not clip.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to get a cleaner instrumental',
          },
          {
            type: 'list',
            items: [
              'Use a source that has not been transcoded repeatedly. Low-bitrate MP3 artifacts can be amplified by separation.',
              'Test a 30–60 second chorus first because it usually contains vocals, drums, bass, and a dense arrangement.',
              'Prefer four stems for a backing track to avoid unnecessary splitting between similar instruments.',
              'A little vocal residue can sound more natural than aggressive cleanup that damages snare, guitar, and high frequencies.',
              'Listen on headphones and speakers to check both centered vocal residue and low-end continuity.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Why can you still hear some vocals?',
          },
          {
            type: 'paragraph',
            text: 'The model works from a finished mix rather than original studio sessions. Vocal reverb spreads across the stereo field, harmonies may share frequencies with synths, and distorted guitars can resemble vocal harmonics, so small amounts of bleed are difficult to eliminate.',
          },
          {
            type: 'paragraph',
            text: 'Residue limited to reverb tails normally does not disrupt singing practice. If the entire lead remains obvious, try a higher-quality source, compare four- and six-stem output, or retest the specific section.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Common problems and fixes',
          },
          {
            type: 'table',
            headers: ['Problem', 'Likely cause', 'Fix'],
            rows: [
              ['The instrumental sounds hollow', 'Bass or other was omitted', 'Combine drums, bass, and other'],
              ['Lead vocal remains obvious', 'Reverb, harmonies, or overlapping frequencies', 'Use a better source and compare models'],
              ['The rhythm echoes', 'Stem start points are misaligned', 'Start every WAV at the same timeline position'],
              ['The export clips', 'Summed stems exceed peak level', 'Lower stem gain before export'],
              ['The model will not load', 'Not enough available browser memory', 'Close other tabs and use desktop Chrome or Edge'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Can you publish or monetize the instrumental?',
          },
          {
            type: 'paragraph',
            text: 'Removing a vocal does not change ownership of the recording or composition. Private practice, public performance, video uploads, cover releases, and commercial use can require different permissions. Process and publish only audio you own, are authorized to use, or may lawfully use.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Key takeaways',
          },
          {
            type: 'paragraph',
            text: 'A good online instrumental workflow starts with the right separation mode. Use four stems for normal vocal removal, keep drums, bass, and other, and align them from the same start point. A clean source, correct alignment, and realistic expectations matter more than simply requesting more stems.',
          },
        ],
        faq: [
          {
            question: 'Is the song uploaded when I extract an instrumental for free?',
            answer: 'Not with ToolGarden. The model downloads into the browser, while song decoding, separation, and WAV encoding run locally. Network traffic for the first model download does not mean the song is uploaded.',
          },
          {
            question: 'Which stems should I download to remove vocals?',
            answer: 'In four-stem mode, download drums, bass, and other, then align all three at the same start time. Keep the vocal stem only if you want to inspect the result.',
          },
          {
            question: 'Why did backing vocals disappear too?',
            answer: 'The model may classify lead and backing vocals together. A finished mix has no source labels, so whether harmonies remain depends on timbre, stereo position, reverb, and model estimation.',
          },
          {
            question: 'Can I extract an instrumental from MP3?',
            answer: 'Yes. A high-bitrate MP3 is often sufficient for practice, while WAV, FLAC, or another reliable high-quality source is preferable for further mixing.',
          },
          {
            question: 'Can I remove vocals on a phone?',
            answer: 'Some high-end phones may succeed, but a large local model requires substantial memory. Desktop Chrome or Edge is normally more reliable for complete songs.',
          },
        ],
      },
    },
  },
  {
    slug: 'extract-vocals-make-acapella-online',
    publishedAt: '2026-07-30',
    updatedAt: '2026-07-30',
    translations: {
      zh: {
        title: '在线提取人声教程：如何制作 Acapella',
        excerpt: '从歌曲中分离主唱并导出纯人声 WAV，了解 Acapella 提取步骤、4 轨与 6 轨选择、音质判断、后期清理和版权边界。',
        metaTitle: '在线提取人声教程：免费制作 Acapella，本地处理不上传',
        metaDescription: '学习如何从歌曲中免费在线提取人声并制作 Acapella。浏览器本地运行 HT-Demucs，支持人声试听与 WAV 导出，并提供串音、混响和音质优化建议。',
        readingTime: '约 8 分钟阅读',
        tags: ['提取人声', 'Acapella', '纯人声', '人声分离', '音频分轨'],
        relatedTools: [
          {
            label: '音频分轨',
            href: '/audio/split-stems',
            description: '在浏览器本地分离人声并导出 WAV，不把歌曲上传到远程分轨 API。',
          },
          {
            label: '音频剪辑',
            href: '/audio/trim',
            description: '截取需要的人声片段，去掉过长前奏、间奏和尾奏。',
          },
          {
            label: '修改音量',
            href: '/audio/volume',
            description: '调整提取后人声的整体音量，便于试听或导入后续工程。',
          },
          {
            label: '去除静音',
            href: '/audio/remove-silence',
            description: '自动裁掉人声文件前后的静音区域，减少无用空白。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'Acapella 通常指没有伴奏的独立人声。拿不到录音棚原始人声轨时，可以使用音乐源分离模型，从已经混合完成的歌曲中估算主唱并导出为新的 WAV 文件。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 的音频分轨在浏览器本地运行 HT-Demucs ONNX 模型。歌曲不需要上传到远程分轨服务，适合处理未发布 demo、翻唱练习或其他不希望离开设备的录音。',
          },
          {
            type: 'heading',
            level: 2,
            text: '提取的人声等于录音棚原始 Acapella 吗？',
          },
          {
            type: 'paragraph',
            text: '不等于。原始 Acapella 来自歌曲混音前的独立人声录音，而在线提取结果是模型从成品混音中反推得到的估算。它可能保留原曲混响、延迟和部分和声，也可能混入军鼓、吉他或合成器的少量声音。',
          },
          {
            type: 'paragraph',
            text: '用于练唱、扒词、转写、参考混音或非关键性的创意草稿时，模型提取通常已经足够。需要正式发行、精确混音或高质量采样时，应优先向权利人获取官方 stems 或无伴奏版本。',
          },
          {
            type: 'heading',
            level: 2,
            text: '制作 Acapella 选择哪个模型？',
          },
          {
            type: 'table',
            headers: ['选择', '优点', '可能问题', '适合情况'],
            rows: [
              [
                '4 轨模型',
                '人声目标集中，速度和内存压力相对可控',
                '吉他、钢琴都归入其他',
                '绝大多数人声提取任务',
              ],
              [
                '6 轨模型',
                '可把吉他和钢琴单独分开',
                '更多分类不保证人声更干净',
                '4 轨中乐器残留明显时用于对比',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: '建议先用 4 轨，只勾选人声即可。若人声里有明显钢琴或吉他残留，再用同一个短片段测试 6 轨。不要根据轨道数猜测结果，要通过实际试听比较。',
          },
          {
            type: 'heading',
            level: 2,
            text: '在线提取纯人声的操作步骤',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '准备音质较好的歌曲，避免使用录屏、外放重录或经过多次压缩的文件。',
              '打开音频分轨工具并选择歌曲。',
              '选择 4 轨模型，只勾选“人声”；需要比较其他声部时再增加输出。',
              '开始分轨并保持页面打开，等待模型加载、推理和 WAV 编码完成。',
              '试听人声轨的主歌、副歌、齿音、尾音和无歌词片段，判断残留是否可接受。',
              '下载人声 WAV；需要更短片段时再进行剪辑和静音裁切。',
            ],
          },
          {
            type: 'callout',
            title: '免费在线提取人声',
            text: '在浏览器本地分离并下载人声 WAV，适合练唱、转写、分析和创作草稿。',
            href: '/audio/split-stems',
            linkLabel: '开始制作 Acapella',
          },
          {
            type: 'heading',
            level: 2,
            text: '怎样判断人声轨是否可用？',
          },
          {
            type: 'list',
            items: [
              '清晰度：歌词辅音和齿音是否仍然可辨，不应被过度削弱。',
              '连续性：长音和句尾是否自然延续，不能频繁忽大忽小。',
              '串音：鼓点、贝斯和主旋律是否会干扰最终用途。',
              '混响：原曲空间感是否可以接受，还是必须使用后期去混响。',
              '重组检查：把所有 stems 重新叠加，确认整体能大致还原原曲。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '为什么纯人声里还有鼓点和乐器？',
          },
          {
            type: 'paragraph',
            text: '军鼓、镲片、失真吉他和合成器都可能覆盖人声频率。主唱通常还带有混响与延迟，这些效果会扩散到整个立体声空间。当模型无法确定一段声音属于人声还是乐器时，就可能把它的一部分分到人声轨。',
          },
          {
            type: 'paragraph',
            text: '残留在无歌词空隙中最容易听见，但放进新混音后不一定明显。先按照最终用途试听，不要为了得到完全静音的空隙而过度处理整条人声。',
          },
          {
            type: 'heading',
            level: 2,
            text: '提取后的人声如何进一步整理',
          },
          {
            type: 'list',
            items: [
              '先剪掉不需要的前奏、间奏和尾奏，减少空白与残留乐器。',
              '使用自动化或包络降低无人声片段，而不是对整条轨道强力降噪。',
              '通过温和高通处理低频鼓和轰鸣，但注意不要削薄低沉人声。',
              '必要时使用专业去混响工具；模型无法恢复从未存在于混音中的干声。',
              '开始新的混音前先预留峰值空间，避免压缩和限制器放大残留。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '哪些音源更容易得到干净 Acapella？',
          },
          {
            type: 'table',
            headers: ['音源特点', '通常结果', '原因'],
            rows: [
              ['主唱居中、伴奏较疏', '较容易分离', '人声位置和频谱特征更明确'],
              ['强混响、合唱与和声很多', '容易保留尾音或混在一起', '声音边界在时间与空间上重叠'],
              ['失真吉他和密集合成器', '更容易出现串音', '谐波与人声频率接近'],
              ['低码率或多次转码', '容易出现金属感', '压缩伪影被模型当成声音特征'],
              ['现场录音或外放重录', '分离难度较高', '环境反射和观众声混入所有声部'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Acapella 常见用途',
          },
          {
            type: 'list',
            items: [
              '练习咬字、呼吸、和声与旋律细节。',
              '辅助歌词转写、语言学习或语音分析。',
              '制作 remix、mashup 和编曲草稿。',
              '检查混音中的齿音、混响和人声动态。',
              '为合法授权的内容制作替代伴奏或演示版本。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '使用提取人声时要注意版权',
          },
          {
            type: 'paragraph',
            text: '提取出来的人声仍然属于原录音的一部分。即使技术上可以下载，也不代表可以公开发布、训练模型、出售采样或用于商业作品。发布 remix、mashup 或视频前，应确认录音、词曲和表演者相关授权。',
          },
          {
            type: 'heading',
            level: 2,
            text: '总结',
          },
          {
            type: 'paragraph',
            text: '制作 Acapella 时先用高质量音源和 4 轨模型，只导出人声，再根据齿音、连续性、串音和混响判断是否可用。提取结果是对成品混音的估算，不是录音棚原始干声；先满足实际用途，再进行温和后期整理。',
          },
        ],
        faq: [
          {
            question: '在线提取人声需要上传歌曲吗？',
            answer: 'ToolGarden 不需要把歌曲上传到远程分轨 API。模型下载到浏览器后，音频解码、人声分离和 WAV 导出都在本地设备完成。',
          },
          {
            question: '提取 Acapella 应该用 4 轨还是 6 轨？',
            answer: '先用 4 轨。它适合绝大多数人声提取任务。只有人声中出现明显吉他或钢琴残留时，才值得用同一个片段比较 6 轨模型。',
          },
          {
            question: '为什么提取的人声带有混响？',
            answer: '混响是原歌曲人声效果的一部分，已经与伴奏混合。分轨模型通常会把部分混响归到人声，但无法自动恢复录音棚里完全干燥的原始录音。',
          },
          {
            question: '可以从现场录音中提取人声吗？',
            answer: '可以尝试，但通常比录音室版本困难。场地反射、观众声、扩声系统和多个声源会同时混入所有声部，导致更多串音。',
          },
          {
            question: '提取的人声可以用于 Remix 吗？',
            answer: '技术上可以导入 remix 工程，但公开发布或商业使用通常需要录音、词曲和表演相关授权。请先确认自己拥有相应权利。',
          },
        ],
      },
      en: {
        title: 'How to Extract Vocals and Make an Acapella Online',
        excerpt: 'Separate lead vocals from a song and export a vocal WAV while learning how to choose a model, judge quality, reduce bleed, clean the result, and respect usage rights.',
        metaTitle: 'Extract Vocals Online: Make an Acapella Locally for Free',
        metaDescription: 'Learn how to extract vocals and make an acapella online for free with browser-local HT-Demucs, vocal WAV export, model selection, bleed diagnosis, and cleanup tips.',
        readingTime: 'About 8 minutes',
        tags: ['vocal extractor', 'acapella maker', 'isolate vocals', 'vocal separation', 'stem separation'],
        relatedTools: [
          {
            label: 'Audio stem splitter',
            href: '/audio/split-stems',
            description: 'Separate and export a vocal WAV locally without sending the song to a remote separation API.',
          },
          {
            label: 'Audio trimmer',
            href: '/audio/trim',
            description: 'Keep the vocal section you need and remove long intros, breaks, or outros.',
          },
          {
            label: 'Change volume',
            href: '/audio/volume',
            description: 'Adjust the overall level of an extracted vocal before auditioning or importing it.',
          },
          {
            label: 'Remove silence',
            href: '/audio/remove-silence',
            description: 'Trim silent space from the beginning and end of a vocal file.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'An acapella is generally a vocal without its backing track. When the original studio vocal is unavailable, a music source separation model can estimate the lead vocal from a finished mix and export it as a new WAV file.',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden runs an HT-Demucs ONNX model locally in the browser. The song does not need to be uploaded to a remote separation service, which suits unreleased demos, practice recordings, and other audio you would rather keep on the device.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Is an extracted vocal the same as the original studio acapella?',
          },
          {
            type: 'paragraph',
            text: 'No. An original acapella comes from an isolated vocal recording before the song was mixed. An online extraction is an estimate reconstructed from the finished mix. It can retain reverb, delay, and backing vocals, while allowing small amounts of drums, guitar, or synth to bleed through.',
          },
          {
            type: 'paragraph',
            text: 'An extracted vocal is often sufficient for singing practice, lyric transcription, mix reference, or a non-critical creative draft. For an official release, precise mixing, or high-quality sampling, obtain authorized studio stems when possible.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Which model should you use for an acapella?',
          },
          {
            type: 'table',
            headers: ['Choice', 'Advantage', 'Possible issue', 'Best fit'],
            rows: [
              [
                'Four-stem model',
                'Focused vocal target with manageable speed and memory use',
                'Guitar and piano stay inside other',
                'Most vocal extraction tasks',
              ],
              [
                'Six-stem model',
                'Separates guitar and piano explicitly',
                'More classes do not guarantee a cleaner vocal',
                'A comparison when four-stem output has obvious instrument bleed',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: 'Start with four stems and select only vocals. If the vocal contains obvious piano or guitar residue, test the same short section with six stems. Listen to the output instead of assuming that a larger stem count is better.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Steps to extract a vocal online',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Use the best available source and avoid screen recordings, speaker re-recordings, or repeatedly compressed files.',
              'Open the stem splitter and choose the song.',
              'Select the four-stem model and vocals only. Add other outputs only when you need a comparison.',
              'Start separation and keep the page open while the model loads, runs inference, and encodes WAV.',
              'Preview verses, choruses, sibilance, phrase endings, and sections without lyrics to judge residue.',
              'Download the vocal WAV, then trim or remove silent regions if you need a shorter result.',
            ],
          },
          {
            type: 'callout',
            title: 'Extract vocals for free',
            text: 'Separate and download a vocal WAV locally for practice, transcription, analysis, or a creative draft.',
            href: '/audio/split-stems',
            linkLabel: 'Start making an acapella',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to judge whether the vocal is usable',
          },
          {
            type: 'list',
            items: [
              'Clarity: consonants and sibilance should remain intelligible rather than heavily filtered.',
              'Continuity: sustained notes and phrase endings should not pump or disappear.',
              'Bleed: decide whether drums, bass, or melody interfere with the intended use.',
              'Reverb: determine whether the original ambience is acceptable or requires specialist dereverberation.',
              'Reconstruction: recombine all stems and check that they broadly reproduce the original song.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Why are drums and instruments still audible?',
          },
          {
            type: 'paragraph',
            text: 'Snare, cymbals, distorted guitar, and synths can all occupy vocal frequencies. Lead vocals also carry reverb and delay across the stereo field. When the model cannot confidently decide whether a sound belongs to the singer or an instrument, part of it may enter the vocal stem.',
          },
          {
            type: 'paragraph',
            text: 'Bleed is easiest to notice in gaps between lyrics, but it may be masked in a new arrangement. Evaluate it in the final context before applying aggressive processing across the entire vocal.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to clean an extracted vocal',
          },
          {
            type: 'list',
            items: [
              'Trim unused intros, breaks, and outros to remove empty areas containing instrument residue.',
              'Use volume automation or an envelope to lower gaps rather than applying heavy denoising everywhere.',
              'Use a gentle high-pass filter for low drum and rumble, while preserving the body of a low voice.',
              'Use specialist dereverberation only when necessary; a model cannot recreate a dry take that is absent from the mix.',
              'Leave headroom before a new mix so compression and limiting do not amplify remaining artifacts.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Which sources produce a cleaner acapella?',
          },
          {
            type: 'table',
            headers: ['Source characteristic', 'Typical result', 'Why'],
            rows: [
              ['Centered vocal and sparse backing', 'Easier separation', 'Position and spectral identity are clearer'],
              ['Heavy reverb, choirs, and harmonies', 'Tails or voices may remain blended', 'Sources overlap in time and space'],
              ['Distorted guitars and dense synths', 'More instrument bleed', 'Harmonics overlap vocal frequencies'],
              ['Low bitrate or repeated transcodes', 'More metallic artifacts', 'Compression artifacts resemble source details'],
              ['Live or speaker re-recording', 'Harder separation', 'Room reflections and crowd noise enter every source'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Common uses for an extracted acapella',
          },
          {
            type: 'list',
            items: [
              'Study diction, breathing, harmony, and melodic detail.',
              'Assist lyric transcription, language learning, or speech analysis.',
              'Create a remix, mashup, or arrangement draft.',
              'Inspect vocal sibilance, reverb, and dynamics in a mix.',
              'Prepare an alternate backing or demo when the material is properly authorized.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Copyright still applies to an extracted vocal',
          },
          {
            type: 'paragraph',
            text: 'An extracted vocal remains part of the original recording. The ability to download it does not grant permission to publish it, train a model, sell a sample, or use it commercially. Confirm recording, composition, and performance rights before releasing a remix, mashup, or video.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Key takeaways',
          },
          {
            type: 'paragraph',
            text: 'Start an acapella extraction with a high-quality source and the four-stem model, export only vocals, and judge clarity, continuity, bleed, and reverb. The result estimates a vocal from a finished mix rather than recovering the dry studio take, so clean it gently according to its actual use.',
          },
        ],
        faq: [
          {
            question: 'Do I need to upload a song to extract vocals online?',
            answer: 'Not with ToolGarden. The model downloads into the browser, and audio decoding, vocal separation, and WAV export run locally on the device.',
          },
          {
            question: 'Should I use four stems or six stems for an acapella?',
            answer: 'Start with four stems. It fits most vocal extraction tasks. Compare six stems on the same section only when guitar or piano bleed is obvious.',
          },
          {
            question: 'Why does the extracted vocal contain reverb?',
            answer: 'Reverb is already part of the vocal in the finished song. Separation normally assigns some of it to the vocal but cannot automatically recover the completely dry studio recording.',
          },
          {
            question: 'Can I extract vocals from a live recording?',
            answer: 'You can try, but live material is harder. Room reflections, audience sound, the PA, and multiple sources spread into every part of the recording and create more bleed.',
          },
          {
            question: 'Can I use the extracted vocal in a remix?',
            answer: 'It can be imported into a remix project, but public or commercial release normally requires rights covering the recording, composition, and performance.',
          },
        ],
      },
    },
  },
  {
    slug: 'why-separated-audio-stems-have-noise-and-bleed',
    publishedAt: '2026-07-30',
    updatedAt: '2026-07-30',
    translations: {
      zh: {
        title: '为什么音频分轨后还有杂音和串音？',
        excerpt: '了解分轨结果中的人声残留、乐器串音、金属感、水声、断裂和低频缺失从何而来，以及如何通过音源、模型选择和后期处理改善。',
        metaTitle: '音频分轨为什么有杂音和串音？原因、判断与改善方法',
        metaDescription: '解释 AI 音频分轨中的串音、金属感、水声、抽吸、瞬态损失和混响残留，分析音源与模型原因，并提供 4 轨、6 轨选择和改善步骤。',
        readingTime: '约 9 分钟阅读',
        tags: ['分轨杂音', '音频串音', '人声残留', '分轨音质', '音频分轨'],
        relatedTools: [
          {
            label: '音频分轨',
            href: '/audio/split-stems',
            description: '用同一段歌曲比较 4 轨与 6 轨结果，判断哪种模型更适合目标声部。',
          },
          {
            label: '音频剪辑',
            href: '/audio/trim',
            description: '截取最容易出现串音的 30–60 秒片段，用于快速对比和排查。',
          },
          {
            label: '音频转 WAV',
            href: '/audio/to-wav',
            description: '减少后续有损转码，使用 WAV 保存需要继续处理的分轨结果。',
          },
          {
            label: '修改音量',
            href: '/audio/volume',
            description: '统一试听音量，避免把响度差异误判为音质差异。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '音频分轨完成后，单独听人声、鼓或伴奏时，常会发现轻微杂音、乐器残留、金属感或声音忽大忽小。这通常不是文件损坏，而是音乐源分离从成品混音中估算声部时产生的边界误差。',
          },
          {
            type: 'paragraph',
            text: '理解这些瑕疵的来源，可以帮助你判断是音源、模型、轨道选择还是后期流程的问题，也能避免为了追求“完全干净”而把真正需要的声音一起破坏。',
          },
          {
            type: 'heading',
            level: 2,
            text: '音频分轨不是解压原始多轨',
          },
          {
            type: 'paragraph',
            text: '歌曲发布前，多个录音轨会经过均衡、压缩、混响、声像和母带处理，最终混合成左右两个声道。分轨模型看到的只有这两个声道，没有录音棚工程中的轨道标签。',
          },
          {
            type: 'paragraph',
            text: '模型会根据频谱、节奏、音色、声像和上下文预测每个声音属于哪个声部。不同声部共享相同特征时，边界就会变得模糊：一部分声音可能分错轨，一部分可能同时出现在多个轨道，另一部分则可能被削弱。',
          },
          {
            type: 'heading',
            level: 2,
            text: '常见分轨瑕疵分别是什么',
          },
          {
            type: 'table',
            headers: ['听感', '含义', '常见位置'],
            rows: [
              ['串音或残留', '其他声部进入目标轨', '人声中的军鼓、伴奏中的尾音'],
              ['金属感或水声', '频谱被不连续地保留或移除', '镲片、齿音、混响尾部'],
              ['抽吸感', '声音能量随模型判断上下波动', '长音、和声、持续铺底'],
              ['断裂或缺字', '目标声音的一部分被分到其他轨', '辅音、弱唱、句尾'],
              ['低频空洞', '贝斯与底鼓归属不稳定', '副歌低频、鼓组瞬态'],
              ['空间残影', '混响与干声被分到不同轨', '主唱尾音、宽立体声效果'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '原因一：不同声部占据相同频率',
          },
          {
            type: 'paragraph',
            text: '人声不是固定的一条频率线。它的基频、谐波、齿音和气声会与吉他、钢琴、合成器、军鼓和镲片重叠。模型必须依靠时间变化和上下文判断，而不能简单地用均衡器切出一段频率。',
          },
          {
            type: 'heading',
            level: 2,
            text: '原因二：混响、延迟和立体声扩展模糊边界',
          },
          {
            type: 'paragraph',
            text: '干声可能位于中央，但它的混响会铺满左右声道并延续到下一拍。模型可能把干声归到人声，把一部分尾响归到其他；单独试听时就会出现伴奏中的“人声幽灵”或人声轨中的空间残影。',
          },
          {
            type: 'heading',
            level: 2,
            text: '原因三：失真、压缩和母带处理改变音色',
          },
          {
            type: 'paragraph',
            text: '失真会增加新的谐波，强压缩会让鼓、贝斯和人声一起起伏，限幅还会把多个瞬态压在同一时刻。这些处理让原本不同的声部变得更相似，增加模型判断难度。',
          },
          {
            type: 'heading',
            level: 2,
            text: '原因四：输入文件已经带有压缩伪影',
          },
          {
            type: 'paragraph',
            text: '低码率 MP3、网络视频音轨、录屏和多次转码文件会丢失细节，并在高频产生预回声或颗粒感。分轨模型可能把这些伪影当成乐器的一部分，输出后金属感会更加明显。',
          },
          {
            type: 'heading',
            level: 2,
            text: '原因五：轨道数量与歌曲结构不匹配',
          },
          {
            type: 'paragraph',
            text: '4 轨模型把除人声、鼓和贝斯之外的声音放进其他，适合普通伴奏和人声提取。6 轨模型还要区分吉他与钢琴；当歌曲中这些乐器层叠或音色不典型时，更多分类可能带来新的边界误差。',
          },
          {
            type: 'table',
            headers: ['目标', '先试模式', '原因'],
            rows: [
              ['提取完整伴奏', '4 轨', '鼓、贝斯和其他可以直接组合'],
              ['提取人声', '4 轨', '人声目标更集中，额外分类通常没有必要'],
              ['单独提取吉他', '6 轨', '需要明确的吉他输出'],
              ['单独提取钢琴', '6 轨', '需要明确的钢琴输出'],
              ['不确定', '同一短片段都测试', '根据实际串音和连续性选择'],
            ],
          },
          {
            type: 'callout',
            title: '用同一片段比较两种模型',
            text: '先截取 30–60 秒复杂段落，分别运行 4 轨和 6 轨，再按目标声部试听。',
            href: '/audio/split-stems',
            linkLabel: '打开音频分轨工具',
          },
          {
            type: 'heading',
            level: 2,
            text: '如何判断问题出在哪里',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '先听原文件。如果原曲已经有爆音、低码率颗粒或现场混响，分轨无法凭空恢复细节。',
              '单独听目标轨，标记串音最明显的时间点和声音类型。',
              '再听与它互补的轨道，检查缺失的声音是否被分到了那里。',
              '把所有 stems 以相同音量重新叠加，确认是否能大致还原原曲。',
              '用同一个短片段比较 4 轨与 6 轨，不要用不同歌曲或不同音量判断。',
              '如果所有模型都在同一位置失败，问题通常来自原混音中的高度重叠。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '改善杂音和串音的实用方法',
          },
          {
            type: 'list',
            items: [
              '换用 WAV、FLAC 或来源可靠的高码率文件，避免从低质量视频再次转码。',
              '根据用途选择最少但够用的轨道数，普通伴奏和人声优先 4 轨。',
              '先处理短片段，确认模型和音源组合有效后再运行完整歌曲。',
              '剪掉目标轨中无人声或无目标乐器的空白段，减少暴露出的残留。',
              '使用音量自动化、温和均衡或包络处理问题片段，不要整轨强力降噪。',
              '在新混音中用其他声音自然遮盖轻微残留，而不是要求单轨绝对无声。',
              '保存 WAV 中间文件，避免每一步都重新编码为有损格式。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '哪些问题无法靠重新分轨解决？',
          },
          {
            type: 'paragraph',
            text: '如果原文件本身削波、严重压缩、缺失高频，或者来自带环境回声的外放重录，模型无法恢复从未保留下来的细节。类似地，主唱与合唱完全重叠、吉他与合成器使用相同音色时，也不存在唯一正确的分配答案。',
          },
          {
            type: 'paragraph',
            text: '这类情况下，应换更好的源文件、寻找官方伴奏或 stems，或者调整最终目标。例如练习用伴奏可以容忍轻微尾音，而正式发行需要获得原始多轨和授权。',
          },
          {
            type: 'heading',
            level: 2,
            text: '本地处理会让音质变差吗？',
          },
          {
            type: 'paragraph',
            text: '本地或云端描述的是计算发生在哪里，并不直接决定音质。真正影响结果的是模型、权重、输入预处理、分段方式和输出编码。浏览器本地模型可以避免上传音频，但仍会受到设备内存和运行性能限制。',
          },
          {
            type: 'heading',
            level: 2,
            text: '总结',
          },
          {
            type: 'paragraph',
            text: '分轨后的杂音和串音通常来自声部频率重叠、混响扩散、失真压缩、低质量音源和模型分类边界。使用更好的输入、选择够用的轨道数、以相同短片段比较模型，并进行温和的局部后期，通常比反复追求“完全无残留”更有效。',
          },
        ],
        faq: [
          {
            question: '分轨后有杂音是否说明模型运行失败？',
            answer: '不一定。只要轨道能正常生成且整体可重组，轻微串音、金属感或混响残留通常是源分离误差，而不是文件损坏或模型崩溃。',
          },
          {
            question: '为什么人声轨里最容易听到军鼓和镲片？',
            answer: '军鼓瞬态和镲片高频会覆盖人声辅音、齿音所在区域，失真和混响又会扩大重叠，因此模型更容易把少量鼓声分到人声。',
          },
          {
            question: '选择 6 轨能减少串音吗？',
            answer: '不一定。需要吉他或钢琴时 6 轨更有用，但更多分类也会产生新的边界误差。普通人声或伴奏任务通常先试 4 轨。',
          },
          {
            question: '把 MP3 转成 WAV 后再分轨会更好吗？',
            answer: '单纯转换格式不会恢复 MP3 已经丢失的细节。WAV 能避免后续继续有损压缩，但最好从一开始就使用更高质量的源文件。',
          },
          {
            question: '怎样快速比较两种分轨模型？',
            answer: '从同一首歌截取 30–60 秒复杂片段，使用相同输出和试听音量分别运行两种模型，比较目标轨串音、连续性以及全部轨道重组后的还原程度。',
          },
        ],
      },
      en: {
        title: 'Why Do Separated Audio Stems Still Have Noise and Bleed?',
        excerpt: 'Learn where vocal residue, instrument bleed, metallic artifacts, watery sound, dropouts, and missing bass come from, and how source quality, model choice, and cleanup can help.',
        metaTitle: 'Why Audio Stems Have Noise and Bleed: Causes and Fixes',
        metaDescription: 'Understand bleed, metallic and watery artifacts, pumping, transient loss, and reverb residue in AI stem separation, with source, model, four-stem, six-stem, and cleanup guidance.',
        readingTime: 'About 9 minutes',
        tags: ['stem bleed', 'separation artifacts', 'vocal residue', 'stem quality', 'stem separation'],
        relatedTools: [
          {
            label: 'Audio stem splitter',
            href: '/audio/split-stems',
            description: 'Compare four- and six-stem results on the same song section to find the better fit.',
          },
          {
            label: 'Audio trimmer',
            href: '/audio/trim',
            description: 'Cut a 30–60 second section where bleed is obvious for faster comparison and diagnosis.',
          },
          {
            label: 'Audio to WAV',
            href: '/audio/to-wav',
            description: 'Avoid further lossy encoding by keeping intermediate stem work in WAV.',
          },
          {
            label: 'Change volume',
            href: '/audio/volume',
            description: 'Match listening levels so a loudness difference is not mistaken for a quality difference.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'After stem separation, a soloed vocal, drum, or instrumental track may contain faint noise, another instrument, metallic tones, or level changes. This usually does not mean the file is damaged. It is a boundary error created while estimating sources from a finished mix.',
          },
          {
            type: 'paragraph',
            text: 'Understanding these artifacts helps identify whether the source, model, stem choice, or cleanup workflow is responsible—and prevents aggressive processing from destroying the sound you actually need.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Stem separation does not unpack original multitracks',
          },
          {
            type: 'paragraph',
            text: 'Before release, recordings are processed with EQ, compression, reverb, panning, and mastering, then mixed into two channels. A separation model sees only those channels, not the labeled tracks from the studio session.',
          },
          {
            type: 'paragraph',
            text: 'The model predicts sources from spectrum, rhythm, timbre, stereo position, and context. When different sources share those traits, their boundaries become ambiguous: sound can enter the wrong stem, appear in several stems, or be partially suppressed.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Common stem artifacts and what they mean',
          },
          {
            type: 'table',
            headers: ['What you hear', 'Meaning', 'Common example'],
            rows: [
              ['Bleed or residue', 'Another source enters the target stem', 'Snare in vocals or a vocal tail in the backing'],
              ['Metallic or watery sound', 'Spectrum is retained or removed unevenly', 'Cymbals, sibilance, and reverb tails'],
              ['Pumping', 'Energy rises and falls with model confidence', 'Sustained notes, choirs, and pads'],
              ['Dropouts or missing syllables', 'Part of the target enters another stem', 'Consonants, quiet vocals, phrase endings'],
              ['Hollow low end', 'Bass and kick assignment is unstable', 'Chorus bass or drum transients'],
              ['Spatial ghosting', 'Reverb and dry sound enter different stems', 'Vocal tails and wide stereo effects'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Cause 1: different sources occupy the same frequencies',
          },
          {
            type: 'paragraph',
            text: 'A vocal is not a single frequency line. Its fundamentals, harmonics, sibilance, and breath overlap guitar, piano, synth, snare, and cymbals. The model must use changes over time and context rather than cutting a simple EQ band.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Cause 2: reverb, delay, and stereo width blur boundaries',
          },
          {
            type: 'paragraph',
            text: 'A dry vocal may sit in the center while its reverb fills both channels and continues into the next beat. The model can assign dry sound to vocals and part of the tail to other, creating a vocal ghost in the backing or spatial residue in the vocal stem.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Cause 3: distortion, compression, and mastering reshape timbre',
          },
          {
            type: 'paragraph',
            text: 'Distortion adds harmonics, heavy compression makes drums, bass, and vocals move together, and limiting forces several transients into the same moment. These processes make otherwise distinct sources more alike and harder to classify.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Cause 4: the input already contains compression artifacts',
          },
          {
            type: 'paragraph',
            text: 'Low-bitrate MP3, video audio, screen recordings, and repeated transcodes lose detail and add pre-echo or grain in the high frequencies. A model can treat those artifacts as part of an instrument, making metallic sound more obvious after separation.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Cause 5: the stem count does not match the song',
          },
          {
            type: 'paragraph',
            text: 'A four-stem model places everything except vocals, drums, and bass into other, which works well for instrumentals and vocal extraction. A six-stem model must also identify guitar and piano. When those instruments are layered or atypical, extra categories can introduce new boundary errors.',
          },
          {
            type: 'table',
            headers: ['Goal', 'Try first', 'Reason'],
            rows: [
              ['Extract a full instrumental', 'Four stems', 'Drums, bass, and other combine directly'],
              ['Extract vocals', 'Four stems', 'The vocal target is focused and extra classes are unnecessary'],
              ['Isolate guitar', 'Six stems', 'A dedicated guitar output is required'],
              ['Isolate piano', 'Six stems', 'A dedicated piano output is required'],
              ['Not sure', 'Test both on one short clip', 'Choose by actual bleed and continuity'],
            ],
          },
          {
            type: 'callout',
            title: 'Compare both models on the same clip',
            text: 'Use a complex 30–60 second section, run four and six stems, then audition the source you need.',
            href: '/audio/split-stems',
            linkLabel: 'Open the stem splitter',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to diagnose the problem',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Listen to the original first. Separation cannot restore clipping, low-bitrate grain, or room reverb already present.',
              'Solo the target stem and mark the time and type of the most obvious bleed.',
              'Listen to the complementary stems and check whether the missing sound moved into one of them.',
              'Recombine every stem at equal gain and confirm that they broadly reconstruct the original.',
              'Compare four and six stems on the same short section at matched listening levels.',
              'When every model fails at the same moment, the original mix probably contains strong source overlap.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Practical ways to reduce noise and bleed',
          },
          {
            type: 'list',
            items: [
              'Use WAV, FLAC, or a reliable high-bitrate source instead of transcoding low-quality video audio.',
              'Choose the smallest stem count that meets the goal; start with four for a normal instrumental or vocal.',
              'Test a short clip before committing time and memory to the whole song.',
              'Trim empty areas where the target is absent and only residue is exposed.',
              'Use volume automation, gentle EQ, or envelopes on problem sections instead of heavy full-track denoising.',
              'Mask faint residue naturally in the new arrangement instead of demanding absolute silence from a soloed stem.',
              'Keep intermediate work in WAV to avoid another generation of lossy encoding.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Which problems cannot be fixed by separating again?',
          },
          {
            type: 'paragraph',
            text: 'If the source is clipped, heavily compressed, missing high frequencies, or re-recorded through speakers in a reverberant room, the model cannot restore detail that was never preserved. There is also no uniquely correct assignment when lead and choir fully overlap or guitar and synth use the same timbre.',
          },
          {
            type: 'paragraph',
            text: 'Use a better source, look for official instrumentals or stems, or adjust the target. A practice track can tolerate a faint vocal tail, while a commercial release should begin with authorized original multitracks.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Does local processing reduce audio quality?',
          },
          {
            type: 'paragraph',
            text: 'Local and cloud describe where computation happens, not quality by themselves. The model, weights, input preparation, chunking, and output encoding determine the result. Browser-local inference avoids uploading audio, although it still depends on available device memory and performance.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Key takeaways',
          },
          {
            type: 'paragraph',
            text: 'Noise and bleed usually come from overlapping frequencies, distributed reverb, distortion and compression, weak input quality, and model class boundaries. Better input, the smallest useful stem count, matched short-clip comparisons, and gentle local cleanup are more effective than repeatedly chasing a perfectly silent soloed track.',
          },
        ],
        faq: [
          {
            question: 'Does noise after separation mean the model failed?',
            answer: 'Not necessarily. If stems are generated normally and can be recombined, light bleed, metallic sound, or reverb residue is usually a separation artifact rather than a damaged file or crashed model.',
          },
          {
            question: 'Why are snare and cymbals common in vocal stems?',
            answer: 'Snare transients and cymbal highs overlap consonants and sibilance. Distortion and reverb widen that overlap, so small amounts of percussion are more likely to enter the vocal estimate.',
          },
          {
            question: 'Will six stems reduce bleed?',
            answer: 'Not always. Six stems help when guitar or piano is required separately, but extra classes create new boundaries. Start with four stems for a normal vocal or instrumental.',
          },
          {
            question: 'Will converting MP3 to WAV improve separation?',
            answer: 'Changing the container cannot restore detail already lost from MP3. WAV avoids another lossy generation later, but the best improvement is to start with a higher-quality source.',
          },
          {
            question: 'What is the fastest way to compare two models?',
            answer: 'Cut the same complex 30–60 second section, run both models with the same outputs, match playback levels, and compare target bleed, continuity, and reconstruction from all stems.',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
