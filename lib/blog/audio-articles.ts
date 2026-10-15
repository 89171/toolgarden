import type { BlogArticle } from './articles';

export const audioBlogArticles = [
  {
    slug: 'split-song-into-vocals-instrumental-stems-browser',
    publishedAt: '2026-07-30',
    updatedAt: '2026-07-30',
    translations: {
      zh: {
        title: '在线音频分轨怎么用？本地分离人声、伴奏、鼓、贝斯、吉他和钢琴',
        excerpt: '了解音频分轨的原理、4 轨与 6 轨模型的区别，并在浏览器本地把歌曲拆分成人声、鼓、贝斯、吉他、钢琴和其他声部。',
        metaTitle: '在线音频分轨教程：分离人声、伴奏、鼓、贝斯、吉他和钢琴',
        metaDescription: '使用浏览器本地 HT-Demucs 模型进行在线音频分轨，了解 4 轨和 6 轨区别、操作步骤、隐私方式、内存要求、常见失败原因与音质限制。',
        readingTime: '约 9 分钟阅读',
        tags: ['音频分轨', '人声分离', '伴奏提取', 'HT-Demucs', '本地处理'],
        relatedTools: [
          {
            label: '音频分轨',
            href: '/audio/split-stems',
            description: '在浏览器本地把歌曲拆分成人声、鼓、贝斯、吉他、钢琴和其他轨道。',
          },
          {
            label: '音频剪辑',
            href: '/audio/trim',
            description: '先截取需要分析或练习的片段，可缩短分轨时间并降低内存占用。',
          },
          {
            label: '音频转 WAV',
            href: '/audio/to-wav',
            description: '把常见音频格式转换为 WAV，方便导入编辑器、播放器或数字音频工作站。',
          },
          {
            label: '音频转文字',
            href: '/audio/to-text',
            description: '在浏览器本地加载开源语音模型，把访谈、录音和语音内容转写为文本。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '想从一首歌里提取纯人声、制作伴奏，或者单独听鼓、贝斯、吉他和钢琴，不一定要安装大型音频软件。浏览器中的音乐源分离模型可以直接读取歌曲，估算各个声部，并把结果导出为独立 WAV 文件。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 的音频分轨工具使用开源 HT-Demucs ONNX 模型。音频解码、模型推理、分段拼接和 WAV 编码都在浏览器本地完成；首次使用需要下载模型资源，但选择的歌曲不会作为分轨任务上传到服务器。',
          },
          {
            type: 'heading',
            level: 2,
            text: '什么是音频分轨？',
          },
          {
            type: 'paragraph',
            text: '普通歌曲通常已经混合成左右两个声道。人声、鼓、贝斯和其他乐器共享同一段波形，因此不能像解压 ZIP 一样恢复录音棚里的原始多轨。音频分轨模型会根据频谱、节奏、音色和上下文估算每个声部在混音中的贡献，生成新的分离轨道。',
          },
          {
            type: 'paragraph',
            text: '分轨结果适合练习、卡拉 OK 伴奏、混音参考、扒谱和内容分析，但不等同于原始工程文件。混响、失真、合唱、叠录和频率重叠都会让不同轨道之间留下少量串音。',
          },
          {
            type: 'heading',
            level: 2,
            text: '4 轨和 6 轨模型应该怎么选？',
          },
          {
            type: 'table',
            headers: ['模型', '输出轨道', '更适合', '主要取舍'],
            rows: [
              [
                '4 轨 HT-Demucs',
                '人声、鼓、贝斯、其他',
                '提取人声、制作伴奏、节奏练习',
                '人声和“其他”通常更集中，但没有独立吉他和钢琴',
              ],
              [
                '6 轨 HT-Demucs',
                '人声、鼓、贝斯、其他、吉他、钢琴',
                '吉他或钢琴练习、六声部分析',
                '多两条独立轨道，但“其他”会被进一步拆分，可能显得更弱',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: '只需要消除人声或提取伴奏时，优先选择 4 轨模型。只有确实需要单独拿到吉他或钢琴时，再选择 6 轨模型。输出轨道越多并不代表总体音质一定更好，它只是把同一段混音划分得更细。',
          },
          {
            type: 'heading',
            level: 2,
            text: '如何在浏览器里完成一次音频分轨',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '打开音频分轨工具，点击上传区域或把歌曲拖入页面。',
              '在 4 轨和 6 轨模型之间选择。只做伴奏或人声时建议使用 4 轨。',
              '勾选需要导出的轨道。减少不需要的长音频输出可以降低结果占用的内存。',
              '点击“开始分轨”，保持页面打开，等待解码、模型下载、模型加载、分轨和 WAV 编码完成。',
              '试听结果，分别下载需要的轨道，或把全部结果打包为 ZIP 下载。',
            ],
          },
          {
            type: 'callout',
            title: '开始本地音频分轨',
            text: '上传歌曲，选择 4 轨或 6 轨模型，并在浏览器本地导出独立 WAV 轨道。',
            href: '/audio/split-stems',
            linkLabel: '打开音频分轨工具',
          },
          {
            type: 'heading',
            level: 2,
            text: '为什么第一次使用会比较慢？',
          },
          {
            type: 'paragraph',
            text: '分轨页面本身很小，但神经网络模型较大：当前 4 轨模型约 158 MiB，6 轨模型约 130 MiB。模型只在实际开始分轨时下载，校验后存入浏览器缓存；同一浏览器后续使用通常可以复用缓存。',
          },
          {
            type: 'paragraph',
            text: '下载完成后，浏览器还要创建 ONNX Runtime 会话并加载模型参数，这一步可能需要 10–15 秒。模型文件采用较小的 FP16 权重存储，但推理时仍需要约 1 GB 以上的运行内存。文件大小较小不等于运行时内存也同样小。',
          },
          {
            type: 'list',
            items: [
              '优先使用最新版桌面 Chrome 或 Edge。',
              '处理前关闭占用大量内存的标签页和应用。',
              '长歌曲可以先用音频剪辑工具截取需要的部分。',
              '不要在模型加载或分轨过程中刷新、休眠或关闭页面。',
              '移动端浏览器通常有更严格的内存限制，不适合运行这类模型。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '“本地处理”是否意味着完全不联网？',
          },
          {
            type: 'paragraph',
            text: '不是。第一次使用需要联网下载页面代码、ONNX Runtime 和模型文件。这里的隐私边界是：网站从公开资源地址下载运行程序和模型，但用户选择的音频文件留在浏览器中，不会被发送给远程分轨 API。',
          },
          {
            type: 'paragraph',
            text: '在浏览器 Network 面板中看到模型、WASM 或 Worker 请求是正常的。验证隐私时，应检查请求体里是否出现所选歌曲，而不能把所有网络请求都理解为音频上传。模型准备好并缓存后，后续使用所需的网络流量通常会明显减少。',
          },
          {
            type: 'heading',
            level: 2,
            text: '如何判断分轨结果是否可用？',
          },
          {
            type: 'paragraph',
            text: '不要只试听单独一条轨道。把人声、鼓、贝斯和其他轨道重新叠加，检查它们是否能大致还原原曲；再分别关注最重要的目标轨道。轻微金属感或残留通常无法完全避免，真正需要判断的是这些瑕疵会不会影响你的使用目的。',
          },
          {
            type: 'list',
            items: [
              '制作卡拉 OK：重点检查伴奏里是否残留明显主唱，以及人声移除后是否出现空洞。',
              '乐器练习：重点检查节拍、主旋律和目标乐器是否连续，不必追求录音棚级隔离。',
              '混音或采样：在耳机和音箱上试听，并检查相位、低频和瞬态伪影。',
              '转写或分析：优先选择包含目标语音或乐器且串音最少的轨道。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '常见失败原因与处理方法',
          },
          {
            type: 'table',
            headers: ['现象', '常见原因', '建议'],
            rows: [
              [
                '模型下载失败',
                '网络无法访问模型资源、连接中断或缓存不完整',
                '检查网络后重试；必要时清除已缓存模型',
              ],
              [
                '模型长时间加载',
                '浏览器正在校验模型并创建本地推理会话',
                '等待 10–15 秒，避免重复点击或刷新',
              ],
              [
                '模型加载失败',
                '浏览器或设备可用内存不足',
                '关闭其他标签页，改用桌面 Chrome/Edge 后重试',
              ],
              [
                '分轨中途失败',
                '音频过长、选择轨道过多或推理阶段内存不足',
                '缩短音频，减少输出轨道，再重新处理',
              ],
              [
                '轨道有串音',
                '原混音中多个声部频率、混响或失真高度重叠',
                '尝试另一个模型，并根据最终用途判断是否可接受',
              ],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '版权与使用边界',
          },
          {
            type: 'paragraph',
            text: '技术上能够分离歌曲，不代表可以任意发布、出售或重新分发结果。商业发行、公开演出、视频配乐和训练数据等用途可能涉及录音制品、词曲和表演者权利。请只处理自己拥有权利、已获授权或适用法律明确允许使用的音频。',
          },
          {
            type: 'heading',
            level: 2,
            text: '总结',
          },
          {
            type: 'paragraph',
            text: '在线音频分轨最重要的选择不是“轨道越多越好”，而是根据目标选对模型：提取人声或伴奏优先 4 轨，需要吉他或钢琴时使用 6 轨。浏览器本地推理可以减少音频上传带来的隐私暴露，但大型模型仍需要下载时间、充足内存和合理的音质预期。',
          },
        ],
        faq: [
          {
            question: '音频分轨时歌曲会上传到服务器吗？',
            answer: '不会。歌曲解码、模型推理、分段拼接和 WAV 编码都在浏览器本地完成。首次使用需要下载模型与运行时资源，但模型下载不等于上传用户音频。',
          },
          {
            question: '提取伴奏应该选择 4 轨还是 6 轨？',
            answer: '通常选择 4 轨。它直接输出人声、鼓、贝斯和其他，适合把人声去掉后重新组合伴奏。只有需要单独提取吉他或钢琴时才选择 6 轨。',
          },
          {
            question: '为什么 130 MB 的模型需要超过 1 GB 内存？',
            answer: '130 MB 是模型权重的存储体积。浏览器推理时还需要展开权重、创建 ONNX Runtime 会话、保存中间张量和输出缓冲，因此运行时内存会远大于下载文件。',
          },
          {
            question: '为什么分离后的人声里还有伴奏？',
            answer: '音乐源分离是模型估算，不是恢复录音棚原始多轨。当人声与乐器共享频率、混响、失真或声像位置时，少量串音很难完全避免。',
          },
          {
            question: '手机可以运行音频分轨吗？',
            answer: '部分高端设备可能可以，但不推荐。移动端浏览器的内存上限、后台回收和发热限制更严格，桌面版 Chrome 或 Edge 通常更稳定。',
          },
        ],
      },
      en: {
        title: 'How to Split a Song into Vocals, Drums, Bass, Guitar, Piano, and Instrumental Stems',
        excerpt: 'Learn how browser-local stem separation works, when to choose the four- or six-stem model, and how to export vocals, drums, bass, guitar, piano, and other parts as WAV files.',
        metaTitle: 'Online Audio Stem Splitter: Separate Vocals, Drums, Bass, Guitar, and Piano',
        metaDescription: 'Use a browser-local HT-Demucs model to split songs into stems. Compare four- and six-stem modes, follow the workflow, and understand privacy, memory, quality, and troubleshooting.',
        readingTime: 'About 9 minutes',
        tags: ['stem separation', 'vocal isolation', 'instrumental extractor', 'HT-Demucs', 'local processing'],
        relatedTools: [
          {
            label: 'Audio stem splitter',
            href: '/audio/split-stems',
            description: 'Split a song into vocals, drums, bass, guitar, piano, and other stems locally in your browser.',
          },
          {
            label: 'Audio trimmer',
            href: '/audio/trim',
            description: 'Trim a song to the section you need before separation to reduce processing time and memory use.',
          },
          {
            label: 'Audio to WAV',
            href: '/audio/to-wav',
            description: 'Convert common audio formats to WAV for editors, players, or digital audio workstations.',
          },
          {
            label: 'Audio to text',
            href: '/audio/to-text',
            description: 'Load an open-source speech model locally and transcribe interviews, recordings, and spoken audio.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'You do not always need a full desktop audio suite to extract vocals, make an instrumental, or focus on the drums, bass, guitar, or piano in a song. A browser music-source-separation model can analyze the mix and export estimated parts as separate WAV files.',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden uses an open-source HT-Demucs ONNX model. Audio decoding, model inference, overlap-add processing, and WAV encoding happen locally in the browser. The first run downloads model assets, but the selected song is not uploaded as a remote separation job.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'What is audio stem separation?',
          },
          {
            type: 'paragraph',
            text: 'A released song is usually a stereo mix in which vocals, drums, bass, and other instruments share the same waveform. It cannot be unpacked like a ZIP file to recover the original studio tracks. A separation model instead estimates how much each source contributes by analyzing spectral patterns, rhythm, timbre, and musical context.',
          },
          {
            type: 'paragraph',
            text: 'The results can work well for practice, karaoke backing tracks, transcription, arrangement study, and mix references, but they are not identical to the original multitrack session. Reverb, distortion, layered performances, and overlapping frequencies can leave audible bleed between stems.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Should you choose four stems or six stems?',
          },
          {
            type: 'table',
            headers: ['Model', 'Outputs', 'Best for', 'Main tradeoff'],
            rows: [
              [
                'Four-stem HT-Demucs',
                'Vocals, drums, bass, other',
                'Vocals, instrumentals, and rhythm practice',
                'More focused vocals and other, without separate guitar or piano',
              ],
              [
                'Six-stem HT-Demucs',
                'Vocals, drums, bass, other, guitar, piano',
                'Guitar, piano, or six-part analysis',
                'Adds two stems, while other becomes narrower and may sound weaker',
              ],
            ],
          },
          {
            type: 'paragraph',
            text: 'Choose four stems when your goal is vocal isolation or an instrumental. Choose six only when guitar or piano must be available separately. More outputs do not automatically mean better overall quality; they divide the same mixture into smaller categories.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to split a song in the browser',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Open the stem splitter, then click the upload area or drag a song onto the page.',
              'Choose the four- or six-stem model. Four stems is the better default for vocals and instrumentals.',
              'Select only the stems you need. Avoiding unnecessary long outputs reduces result memory use.',
              'Select “Separate stems” and keep the page open while it decodes audio, downloads and loads the model, separates segments, and encodes WAV files.',
              'Preview the results, download individual stems, or package every result in a ZIP archive.',
            ],
          },
          {
            type: 'callout',
            title: 'Start browser-local stem separation',
            text: 'Choose a song, select four or six stems, and export separate WAV tracks without submitting the audio to a separation API.',
            href: '/audio/split-stems',
            linkLabel: 'Open the audio stem splitter',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Why is the first run slower?',
          },
          {
            type: 'paragraph',
            text: 'The page is small, but the neural-network models are not. The current four-stem model is about 158 MiB and the six-stem model about 130 MiB. A model is downloaded only when separation begins, verified, and stored in the browser cache so the same browser can usually reuse it later.',
          },
          {
            type: 'paragraph',
            text: 'After the download, the browser still needs to create an ONNX Runtime session and load the parameters, which can take 10–15 seconds. The smaller files store FP16 weights, but inference still needs more than 1 GB of working memory. Download size and runtime memory are different measurements.',
          },
          {
            type: 'list',
            items: [
              'Use a current desktop version of Chrome or Edge.',
              'Close memory-heavy tabs and applications before processing.',
              'Trim a long song to the section you need before separation.',
              'Do not reload, suspend, or close the page while the model is loading or running.',
              'Mobile browsers normally have stricter memory limits and are a poor fit for this model.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Does local processing mean no network traffic?',
          },
          {
            type: 'paragraph',
            text: 'No. The first run needs a connection to download the page code, ONNX Runtime, and model file. The relevant privacy boundary is that the site downloads software and public model assets while the user-selected audio remains in the browser instead of being posted to a remote separation API.',
          },
          {
            type: 'paragraph',
            text: 'Model, WASM, and Worker requests in the Network panel are expected. To verify a local-processing claim, inspect whether the selected song appears in a request body rather than treating every network request as an upload. Network use normally drops after the required assets are cached.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'How should you evaluate the separated audio?',
          },
          {
            type: 'paragraph',
            text: 'Do not listen to only one isolated track. Recombine vocals, drums, bass, and other to check whether they approximately reconstruct the source, then inspect the stem that matters most. Light metallic artifacts and bleed may be unavoidable; the practical question is whether they interfere with your intended use.',
          },
          {
            type: 'list',
            items: [
              'Karaoke: check for obvious lead-vocal residue and holes left in the instrumental.',
              'Instrument practice: prioritize stable timing, melody, and continuity over studio-grade isolation.',
              'Mixing or sampling: audition on headphones and speakers, and check phase, bass, and transient artifacts.',
              'Transcription or analysis: use the stem with the clearest target voice or instrument.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Common failures and practical fixes',
          },
          {
            type: 'table',
            headers: ['Symptom', 'Likely cause', 'What to try'],
            rows: [
              [
                'Model download fails',
                'The model host is blocked, the connection stopped, or cached bytes are incomplete',
                'Check the connection and retry; clear the cached model if necessary',
              ],
              [
                'Model appears stuck while loading',
                'The browser is verifying the model and creating a local inference session',
                'Allow 10–15 seconds and avoid repeated clicks or reloads',
              ],
              [
                'Model cannot be loaded',
                'The browser or device does not have enough available memory',
                'Close other tabs and retry in desktop Chrome or Edge',
              ],
              [
                'Separation stops partway through',
                'The audio is too long, too many output stems were selected, or inference ran out of memory',
                'Trim the audio, select fewer outputs, and run it again',
              ],
              [
                'A stem contains audible bleed',
                'Sources overlap heavily in frequency, reverb, distortion, or stereo position',
                'Try the other model and judge the result against the intended use',
              ],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Copyright and responsible use',
          },
          {
            type: 'paragraph',
            text: 'The ability to separate a recording does not automatically grant permission to publish, sell, perform, sample, or redistribute the results. Commercial releases, public videos, performances, and training datasets may involve rights in the recording, composition, and performance. Process audio you own, are authorized to use, or may lawfully use in your jurisdiction.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Key takeaways',
          },
          {
            type: 'paragraph',
            text: 'The most important stem-separation choice is not “more stems is better.” Use four stems for vocals and instrumentals, and six only when guitar or piano must be isolated. Browser-local inference reduces the privacy exposure of uploading a song, but a large model still requires download time, substantial memory, and realistic expectations about separation quality.',
          },
        ],
        faq: [
          {
            question: 'Is my song uploaded during stem separation?',
            answer: 'No. Audio decoding, inference, overlap-add processing, and WAV encoding happen locally in the browser. The first use downloads model and runtime assets, but downloading a model is different from uploading the selected song.',
          },
          {
            question: 'Should I use four stems or six stems to make an instrumental?',
            answer: 'Use four stems in most cases. It outputs vocals, drums, bass, and other, so you can omit vocals and recombine the instrumental parts. Choose six only when you also need guitar or piano separately.',
          },
          {
            question: 'Why does a 130 MB model need more than 1 GB of memory?',
            answer: 'The file size measures stored weights. Inference must expand parameters, create an ONNX Runtime session, allocate intermediate tensors, and hold output buffers, so working memory is much larger than the downloaded file.',
          },
          {
            question: 'Why can I still hear instruments in the vocal stem?',
            answer: 'Source separation estimates components of a finished mix rather than recovering original studio tracks. Shared frequencies, reverb, distortion, and stereo placement make some bleed difficult to avoid.',
          },
          {
            question: 'Can I split stems on a phone?',
            answer: 'Some high-end devices may succeed, but it is not recommended. Mobile browsers have tighter memory, background suspension, and thermal limits, so desktop Chrome or Edge is normally more reliable.',
          },
        ],
      },
    },
  },
  {
    slug: 'free-online-mp3-recording-video-to-text-tools',
    publishedAt: '2026-09-03',
    updatedAt: '2026-09-03',
    translations: {
      zh: {
        title: '免费在线 MP3、录音、视频转文本工具推荐对比',
        excerpt: '想把 MP3、会议录音、采访音频或视频里的讲话整理成文字？这篇对比免费在线语音转文字工具的隐私、准确率、文件流程和适用场景。',
        metaTitle: '免费在线 MP3/录音/视频转文本工具推荐对比',
        metaDescription: '对比免费在线 MP3 转文字、录音转文本和视频转文本工具，说明 ToolGarden 浏览器本地 Whisper 转写、隐私边界、模型选择、视频音轨提取流程和使用建议。',
        readingTime: '约 8 分钟阅读',
        tags: ['音频转文字', 'MP3 转文字', '录音转文本', '视频转文本', 'Whisper'],
        relatedTools: [
          {
            label: '音频转文字',
            href: '/audio/to-text',
            description: '上传 MP3、WAV、M4A、WebM 等音频，在浏览器本地加载 Whisper 模型转写文本。',
          },
          {
            label: '提取视频音频',
            href: '/audio/extract',
            description: '先从 MP4、MOV、WebM 等视频中提取 MP3 音轨，再进入音频转文字流程。',
          },
          {
            label: '在线录音',
            href: '/audio/recorder',
            description: '直接在浏览器录制语音，导出 MP3 后可继续转写为文本。',
          },
          {
            label: '音频剪辑',
            href: '/audio/trim',
            description: '转写前截取关键片段，减少等待时间并提升长录音处理稳定性。',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: '如果你只是想把一段 MP3、课堂录音、采访素材或视频里的发言转成文字，最理想的工具不是功能越多越好，而是流程短、隐私边界清楚、结果能直接复制，并且不强迫你先注册账号。',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden 的音频转文字工具适合这种轻量场景：上传音频后，页面会在浏览器中加载开源 Whisper 模型进行转写，识别结果直接显示在页面上，并提供一键复制。音频文件不需要传到 ToolGarden 的转写服务器；第一次使用会下载模型文件，之后通常会被浏览器缓存。',
          },
          {
            type: 'callout',
            title: '开始免费音频转文字',
            text: '上传 MP3、WAV、M4A、WebM、FLAC 等音频文件，选择默认高准确率模型，把识别出的文案一键复制出来。',
            href: '/audio/to-text',
            linkLabel: '打开音频转文字工具',
          },
          {
            type: 'heading',
            level: 2,
            text: '先说结论：不同工具适合不同转写任务',
          },
          {
            type: 'table',
            headers: ['需求', '推荐方式', '原因'],
            rows: [
              ['短 MP3、语音备忘、采访片段', 'ToolGarden 音频转文字', '免注册、浏览器本地处理、结果可一键复制'],
              ['会议纪要和团队协作', '带协作空间的云端转写工具', '适合多人评论、摘要、说话人管理和持续归档'],
              ['视频转文本', '先提取音频，再转写', '视频本质上要处理其中的音轨，拆成两步更稳定'],
              ['法律、医疗、合同等高风险内容', '人工校对或专业转写服务', '自动识别可能漏词、错词或误判专有名词'],
              ['很长的播客或课程', '先剪辑分段，再逐段转写', '本地模型更依赖设备内存和浏览器稳定性'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '为什么推荐 ToolGarden 做免费在线音频转文字？',
          },
          {
            type: 'list',
            items: [
              '浏览器本地转写：音频解码、模型推理和结果生成在当前浏览器会话中完成，减少把原始录音上传到第三方 API 的暴露。',
              '默认高准确率模型：当前默认使用 Whisper small，识别质量优先；也可切换到 Whisper base，在速度和准确率之间做平衡。',
              '无需账号和额度：适合偶尔处理 MP3、录音、语音备忘、采访片段和字幕草稿。',
              '识别结果可一键复制：转写完成后直接复制文案，方便粘贴到笔记、文档、字幕编辑器或 AI 总结工具。',
              '同站工具可串联：视频先用“提取视频音频”导出 MP3，长录音先用“音频剪辑”截取关键部分，再进入转写。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'MP3、录音、视频分别怎么转成文字？',
          },
          {
            type: 'heading',
            level: 3,
            text: 'MP3 转文字',
          },
          {
            type: 'paragraph',
            text: '打开音频转文字页面，上传 MP3 文件，保持默认的高准确率 Whisper small 模型，点击开始转写即可。短音频通常最适合直接处理；如果录音很长，建议先截取最重要的部分，或者分成几段分别识别。',
          },
          {
            type: 'heading',
            level: 3,
            text: '录音转文本',
          },
          {
            type: 'paragraph',
            text: '如果已有录音文件，直接上传即可。如果还没有文件，可以先用在线录音工具录制并导出 MP3，再回到音频转文字页面识别。录音时尽量靠近麦克风、减少背景音乐、避免多人同时说话，准确率会明显更好。',
          },
          {
            type: 'heading',
            level: 3,
            text: '视频转文本',
          },
          {
            type: 'paragraph',
            text: '视频转文本的关键其实是“提取音轨”。先用 ToolGarden 的音频提取工具从 MP4、MOV、WebM 等视频中导出 MP3，再把这个 MP3 上传到音频转文字工具。两步处理比直接把视频交给转写模型更清楚，也更容易定位问题。',
          },
          {
            type: 'heading',
            level: 2,
            text: '免费在线转写工具对比',
          },
          {
            type: 'table',
            headers: ['工具类型', '优势', '限制', '更适合'],
            rows: [
              ['ToolGarden 浏览器本地转写', '免注册、无上传转写 API、可复制结果、适合 MP3 和录音', '首次需要下载模型，长音频依赖本机性能', '个人笔记、采访整理、短音频转文字'],
              ['云端会议转写工具', '说话人区分、协作、摘要和搜索通常更完善', '通常需要上传音频，免费额度有限', '团队会议、长期知识库、多人协作'],
              ['视频平台内置字幕', '不需要单独导出音频，和视频播放器结合紧密', '平台限制多，下载或编辑字幕不一定方便', '公开视频字幕、内容浏览'],
              ['专业人工转写服务', '对专有名词、口音、多人对话和高风险内容更稳', '价格更高，交付更慢', '法律、医疗、出版、正式记录'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '提高识别准确率的实用建议',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              '优先使用清晰人声，避免背景音乐盖过讲话。',
              '多人对话尽量分开录，或者每次只处理一个说话人比较清楚的片段。',
              '长音频先剪成 5 到 15 分钟的小段，失败后也更容易重试。',
              '专有名词、人名、数字、金额和时间必须人工复核。',
              '如果结果出现重复句，先换更高准确率模型，并检查原音频是否有长时间静音、噪声或回声。',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: '隐私边界：本地处理不等于完全离线',
          },
          {
            type: 'paragraph',
            text: '浏览器本地转写的意思是：你的音频文件在浏览器中被读取和推理，不会作为转写任务上传到 ToolGarden 服务器。与此同时，网页代码、运行库和 Whisper 模型文件仍需要从网络下载。看到模型下载请求是正常现象，它和上传你的录音不是同一件事。',
          },
          {
            type: 'paragraph',
            text: '如果你的录音包含商业机密、客户资料、医疗信息或法律证据，仍应按组织内部的数据规范处理。自动转写适合生成草稿和提升效率，不应该替代必要的保密流程和人工复核。',
          },
          {
            type: 'heading',
            level: 2,
            text: '推荐工作流',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'MP3 或 M4A：直接打开音频转文字页面上传。',
              '自拍视频或会议录像：先打开音频提取工具，把视频导出为 MP3。',
              '长录音：先用音频剪辑工具截取重点片段。',
              '转写完成：点击复制文案，粘贴到文档里做校对、摘要和排版。',
              '发布前：复核人名、数字、专业术语和上下文含义。',
            ],
          },
          {
            type: 'paragraph',
            text: '所以，如果你的目标是快速把 MP3、录音或视频音轨转成可编辑文字，可以先试 ToolGarden。它不是企业会议管理系统，也不是人工校对服务；它更像一个打开即用的本地转写工作台，适合把原始语音快速变成可复制、可整理、可继续加工的文本草稿。',
          },
        ],
        faq: [
          {
            question: 'ToolGarden 音频转文字免费吗？',
            answer: '是。音频转文字页面可免费使用，不要求注册账号。首次使用需要下载浏览器本地 Whisper 模型，下载完成后通常会被浏览器缓存。',
          },
          {
            question: 'MP3 转文字会上传音频文件吗？',
            answer: '不会作为转写任务上传到 ToolGarden 服务器。音频在浏览器本地解码和识别，但页面代码、运行库和模型文件需要从网络下载。',
          },
          {
            question: '视频可以直接转文字吗？',
            answer: '推荐先用音频提取工具从视频中导出 MP3，再把 MP3 上传到音频转文字页面。这样流程更稳定，也更容易控制文件大小。',
          },
          {
            question: 'Whisper small 和 Whisper base 怎么选？',
            answer: '默认建议使用 Whisper small，它更重但准确率更好。设备较慢、网络较弱或只需要快速草稿时，可以切换到 Whisper base。',
          },
          {
            question: '自动转写结果可以直接发布吗？',
            answer: '不建议直接发布。人名、数字、术语、引用和关键结论都需要人工校对，尤其是法律、医疗、财务和正式记录场景。',
          },
        ],
      },
      en: {
        title: 'Best Free Online MP3, Recording, and Video-to-Text Tools Compared',
        excerpt: 'Compare free online speech-to-text options for MP3 files, voice recordings, interviews, and video audio tracks, with a privacy-first browser-local workflow.',
        metaTitle: 'Best Free Online MP3, Recording, and Video-to-Text Tools',
        metaDescription: 'Compare free MP3-to-text, recording transcription, and video-to-text workflows. See when to use ToolGarden browser-local Whisper transcription, cloud meeting tools, captions, or human review.',
        readingTime: '8 min read',
        tags: ['audio to text', 'MP3 to text', 'recording transcription', 'video to text', 'Whisper'],
        relatedTools: [
          {
            label: 'Audio to Text',
            href: '/audio/to-text',
            description: 'Transcribe MP3, WAV, M4A, WebM, and other audio files with a browser-local Whisper model.',
          },
          {
            label: 'Extract Audio from Video',
            href: '/audio/extract',
            description: 'Extract an MP3 audio track from MP4, MOV, WebM, and similar video files before transcription.',
          },
          {
            label: 'Voice Recorder',
            href: '/audio/recorder',
            description: 'Record speech in the browser, export MP3, then transcribe it to editable text.',
          },
          {
            label: 'Audio Trim',
            href: '/audio/trim',
            description: 'Cut long recordings into focused sections before running speech recognition.',
          },
        ],
        blocks: [
          {
            type: 'lead',
            text: 'When you need to turn an MP3, voice memo, interview, class recording, or video soundtrack into text, the best tool is not necessarily the one with the longest feature list. It is the one that matches your privacy needs, file type, editing workflow, and tolerance for review.',
          },
          {
            type: 'paragraph',
            text: 'ToolGarden Audio to Text is built for quick, privacy-aware transcription. It loads an open-source Whisper model in the browser, shows the transcript on the page, and lets you copy the result with one click. Your selected audio is not sent to a ToolGarden transcription API; the model files download to your browser and are usually cached for later use.',
          },
          {
            type: 'callout',
            title: 'Start Free Audio Transcription',
            text: 'Upload MP3, WAV, M4A, WebM, FLAC, and similar audio files, use the default high-accuracy model, then copy the generated text.',
            href: '/audio/to-text',
            linkLabel: 'Open Audio to Text',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Quick Recommendation',
          },
          {
            type: 'table',
            headers: ['Need', 'Recommended workflow', 'Why'],
            rows: [
              ['Short MP3 files, voice memos, interviews', 'ToolGarden Audio to Text', 'No account, browser-local processing, copy-ready transcript'],
              ['Meetings and team notes', 'Cloud meeting transcription tool', 'Better collaboration, summaries, speaker workflows, and archives'],
              ['Video to text', 'Extract audio first, then transcribe', 'The speech lives in the audio track, and a two-step workflow is easier to control'],
              ['Legal, medical, or contractual material', 'Human review or professional transcription', 'Automatic speech recognition can miss words and names'],
              ['Very long podcasts or courses', 'Trim or split first', 'Browser-local models depend on device memory and tab stability'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Why ToolGarden is a strong free option',
          },
          {
            type: 'list',
            items: [
              'Browser-local transcription: decoding, model inference, and transcript generation happen in the current browser session.',
              'High-accuracy default: the tool now defaults to Whisper small, with Whisper base available for a lighter balanced mode.',
              'No account flow: useful for occasional MP3 files, voice notes, interviews, and subtitle drafts.',
              'One-click copy: copy the recognized text directly into notes, docs, subtitle editors, or AI summarization tools.',
              'Composable audio tools: extract audio from video first, trim long recordings, then transcribe the focused audio.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'How to transcribe MP3, recordings, and videos',
          },
          {
            type: 'heading',
            level: 3,
            text: 'MP3 to text',
          },
          {
            type: 'paragraph',
            text: 'Open Audio to Text, upload the MP3 file, keep the default high-accuracy Whisper small model, and start transcription. Short audio is the easiest case. For long recordings, trim the important section or split the file into smaller parts first.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Recording to text',
          },
          {
            type: 'paragraph',
            text: 'If you already have a recording file, upload it directly. If you still need to capture audio, use the browser voice recorder first, export MP3, then transcribe that file. Clear speech, less background noise, and fewer overlapping speakers all improve recognition quality.',
          },
          {
            type: 'heading',
            level: 3,
            text: 'Video to text',
          },
          {
            type: 'paragraph',
            text: 'Video transcription is really audio-track transcription. Use the video audio extractor to export MP3 from MP4, MOV, WebM, or similar video files, then upload the MP3 to Audio to Text. The two-step process is more transparent and easier to retry.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Free transcription tool comparison',
          },
          {
            type: 'table',
            headers: ['Tool type', 'Strengths', 'Limits', 'Best for'],
            rows: [
              ['ToolGarden browser-local transcription', 'No account, no transcription API upload, copy-ready output', 'First run downloads a model; long audio depends on local device performance', 'Personal notes, interview cleanup, short audio drafts'],
              ['Cloud meeting transcription', 'Speaker workflows, collaboration, summaries, and search', 'Usually uploads audio and limits free usage', 'Team meetings and shared archives'],
              ['Platform captions', 'Integrated with video playback', 'Export and editing options vary by platform', 'Public video caption review'],
              ['Professional human transcription', 'Best review quality for names, accents, and high-stakes material', 'Costs more and takes longer', 'Legal, medical, publishing, and official records'],
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Tips for better accuracy',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'Use audio where the speech is louder than the background.',
              'Avoid overlapping speakers when possible, or transcribe cleaner sections separately.',
              'Split long recordings into 5 to 15 minute segments.',
              'Always review names, numbers, amounts, dates, and domain-specific terms.',
              'If the transcript repeats a phrase, use the higher-accuracy model and check for long silence, echo, or noise in the source.',
            ],
          },
          {
            type: 'heading',
            level: 2,
            text: 'Privacy: local processing is not the same as offline',
          },
          {
            type: 'paragraph',
            text: 'Browser-local transcription means your selected audio is read and recognized in the browser rather than uploaded to a ToolGarden transcription server. The page code, runtime assets, and Whisper model files still come from the network. Model downloads are normal; they are not the same data flow as uploading your recording.',
          },
          {
            type: 'paragraph',
            text: 'For confidential business, customer, medical, legal, or evidentiary recordings, follow your organization’s data handling rules. Automatic transcription is excellent for drafting and searchability, but it does not replace human review where accuracy matters.',
          },
          {
            type: 'heading',
            level: 2,
            text: 'Recommended workflow',
          },
          {
            type: 'list',
            ordered: true,
            items: [
              'MP3 or M4A: upload directly to Audio to Text.',
              'Phone video or meeting recording: extract the audio track to MP3 first.',
              'Long recording: trim the important section before transcription.',
              'After transcription: copy the text into a document for review, summary, and formatting.',
              'Before publishing: proofread names, numbers, technical terms, and context.',
            ],
          },
          {
            type: 'paragraph',
            text: 'If your goal is to quickly turn MP3 files, recordings, or video audio tracks into editable text, ToolGarden is a practical first stop. It is not a full enterprise meeting platform or a human proofreading service; it is a fast browser-local transcription workbench for getting speech into copyable text.',
          },
        ],
        faq: [
          {
            question: 'Is ToolGarden Audio to Text free?',
            answer: 'Yes. The Audio to Text page is free to use and does not require an account. The first run downloads a browser-local Whisper model, which is usually cached afterward.',
          },
          {
            question: 'Does MP3-to-text upload my audio?',
            answer: 'Not to a ToolGarden transcription API. The audio is decoded and recognized in your browser, while the page code, runtime files, and model assets are downloaded from the network.',
          },
          {
            question: 'Can I transcribe a video directly?',
            answer: 'The recommended workflow is to extract MP3 audio from the video first, then upload that MP3 to Audio to Text. This is easier to control and retry.',
          },
          {
            question: 'Should I choose Whisper small or Whisper base?',
            answer: 'Use Whisper small by default for better accuracy. Switch to Whisper base when you want a lighter balanced mode or your device struggles with the larger model.',
          },
          {
            question: 'Can I publish automatic transcripts without review?',
            answer: 'You should proofread before publishing. Names, numbers, technical terms, quotes, and high-stakes content need human checking.',
          },
        ],
      },
    },
  },
] satisfies BlogArticle[];
