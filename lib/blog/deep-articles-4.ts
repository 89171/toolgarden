import type { BlogArticle } from './articles';

export const deepArticles4: BlogArticle[] = [
  {
    slug: 'qr-code-subtitle-tools-guide',
    publishedAt: '2026-07-20',
    updatedAt: '2026-10-14',
    translations: {
      zh: {
        title: '二维码扫不出来、字幕格式不兼容怎么办？生成、识别与 SRT/VTT/LRC 转换实战',
        excerpt:
          '从 Wi-Fi 二维码的转义规则、纠错等级与静区，到 SRT、VTT、LRC 的时间格式差异和转换陷阱，用浏览器本地工具一步步排查「扫不出来」和「播放器不认」。',
        metaTitle: '二维码扫不出来与字幕转换：SRT/VTT/LRC 实战',
        metaDescription:
          '二维码生成要注意纠错等级、静区和 Wi-Fi 转义；字幕转换要注意 SRT、VTT、LRC 的时间格式与编码。附实例与排错清单。',
        readingTime: '13 分钟',
        tags: ['二维码工具', '字幕工具', 'WiFi 二维码', 'SRT 转 VTT'],
        relatedTools: [
          { label: '二维码生成器', href: '/qr-code/generate', description: '在浏览器本地生成网址、Wi-Fi、文本二维码，可设尺寸、静区、纠错等级和中心 logo。' },
          { label: '二维码识别', href: '/qr-code/decode', description: '上传图片或打开摄像头读取二维码内容，用来在印刷前验证。' },
          { label: '字幕制作与转换', href: '/subtitle-maker', description: '编辑并互转 SRT、VTT、LRC，配合本地音视频预览校准时间轴。' },
        ],
        blocks: [
          { type: 'lead', text: '二维码和字幕文件看上去毫无关系，但它们有一个共同点：都是体积很小的「交换格式」，一个字符写错，另一台设备就读不出来。Wi-Fi 二维码里的密码带了分号却没转义，手机相机会毫无反应；SRT 的毫秒分隔符写成了点，部分播放器会把整条字幕丢掉。' },
          { type: 'paragraph', text: '这篇文章不重复讲工具界面，而是把真正会出问题的地方讲透：二维码的内容该怎么拼、容量和纠错等级怎么取舍、尺寸与静区怎么定；字幕三种格式的时间语法差在哪、转换时哪些信息会丢、怎样用本地工具定位并修正时间轴。全部操作都在浏览器里完成，Wi-Fi 密码、未发布的视频和字幕草稿不会上传到任何服务器。' },

          { type: 'heading', level: 2, text: '一、先确定二维码里装什么，再谈样式' },
          { type: 'paragraph', text: '二维码本身只是把一串文本编码成黑白方块。扫码软件解出文本之后，由手机系统按文本的「约定写法」决定是打开网页、连接 Wi-Fi 还是保存联系人。所以顺序必须是：先把文本写对，再调尺寸、颜色和纠错等级。ToolGarden 的二维码生成器接收任意文本，它不会替你拼 Wi-Fi 或名片格式，这一步需要你自己确认。' },
          { type: 'table', headers: ['用途', '文本写法', '常见错误'], rows: [
            ['网页', 'https://example.com/promo?id=42', '漏写 https://，扫出来只是一串文字而不是可点击的链接'],
            ['Wi-Fi', 'WIFI:T:WPA;S:网络名;P:密码;;', '名称或密码含 ; , : \\ " 时没有加反斜杠转义；开放网络应写 T:nopass'],
            ['电话', 'tel:+8613800000000', '写成纯数字，部分相机只当文字显示'],
            ['邮件', 'mailto:hi@example.com?subject=Hello', '主题里的空格和中文没有做 URL 编码'],
            ['名片', 'BEGIN:VCARD … END:VCARD', '换行被吞掉；每个字段必须独占一行'],
          ] },
          { type: 'heading', level: 3, text: 'Wi-Fi 二维码的转义规则（最容易踩的坑）' },
          { type: 'paragraph', text: 'Wi-Fi 载荷用分号分隔字段，所以名称或密码里如果本身带有反斜杠、分号、逗号、冒号或双引号，就必须在它前面加一个反斜杠。另外，如果 SSID 或密码恰好全是十六进制字符（例如 1234abcd），部分解析器会把它当成十六进制串处理，常见做法是用双引号把它包起来。隐藏网络再加一个 H:true 字段。' },
          { type: 'code', language: 'text', code: `# 普通 WPA 网络
WIFI:T:WPA;S:Meeting-Room;P:abc12345;;

# 密码含分号和反斜杠：原密码是  pa;ss\\word
WIFI:T:WPA;S:Meeting-Room;P:pa\\;ss\\\\word;;

# 开放网络（没有密码）
WIFI:T:nopass;S:Guest;;

# 隐藏网络
WIFI:T:WPA;S:Hidden-Net;P:abc12345;H:true;;` },
          { type: 'callout', title: '生成之前先把文本写对', text: '把上面的文本粘贴进生成器，几秒内就能得到可下载的 PNG。二维码内容是明文编码而不是加密，任何扫到的人都能读出 Wi-Fi 密码，所以公共场合只贴访客网络的码。', href: '/qr-code/generate', linkLabel: '打开二维码生成器' },

          { type: 'heading', level: 2, text: '二、容量、纠错等级与尺寸：怎样让它真的扫得出来' },
          { type: 'paragraph', text: '二维码有 40 个版本，版本 N 的边长是 17 + 4N 个模块（版本 1 是 21×21，版本 40 是 177×177）。内容越长，需要的版本越高，模块越多，同样的打印尺寸下每个模块就越小。纠错等级 L、M、Q、H 分别大约能恢复 7%、15%、25%、30% 的损坏数据，代价是同样内容需要更多模块。下面是字节模式下几个常用版本的容量（单位：字节），可以据此估算你的内容会落在哪个版本。' },
          { type: 'table', headers: ['版本（边长）', 'L', 'M', 'Q', 'H'], rows: [
            ['1（21×21）', '17', '14', '11', '7'],
            ['3（29×29）', '53', '42', '32', '24'],
            ['5（37×37）', '106', '84', '62', '44'],
            ['7（45×45）', '154', '122', '86', '64'],
            ['10（57×57）', '271', '213', '151', '119'],
          ] },
          { type: 'paragraph', text: '容量按 UTF-8 字节计算，一个汉字占 3 字节，所以中文内容比同样字数的英文更容易把版本顶高。生成结果面板会显示输入的字节数，你可以直接拿它去对照上表。' },
          { type: 'heading', level: 3, text: '实例：带统计参数的长链接 vs 短链接' },
          { type: 'paragraph', text: '假设要把 https://example.com/spring-sale?utm_source=poster&utm_medium=qr&utm_campaign=2026spring 做成海报二维码，这条链接是 87 字节。默认的 M 级别下版本 5 只能装 84 字节，不够，得升到版本 6（41×41）。换成 28 字节的短链接 https://example.com/s/spring，M 级别下版本 2 只装 26 字节，所以落在版本 3（29×29），模块总数（841 对 1681）正好少了一半。生成器默认输出 320 像素、静区 2 个模块：41×41 的码加两侧静区共 45 个模块，每个模块约 7 像素；29×29 的码共 33 个模块，每个模块约 9.7 像素。同样的海报面积，短链接的模块更大，远距离更容易对焦。' },
          { type: 'heading', level: 3, text: '尺寸、静区与扫描距离' },
          { type: 'list', items: [
            '尺寸：生成器的尺寸范围是 160 到 1024 像素，默认 320。网页展示 240 像素以上通常够用；要印刷，直接导出 1024 像素再在排版软件里缩小，比放大小图清晰得多。',
            '静区：二维码规范要求四周留 4 个模块宽的空白，生成器默认只有 2（可调 0 到 8）。要印刷或贴在深色背景上，建议调到 4。静区被图案、边框或相邻文字侵占，是「屏幕上能扫、纸上扫不出」最常见的原因。',
            '对比度：生成器使用近黑色模块（#111111）和白色背景，对比度已是最高，不需要再调色。不要自己把它反色再放到深色底上，部分扫码软件对反色码的支持不稳定。',
            '扫描距离：行业里常用的经验值是扫描距离约为码宽的 10 倍。2 厘米见方的码大约在 20 厘米处最好扫；展板上的码要按观看距离反推尺寸。',
          ] },
          { type: 'heading', level: 3, text: '加中心 logo 的代价' },
          { type: 'paragraph', text: '在生成器里上传 logo 时，纠错等级会自动切到 H，logo 的白底圆角外框占码边长的 28%，约 7.8% 的面积（0.28² ≈ 0.078），logo 图案本体占边长的 22%。这部分被遮住的数据靠 H 级约 30% 的冗余兜底，所以不要指望再把 logo 放大。更要紧的是，H 级让同样内容的版本升高：一条 40 字节的链接在 M 级是版本 3（29×29），在 H 级要版本 5（37×37），模块变小，扫描距离缩短。如果二维码本来就要印在小标签上，宁可不放 logo。' },

          { type: 'heading', level: 2, text: '三、识别与验证：印刷之前让「另一台设备」读一遍' },
          { type: 'paragraph', text: '二维码识别工具支持上传 PNG、JPG、WebP、GIF、BMP 图片（单个文件不超过 12MB，像素不超过 2400 万），也可以打开摄像头实时扫描，两者都在本地用 jsQR 解码，图片和视频帧不会发送出去，解码时还会尝试反色图案。它的价值有三点：' },
          { type: 'list', ordered: true, items: [
            '印刷前验证：把准备送印的 PNG 拖进去，确认解出的文本与你输入的逐字一致，尤其是 Wi-Fi 的转义和 URL 的参数。',
            '安全查看陌生二维码：先看解出的文本再决定是否访问，而不是让手机相机直接跳转。短链接和带跟踪参数的长链接在这里一目了然。',
            '定位「扫不出来」：把现场拍的照片拖进去。如果工具也解不出，问题通常在图像本身（反光、倾斜、太小、静区被占）；如果工具能解、手机相机不能，问题多半在内容格式（Wi-Fi 转义、系统不支持的协议头）。',
          ] },
          { type: 'table', headers: ['症状', '最可能的原因', '怎么排查'], rows: [
            ['屏幕能扫，纸上扫不出', '静区被侵占、打印分辨率不足、模块被油墨糊住', '导出 1024 像素版本，静区调到 4，拍印样放进识别工具'],
            ['扫出来是乱码文字', '编码或内容被截断', '对比识别结果与原文本，查看字节数是否超过版本容量'],
            ['Wi-Fi 码扫了没反应', '头部不是 WIFI:，或密码里的特殊字符没转义', '用识别工具读出文本，逐字段检查分号与反斜杠'],
            ['加了 logo 后偶尔扫不出', 'logo 占用面积过大，H 级冗余被用尽', '换小 logo，或去掉 logo 并缩短内容'],
            ['远处扫不出，近处可以', '模块太小', '缩短内容（改短链接）、放大打印尺寸'],
          ] },
          { type: 'callout', title: '用识别工具做最后一道关', text: '把生成的 PNG 或现场拍摄的照片拖进识别工具，比自己拿手机试一次更可靠，因为它会把解出的原始文本完整显示出来，方便逐字比对。', href: '/qr-code/decode', linkLabel: '打开二维码识别' },

          { type: 'heading', level: 2, text: '四、字幕：SRT、VTT、LRC 的语法差在哪' },
          { type: 'paragraph', text: '三种格式都是纯文本，差别集中在时间戳的写法和能携带的信息。理解这些差别，才能知道转换时哪些东西会丢、为什么播放器不认。' },
          { type: 'table', headers: ['项目', 'SRT', 'WebVTT', 'LRC'], rows: [
            ['时间写法', '00:01:02,500（毫秒前是逗号）', '00:01:02.500（点号），小时可省略为 01:02.500', '[01:02.50]（分:秒.百分秒）'],
            ['是否有结束时间', '有，用 --> 连接开始与结束', '有，同 SRT', '通常只有开始时间，结束默认到下一行开始'],
            ['文件头', '无，每条以序号开头', '必须以 WEBVTT 开头', '可带 [ti:] [ar:] 等标签'],
            ['附加能力', '基本无（常夹带 HTML 标签）', '位置/对齐设置、NOTE 注释、STYLE 样式', '歌词行级同步，部分扩展支持逐字'],
            ['典型场景', '本地播放器、剪辑软件、视频平台上传', '网页 video 标签的 track', '音乐播放器歌词'],
          ] },
          { type: 'heading', level: 3, text: '字幕工具的实际行为（从代码确认）' },
          { type: 'list', items: [
            '格式识别：先看文件扩展名（.vtt/.srt/.lrc），其次看内容是否以 WEBVTT 开头（兼容 BOM），再看是否含 -->，含则当 SRT，否则当 LRC。',
            '导出 SRT 时序号总是从 1 重新编号，并按开始时间排序；导出 VTT 会补上 WEBVTT 头；导出 LRC 时每行是 [分:秒.百分秒]<分:秒.百分秒>文本，同时写入开始和结束时间，多行文本会被折叠为一行。',
            '导入 LRC 时 [ti:] [ar:] [al:] [by:] [offset:] 这类标签行会被跳过，其中 [offset:] 不会被应用到时间上。',
            '一行 LRC 可以带多个时间标签（重复副歌），会展开成多条字幕。',
            '编辑器可以加载本地音频或视频，点击表格行即可跳到对应时刻；播放到某个位置后点「设为开始」或「设为结束」就能把当前播放时间写进选中的字幕；也可以直接在时间单元格里手改。如果结束时间不晚于开始时间，会自动设成开始后 1 秒。',
          ] },
          { type: 'heading', level: 3, text: '实例一：LRC 转 SRT，注意那个固定的 3 秒' },
          { type: 'paragraph', text: 'LRC 没有结束时间。工具的处理是：每行先默认持续 3 秒，如果下一行更早开始，就截到下一行开始为止。' },
          { type: 'code', language: 'text', code: `# 输入 LRC
[ti:Demo]
[00:12.00]Hello world
[00:15.50]Second line
[00:21.00]Third line

# 输出 SRT
1
00:00:12,000 --> 00:00:15,000
Hello world

2
00:00:15,500 --> 00:00:18,500
Second line

3
00:00:21,000 --> 00:00:24,000
Third line` },
          { type: 'paragraph', text: '注意第二行在 18.5 秒就消失了，而第三行 21 秒才出现，中间有 2.5 秒空白。如果你希望字幕一直挂到下一句出现，就需要在编辑器里把每条的结束时间改成下一条的开始时间。长间奏的歌词最容易遇到这种情况。' },
          { type: 'heading', level: 3, text: '实例二：SRT 转 VTT 给网页播放器用' },
          { type: 'code', language: 'text', code: `# 输入 SRT
1
00:00:01,000 --> 00:00:03,500
欢迎观看

# 输出 VTT
WEBVTT

00:00:01.000 --> 00:00:03.500
欢迎观看` },
          { type: 'code', language: 'html', code: `<video controls src="demo.mp4">
  <track kind="subtitles" src="demo.vtt" srclang="zh" label="中文" default>
</video>` },
          { type: 'paragraph', text: '网页里的 track 要求字幕文件与页面同源，或服务端返回允许跨域的响应头，并且 MIME 类型应为 text/vtt。在本地直接双击打开 HTML 时，浏览器往往因为 file:// 的限制不加载字幕，这不是字幕文件的问题。' },

          { type: 'heading', level: 2, text: '五、字幕常见故障与排查' },
          { type: 'table', headers: ['现象', '原因', '处理'], rows: [
            ['导入后提示没有有效字幕行', '文件不是 SRT/VTT/LRC，或时间行写法不符', '检查是否有 --> ；LRC 是否是 [分:秒.xx]'],
            ['VTT 里部分字幕没读到', '时间写成 01:02.500（省略小时），而工具要求「时:分:秒」三段', '手动补成 00:01:02.500 再导入'],
            ['中文变成乱码', '原文件是 GBK、Big5 等非 UTF-8 编码，工具按 UTF-8 读取', '先用文本编辑器另存为 UTF-8 再导入'],
            ['转 VTT 后位置、对齐设置没了', 'cue 设置（position、align）和 NOTE、STYLE 块不会被保留', '转换后需要手动在 VTT 中补回，或确认是否真的需要'],
            ['LRC 转出来整体偏早或偏晚', '原文件有 [offset:] 标签，工具会跳过它', '把偏移量手动折算到每条的时间里'],
            ['歌词一闪而过', 'LRC 无结束时间，默认只显示 3 秒', '在编辑器里延长结束时间'],
          ] },
          { type: 'heading', level: 3, text: '整体平移时间轴：工具没有一键功能时怎么办' },
          { type: 'paragraph', text: '字幕制作工具可以逐条设置开始和结束，但没有「全体延后 2.5 秒」这样的批量按钮。如果整条时间轴只是统一偏移，用下面这个小脚本对 SRT 文本做一次平移更省事，在浏览器开发者工具的控制台里粘贴运行即可，再把结果贴回字幕工具做最终检查。' },
          { type: 'code', language: 'javascript', code: `const shiftMs = 2500; // 正数延后，负数提前
const pad = (n, w) => String(n).padStart(w, '0');
function shiftSrt(srt) {
  return srt.replace(/(\\d{2}):(\\d{2}):(\\d{2}),(\\d{3})/g, (_, h, m, s, ms) => {
    const total = Math.max(0, ((+h * 60 + +m) * 60 + +s) * 1000 + +ms + shiftMs);
    return pad(Math.floor(total / 3600000), 2) + ':' +
      pad(Math.floor(total % 3600000 / 60000), 2) + ':' +
      pad(Math.floor(total % 60000 / 1000), 2) + ',' + pad(total % 1000, 3);
  });
}` },
          { type: 'callout', title: '在线校准、转换并导出', text: '导入字幕、加载本地视频或音频、边播放边校时，最后导出 SRT、VTT 或 LRC。字幕和媒体文件都留在浏览器里。', href: '/subtitle-maker', linkLabel: '打开字幕制作工具' },

          { type: 'heading', level: 2, text: '六、什么时候不该用这套方法' },
          { type: 'list', items: [
            '需要统计扫码次数、能随时改目标网址的「活码」：静态二维码一旦印出就改不了，这类需求要用带跳转服务的方案，并接受它的隐私和长期可用性代价。',
            '支付、登录凭证等高敏感内容：二维码只是编码，不是加密。',
            '超长文本：内容接近版本 40 的上限时模块极密，几乎无法可靠扫描，应改为链接或文件下载。',
            '带样式的字幕：ASS/SSA 的字体、颜色、卡拉 OK 特效，以及烧录进画面的硬字幕，不在 SRT/VTT/LRC 的表达范围内。',
            '自动听写：字幕制作工具负责编辑、校时和转换，本身不识别语音。',
            '逐字高亮的卡拉 OK 歌词：每行的时间标签之后的词级时间不会被解析。',
          ] },
        ],
        faq: [
          { question: '二维码在屏幕上能扫，印出来却扫不出，是为什么？', answer: '最常见的是静区不够。生成器默认静区是 2 个模块，印刷或深色背景下建议调到 4。其次是印刷分辨率太低导致模块边缘发虚，建议导出 1024 像素版本再缩放；再次是码被折痕、反光或相邻图形压住。先把印样拍照放进识别工具，能解说明图像基本合格。' },
          { question: 'Wi-Fi 二维码扫了没反应，该怎么检查？', answer: '先用识别工具读出内容，确认以 WIFI: 开头、字段用分号分隔、以两个分号结尾。再检查名称和密码里的反斜杠、分号、逗号、冒号和双引号是否各加了反斜杠。现代手机的系统相机一般能识别 Wi-Fi 码，但个别旧系统或第三方扫码应用只会把它当文字显示。' },
          { question: '二维码加了 logo 还能扫吗？logo 可以多大？', answer: '可以，但有代价。工具在加 logo 时会自动切到最高的 H 级纠错，并把 logo 框限制在边长 28% 左右。H 级会让同样内容的二维码更密，所以内容要尽量短。务必用实际印刷尺寸、多台设备测试，不要只看屏幕。' },
          { question: '转换成 VTT 后网页上字幕没显示，怎么办？', answer: '依次检查：文件首行是否为 WEBVTT；时间是否用点号而不是逗号；字幕文件是否与页面同源或允许跨域；服务端返回的类型是否为 text/vtt；本地用 file:// 打开往往会被浏览器拦截，需要用本地服务器预览。' },
          { question: '字幕乱码是工具的问题吗？', answer: '大多不是。工具按 UTF-8 读取文本文件，如果原字幕是 GBK 或 Big5 等旧编码，中文就会显示成乱码。用文本编辑器把文件另存为 UTF-8 后再导入，导出的文件也是 UTF-8。' },
          { question: '整个字幕比视频早了 3 秒，要一条条改吗？', answer: '字幕制作工具没有批量平移按钮。如果是统一偏移，可以用上文的小脚本对 SRT 文本整体加减毫秒再导入；如果偏移随时间变化（开头对得上、结尾越来越偏），说明是帧率或片源版本不同，需要在编辑器里分段校准。' },
        ],
      },
      en: {
        title: 'QR Code Won’t Scan or Subtitles Won’t Load? A Hands-On Guide to QR Payloads and SRT/VTT/LRC Conversion',
        excerpt:
          'From Wi-Fi QR escaping, error correction and quiet zones to the timestamp differences between SRT, VTT and LRC, here is how to debug “it will not scan” and “the player rejects it” with browser-local tools.',
        metaTitle: 'QR Codes That Scan and SRT/VTT/LRC Subtitle Conversion',
        metaDescription:
          'Make QR codes that scan (payload, error correction, quiet zone, Wi-Fi escaping) and convert SRT, VTT and LRC without breaking timing.',
        readingTime: '13 min read',
        tags: ['QR code tools', 'subtitle tools', 'WiFi QR code', 'SRT to VTT'],
        relatedTools: [
          { label: 'QR Code Generator', href: '/qr-code/generate', description: 'Generate URL, Wi-Fi and text QR codes locally with size, quiet zone, error correction and an optional center logo.' },
          { label: 'QR Code Decoder', href: '/qr-code/decode', description: 'Read a QR code from an image or the camera to verify it before printing.' },
          { label: 'Subtitle Maker', href: '/subtitle-maker', description: 'Edit and convert SRT, VTT and LRC with local audio or video preview for timing calibration.' },
        ],
        blocks: [
          { type: 'lead', text: 'QR codes and subtitle files look unrelated, but they share one trait: both are tiny interchange formats where a single wrong character makes the other device give up. A Wi-Fi QR code whose password contains an unescaped semicolon does nothing when scanned. An SRT file with a dot where the comma should be can make a player drop the cue entirely.' },
          { type: 'paragraph', text: 'This guide skips the tour of the interface and focuses on where things actually break: how to write the payload, how capacity and error correction trade off, how to choose size and quiet zone; and for subtitles, how the three formats differ in timestamp syntax, what is lost in conversion, and how to find and fix timing problems. Everything runs in the browser, so Wi-Fi passwords, unreleased video and subtitle drafts are not uploaded anywhere.' },

          { type: 'heading', level: 2, text: '1. Decide what goes inside the QR code before styling it' },
          { type: 'paragraph', text: 'A QR code only encodes a string as black and white modules. After the scanner decodes the string, the phone decides what to do with it, such as opening a page, joining Wi-Fi or saving a contact, based on conventions in the text itself. So the order is: get the text right first, then adjust size, color and error correction. The ToolGarden generator accepts any text and does not build Wi-Fi or contact payloads for you, so verifying the text is your job.' },
          { type: 'table', headers: ['Purpose', 'Payload', 'Common mistake'], rows: [
            ['Web page', 'https://example.com/promo?id=42', 'Leaving out https://, so the scan shows plain text instead of a link'],
            ['Wi-Fi', 'WIFI:T:WPA;S:NetworkName;P:password;;', 'Not backslash-escaping ; , : \\ " in the name or password; open networks should use T:nopass'],
            ['Phone', 'tel:+15551234567', 'Plain digits, which some cameras show as text only'],
            ['Email', 'mailto:hi@example.com?subject=Hello', 'Spaces and non-ASCII characters in the subject are not URL-encoded'],
            ['Contact', 'BEGIN:VCARD … END:VCARD', 'Line breaks swallowed; every field must sit on its own line'],
          ] },
          { type: 'heading', level: 3, text: 'Wi-Fi escaping, the trap most people fall into' },
          { type: 'paragraph', text: 'The Wi-Fi payload separates fields with semicolons, so a backslash, semicolon, comma, colon or double quote inside the network name or password must be preceded by a backslash. If the SSID or password happens to consist only of hex characters (for example 1234abcd), some parsers treat it as a hex string, and the usual workaround is to wrap it in double quotes. Hidden networks add an H:true field.' },
          { type: 'code', language: 'text', code: `# Ordinary WPA network
WIFI:T:WPA;S:Meeting-Room;P:abc12345;;

# Password contains a semicolon and a backslash: the real password is  pa;ss\\word
WIFI:T:WPA;S:Meeting-Room;P:pa\\;ss\\\\word;;

# Open network (no password)
WIFI:T:nopass;S:Guest;;

# Hidden network
WIFI:T:WPA;S:Hidden-Net;P:abc12345;H:true;;` },
          { type: 'callout', title: 'Get the text right, then generate', text: 'Paste the text above into the generator and you get a downloadable PNG within seconds. QR content is plain encoding, not encryption: anyone who scans a Wi-Fi code can read the password, so post only a guest-network code in public places.', href: '/qr-code/generate', linkLabel: 'Open the QR Code Generator' },

          { type: 'heading', level: 2, text: '2. Capacity, error correction and size: making it scan for real' },
          { type: 'paragraph', text: 'QR codes come in 40 versions. Version N has a side of 17 + 4N modules (version 1 is 21×21, version 40 is 177×177). Longer content needs a higher version, which means more modules, and at a fixed print size each module gets smaller. Error correction levels L, M, Q and H can recover roughly 7%, 15%, 25% and 30% of damaged data, at the price of more modules for the same content. Byte-mode capacities for a few common versions (in bytes) let you estimate where your content lands.' },
          { type: 'table', headers: ['Version (side)', 'L', 'M', 'Q', 'H'], rows: [
            ['1 (21×21)', '17', '14', '11', '7'],
            ['3 (29×29)', '53', '42', '32', '24'],
            ['5 (37×37)', '106', '84', '62', '44'],
            ['7 (45×45)', '154', '122', '86', '64'],
            ['10 (57×57)', '271', '213', '151', '119'],
          ] },
          { type: 'paragraph', text: 'Capacity is counted in UTF-8 bytes, so each CJK character costs 3 bytes and pushes the version up faster than the same number of Latin letters. The result panel shows the input byte count, so you can look it up in the table directly.' },
          { type: 'heading', level: 3, text: 'Worked example: a long tracking URL versus a short link' },
          { type: 'paragraph', text: 'Say you want a poster QR code for https://example.com/spring-sale?utm_source=poster&utm_medium=qr&utm_campaign=2026spring, which is 87 bytes. At the default M level, version 5 holds 84 bytes, which is not enough, so the code moves up to version 6 (41×41). A 28-byte short link, https://example.com/s/spring, does not fit in version 2 at M (26 bytes), so it lands on version 3 (29×29). The module count is exactly half (841 versus 1681). The generator defaults to 320 px output with a 2-module quiet zone: the 41×41 code plus quiet zone is 45 modules across, about 7 px per module, while the 29×29 code is 33 modules across, about 9.7 px per module. On the same poster area, the short link gives larger modules that are easier to focus on from a distance.' },
          { type: 'heading', level: 3, text: 'Size, quiet zone and scanning distance' },
          { type: 'list', items: [
            'Size: the generator accepts 160 to 1024 px, default 320. 240 px or more is usually enough on screen; for print, export 1024 px and scale down in your layout software, which is much sharper than enlarging a small image.',
            'Quiet zone: the specification calls for a blank border four modules wide, while the generator defaults to 2 (adjustable from 0 to 8). For print, or for a code on a dark background, raise it to 4. A quiet zone invaded by artwork, borders or neighboring text is the most common reason a code scans on screen but not on paper.',
            'Contrast: the generator draws near-black modules (#111111) on white, which is already maximum contrast. Do not invert it onto a dark background; some scanners handle inverted codes unreliably.',
            'Distance: a common rule of thumb is a scanning distance of about ten times the code width. A 2 cm code is comfortable at around 20 cm; for signage, work backwards from viewing distance.',
          ] },
          { type: 'heading', level: 3, text: 'What a center logo costs you' },
          { type: 'paragraph', text: 'When you upload a logo, the generator switches error correction to H automatically. The white rounded box behind the logo is 28% of the code side, about 7.8% of the area (0.28² ≈ 0.078), and the logo itself is 22% of the side. The hidden data is covered by the roughly 30% redundancy of level H, so do not expect to enlarge the logo further. More importantly, level H raises the version for the same content: a 40-byte URL is version 3 (29×29) at M but version 5 (37×37) at H, so modules shrink and scanning distance drops. If the code is going on a small label, skip the logo.' },

          { type: 'heading', level: 2, text: '3. Decoding and verifying: let a second device read it before you print' },
          { type: 'paragraph', text: 'The QR Code Decoder accepts PNG, JPG, WebP, GIF and BMP images (up to 12 MB and 24 million pixels each) or a live camera feed. Both are decoded locally with jsQR; images and video frames are not sent anywhere, and inverted patterns are tried as well. It helps in three ways.' },
          { type: 'list', ordered: true, items: [
            'Pre-print verification: drop in the PNG you are about to send to the printer and check that the decoded text matches what you typed character for character, especially Wi-Fi escaping and URL parameters.',
            'Inspecting unknown codes safely: read the text first and decide whether to visit it, instead of letting the phone camera jump straight to a link. Shortened links and long tracking URLs become obvious.',
            'Locating “it won’t scan”: drop in a photo taken on site. If the tool cannot decode it either, the problem is usually the image (glare, tilt, tiny modules, invaded quiet zone). If the tool decodes it but the phone does not, suspect the payload (Wi-Fi escaping, a scheme the OS does not handle).',
          ] },
          { type: 'table', headers: ['Symptom', 'Most likely cause', 'How to check'], rows: [
            ['Scans on screen, not on paper', 'Quiet zone invaded, low print resolution, ink bleed', 'Export 1024 px, set quiet zone to 4, photograph the proof and decode it'],
            ['Scan returns garbled text', 'Content truncated or mis-encoded', 'Compare the decoded text with the original; check the byte count against version capacity'],
            ['Wi-Fi code does nothing', 'Header is not WIFI:, or special characters are unescaped', 'Decode it and inspect each field for semicolons and backslashes'],
            ['Scans sometimes after adding a logo', 'Logo area uses up the H-level redundancy', 'Use a smaller logo, or drop it and shorten the content'],
            ['Fails far away, works close up', 'Modules too small', 'Shorten the content (use a short link) or print larger'],
          ] },
          { type: 'callout', title: 'Use the decoder as the last gate', text: 'Dropping the generated PNG or an on-site photo into the decoder is more reliable than trying it once on your phone, because it shows the raw decoded text in full for a character-by-character comparison.', href: '/qr-code/decode', linkLabel: 'Open the QR Code Decoder' },

          { type: 'heading', level: 2, text: '4. Subtitles: how SRT, VTT and LRC differ' },
          { type: 'paragraph', text: 'All three are plain text. They differ in how timestamps are written and what extra information they can carry. Knowing those differences explains what is lost in conversion and why a player might reject a file.' },
          { type: 'table', headers: ['Item', 'SRT', 'WebVTT', 'LRC'], rows: [
            ['Timestamp', '00:01:02,500 (comma before milliseconds)', '00:01:02.500 (dot); hours may be omitted: 01:02.500', '[01:02.50] (min:sec.centiseconds)'],
            ['End time', 'Yes, start --> end', 'Yes, same as SRT', 'Usually start only; ends when the next line starts'],
            ['File header', 'None; each cue starts with an index', 'Must begin with WEBVTT', 'May carry tags such as [ti:] and [ar:]'],
            ['Extras', 'Practically none (HTML tags often sneak in)', 'Position and alignment settings, NOTE comments, STYLE blocks', 'Line-level sync; some extensions add per-word timing'],
            ['Typical use', 'Desktop players, editors, video-platform uploads', 'The track element of an HTML video', 'Music-player lyrics'],
          ] },
          { type: 'heading', level: 3, text: 'What the tool actually does (verified in the source)' },
          { type: 'list', items: [
            'Format detection checks the file extension first (.vtt, .srt, .lrc), then whether the content starts with WEBVTT (BOM tolerated), then whether it contains -->, in which case it is treated as SRT; otherwise it is LRC.',
            'SRT export always renumbers cues from 1 and sorts them by start time. VTT export adds the WEBVTT header. LRC export writes each line as [mm:ss.cc]<mm:ss.cc>text, with both start and end, and collapses multi-line text into one line.',
            'When importing LRC, tag lines such as [ti:], [ar:], [al:], [by:] and [offset:] are skipped, and [offset:] is not applied to the timestamps.',
            'An LRC line with several time tags (a repeated chorus) is expanded into several cues.',
            'The editor can load local audio or video. Click a row to jump to that time; play to a position and press Set start or Set end to write the current playback time into the selected cue; or edit the time cells by hand. If the end is not later than the start, it is set to start plus one second.',
          ] },
          { type: 'heading', level: 3, text: 'Example 1: LRC to SRT, and the fixed three seconds' },
          { type: 'paragraph', text: 'LRC has no end times. The tool gives every line a default duration of 3 seconds and cuts it short only if the next line starts earlier.' },
          { type: 'code', language: 'text', code: `# Input LRC
[ti:Demo]
[00:12.00]Hello world
[00:15.50]Second line
[00:21.00]Third line

# Output SRT
1
00:00:12,000 --> 00:00:15,000
Hello world

2
00:00:15,500 --> 00:00:18,500
Second line

3
00:00:21,000 --> 00:00:24,000
Third line` },
          { type: 'paragraph', text: 'Notice that the second line disappears at 18.5 s while the third appears at 21 s, leaving a 2.5 s gap. If you want a line to stay until the next one appears, set each end time to the next start time in the editor. Lyrics with long instrumental breaks hit this the most.' },
          { type: 'heading', level: 3, text: 'Example 2: SRT to VTT for a web player' },
          { type: 'code', language: 'text', code: `# Input SRT
1
00:00:01,000 --> 00:00:03,500
Welcome

# Output VTT
WEBVTT

00:00:01.000 --> 00:00:03.500
Welcome` },
          { type: 'code', language: 'html', code: `<video controls src="demo.mp4">
  <track kind="subtitles" src="demo.vtt" srclang="en" label="English" default>
</video>` },
          { type: 'paragraph', text: 'A track file must be same-origin with the page, or served with CORS headers that allow it, and should have the MIME type text/vtt. Opening the HTML directly from disk often fails to load subtitles because of file:// restrictions, which is not a problem with the subtitle file itself.' },

          { type: 'heading', level: 2, text: '5. Common subtitle failures and how to diagnose them' },
          { type: 'table', headers: ['Symptom', 'Cause', 'Fix'], rows: [
            ['“No valid subtitle lines” after import', 'Not really SRT/VTT/LRC, or timing lines are malformed', 'Check for --> ; for LRC, check the [mm:ss.xx] form'],
            ['Some VTT cues are missing', 'Timestamps like 01:02.500 omit hours, while the tool expects hh:mm:ss', 'Prefix them to 00:01:02.500 and import again'],
            ['Non-ASCII text is garbled', 'The file is GBK, Big5 or another non-UTF-8 encoding, and the tool reads UTF-8', 'Re-save as UTF-8 in a text editor first'],
            ['Position/alignment lost after converting to VTT', 'Cue settings, NOTE and STYLE blocks are not preserved', 'Re-add them by hand afterwards, or check you really need them'],
            ['LRC output is uniformly early or late', 'The source has an [offset:] tag, which is skipped', 'Fold the offset into each timestamp manually'],
            ['Lyrics flash and vanish', 'LRC has no end time, so each line shows for 3 s by default', 'Lengthen the end times in the editor'],
          ] },
          { type: 'heading', level: 3, text: 'Shifting the whole timeline when there is no one-click button' },
          { type: 'paragraph', text: 'The editor lets you set each cue’s start and end, but it has no “delay everything by 2.5 s” button. If the whole track is off by a constant, it is quicker to shift the SRT text once with the snippet below, pasted into the browser developer console, and then load the result back into the editor for a final check.' },
          { type: 'code', language: 'javascript', code: `const shiftMs = 2500; // positive delays, negative advances
const pad = (n, w) => String(n).padStart(w, '0');
function shiftSrt(srt) {
  return srt.replace(/(\\d{2}):(\\d{2}):(\\d{2}),(\\d{3})/g, (_, h, m, s, ms) => {
    const total = Math.max(0, ((+h * 60 + +m) * 60 + +s) * 1000 + +ms + shiftMs);
    return pad(Math.floor(total / 3600000), 2) + ':' +
      pad(Math.floor(total % 3600000 / 60000), 2) + ':' +
      pad(Math.floor(total % 60000 / 1000), 2) + ',' + pad(total % 1000, 3);
  });
}` },
          { type: 'callout', title: 'Calibrate, convert and export', text: 'Import subtitles, load a local video or audio file, tune timing while it plays, then export SRT, VTT or LRC. Both the subtitles and the media stay in your browser.', href: '/subtitle-maker', linkLabel: 'Open Subtitle Maker' },

          { type: 'heading', level: 2, text: '6. When not to use this approach' },
          { type: 'list', items: [
            'Dynamic codes that need scan analytics or an editable destination: a static QR code cannot be changed once printed. Those needs call for a redirect service, with its privacy and longevity trade-offs.',
            'Payments and login credentials: a QR code is encoding, not encryption.',
            'Very long text: near the version 40 limit the modules are so dense that reliable scanning is unrealistic. Use a link or a file download instead.',
            'Styled subtitles: ASS/SSA fonts, colors and karaoke effects, as well as burned-in hard subtitles, are outside what SRT, VTT and LRC can express.',
            'Speech transcription: the subtitle tool edits, times and converts; it does not recognize speech itself.',
            'Word-by-word karaoke highlighting: word-level timestamps after the line timestamp are not parsed.',
          ] },
        ],
        faq: [
          { question: 'My QR code scans on screen but not when printed. Why?', answer: 'The most common cause is a quiet zone that is too small. The generator defaults to 2 modules; for print or dark backgrounds raise it to 4. Next is low print resolution that blurs module edges, so export the 1024 px version and scale down. Then check for folds, glare or neighboring graphics touching the code. Photograph the proof and drop it into the decoder: if it decodes, the image is basically sound.' },
          { question: 'A Wi-Fi QR code does nothing when scanned. What should I check?', answer: 'Decode it first and confirm the text starts with WIFI:, fields are separated by semicolons and the text ends with two semicolons. Then check that every backslash, semicolon, comma, colon and double quote inside the name or password is escaped with a backslash. Modern phone cameras generally recognize Wi-Fi codes, but some older systems or third-party scanner apps only display them as text.' },
          { question: 'Can I put a logo in the middle, and how big can it be?', answer: 'Yes, with a cost. When you add a logo the tool switches to the highest error-correction level (H) and limits the logo box to about 28% of the code side. Level H makes the same content denser, so keep the content short. Always test at the real print size on several devices rather than judging from the screen.' },
          { question: 'Subtitles do not show on my web page after converting to VTT. What now?', answer: 'Check in order: the first line must be WEBVTT; timestamps must use dots, not commas; the file must be same-origin or served with permissive CORS; the server should return text/vtt; and opening the page from file:// is often blocked, so use a local server for previews.' },
          { question: 'Is garbled subtitle text the tool’s fault?', answer: 'Usually not. The tool reads text files as UTF-8, so a GBK or Big5 file shows garbled characters. Re-save it as UTF-8 in a text editor and import again; the exported file will be UTF-8 too.' },
          { question: 'The whole track is 3 seconds early. Do I have to fix every line?', answer: 'There is no bulk shift button in the editor. For a constant offset, use the snippet above to add or subtract milliseconds on the SRT text and re-import. If the offset grows over time (right at the start, increasingly wrong later), the frame rate or the video cut differs, and you will need to calibrate in segments in the editor.' },
        ],
      },
    },
  },
  {
    slug: 'complete-guide-browser-local-data-processing',
    publishedAt: '2026-07-20',
    updatedAt: '2026-10-14',
    translations: {
      zh: {
        title: '在线工具会不会偷偷上传我的文件？浏览器本地处理的原理与自查方法',
        excerpt:
          '「不上传」不是一句口号，而是可以用开发者工具验证的数据路径。本文讲清浏览器本地处理的技术基础、怎样用 Network 面板自查、哪些请求是正常的，以及本地处理的真实边界。',
        metaTitle: '在线工具会上传文件吗？浏览器本地处理自查指南',
        metaDescription:
          '讲清浏览器本地处理如何工作，教你用开发者工具 Network 面板验证「不上传」，并说明离线能力、资源限制与安全边界。',
        readingTime: '12 分钟',
        tags: ['浏览器本地处理', '隐私工具', '无需上传', '客户端处理'],
        relatedTools: [
          { label: 'JSON 格式化', href: '/json-format', description: '粘贴 JSON 后在本地格式化、校验，适合拿来做「不上传」的第一次自查。' },
          { label: '图片工具', href: '/image', description: '压缩、转换、加水印等图片处理，在 Worker 与 Canvas 中本地完成。' },
          { label: 'PDF 工具', href: '/pdf', description: '合并、拆分、加水印等 PDF 操作，文件不经过服务器。' },
        ],
        blocks: [
          { type: 'lead', text: '把合同、证件照或带密钥的接口日志丢进一个陌生的在线转换器之前，多数人心里都会犯嘀咕：它会不会把文件传到服务器上？「我们不保存您的文件」这种承诺听上去不错，但你没法验证。浏览器本地处理的价值恰恰在于：它把「信不信」变成了「能不能查」。' },
          { type: 'paragraph', text: '这篇文章从数据路径讲起，说明浏览器为什么有能力在本地完成这些任务，然后给出一套你自己就能做的自查步骤（Network 面板、离线测试、控制台脚本），列出哪些网络请求是正常的、哪些该警惕，最后讲本地处理保护不了什么，以及哪些场景根本不该用浏览器。文中的数字和行为都来自 ToolGarden 的源码，而不是营销话术。' },

          { type: 'heading', level: 2, text: '一、关键区别：文件走的是哪条路' },
          { type: 'paragraph', text: '传统在线转换器的流程是：浏览器把文件上传到服务器，服务器处理，再把结果发回来下载。浏览器本地处理则是：页面把程序代码（HTML、JavaScript、WebAssembly、必要时的模型文件）下载下来之后，用这些代码直接读取你选中的文件、在本机完成计算、把结果交给你保存。判断标准只有一条：开始处理之后，你的文件内容有没有出现在任何网络请求里。' },
          { type: 'table', headers: ['维度', '服务器处理', '浏览器本地处理'], rows: [
            ['文件路径', '上传 → 服务器 → 下载', '读取 → 本机计算 → 保存，不经过网络'],
            ['隐私暴露面', '服务器日志、存储桶、队列、第三方服务都可能接触文件', '文件只在当前标签页内存中；需要信任的是页面代码本身'],
            ['速度瓶颈', '上传与下载带宽', '本机 CPU、内存与浏览器限制'],
            ['文件大小', '取决于服务端配额', '取决于设备内存，工具会设上限（例如 ToolGarden 图片工具为 50MB）'],
            ['离线可用', '不可用', '页面和所需资源缓存之后，部分工具可离线使用'],
            ['可验证性', '只能相信隐私政策', '可以用开发者工具直接观察网络请求'],
            ['算力', '可使用 GPU 集群和大模型', '受限于用户设备，只能跑体积较小的模型'],
          ] },

          { type: 'heading', level: 2, text: '二、浏览器到底能在本地做什么' },
          { type: 'paragraph', text: '这些能力都是浏览器的标准接口，不依赖任何插件：' },
          { type: 'list', items: [
            'File 与 Blob：通过文件选择器、拖放或粘贴读取文件，内容直接进入页面内存。预览用的是 URL.createObjectURL 生成的本地临时地址，不是网络地址。',
            'Canvas：解码图片、缩放、叠加文字、重新编码为 JPG、PNG、WebP。ToolGarden 的图片格式转换优先交给 Web Worker 执行，失败才回退到主线程，页面上也会注明本地 Worker 优先、文件不上传。',
            'Web Worker：把耗时计算放到后台线程，页面不会卡住。',
            'WebAssembly 与 ONNX Runtime：把原本在服务器上运行的解码器、编码器和 AI 模型搬到浏览器里。ToolGarden 的去水印使用 MI-GAN 和 LaMa 两个 ONNX 模型，在本地推理；首次使用时会下载模型文件（MI-GAN 约 28MB），之后推理不再把图片发给任何服务。',
            'MediaDevices：二维码识别可以直接打开摄像头，用 jsQR 在本地逐帧解码，视频帧不会离开设备。',
            'IndexedDB 与 Cache Storage：缓存模型和静态资源，让第二次使用更快，也是离线能力的基础。',
          ] },

          { type: 'heading', level: 2, text: '三、三步自查：用 Network 面板证明「没有上传」' },
          { type: 'paragraph', text: '不要相信页面上的「隐私保护」徽章，自己查一次只需要两分钟。关键点是先让页面把程序资源全部加载完，再清空记录，然后才选文件，这样列表里剩下的就都是处理过程中产生的请求。' },
          { type: 'list', ordered: true, items: [
            '打开开发者工具（Windows 与 Linux 为 F12，macOS 为 Option + Command + I），切到 Network 面板，勾选 Preserve log。',
            '先把页面和工具完整加载一遍，等请求停下来，点「清空」按钮（圆圈加斜线图标）。',
            '选一个无害的样本文件执行转换，观察新增请求。用「Fetch/XHR」「WS」过滤，再切回「All」看一遍。',
          ] },
          { type: 'table', headers: ['看到的请求', '含义', '是否可疑'], rows: [
            ['没有任何新请求', '处理完全在本地完成', '最理想'],
            ['GET，加载 .wasm、.onnx、.js、字体', '按需下载程序、模型或字体', '正常，注意看方向是下载'],
            ['POST/PUT，请求体大小接近你的文件', '文件内容被发出去了', '确认是上传'],
            ['Content-Type 为 multipart/form-data', '典型的表单文件上传', '高度可疑，除非是你主动提交的表单'],
            ['WebSocket 持续有帧', '可能在流式传输数据', '需看帧内容和大小'],
            ['类型为 ping 或 beacon 的小请求', '统计、错误上报', '检查载荷是否包含文件名或内容'],
          ] },
          { type: 'heading', level: 3, text: '实例：用一个 20MB 的图片做测试' },
          { type: 'paragraph', text: '用一张 20MB 左右的图片测试时，如果选文件之后出现了一个 POST，请求体也是 20MB 上下，那就是上传无疑；如果列表里要么没有新请求，要么只有几百字节的统计 ping，那么 20MB 的数据没有从这个页面发出去。注意比较的是请求体（Network 面板的 Request payload 与 Size 列），而不是页面整体流量。' },
          { type: 'heading', level: 3, text: '用控制台脚本补一道保险' },
          { type: 'paragraph', text: '有些上传发生在选文件之后的任意时刻，Network 面板又很长，肉眼容易漏。可以在控制台贴一段脚本，把页面主线程上的 fetch、XMLHttpRequest 和 sendBeacon 的载荷类型和大小都打印出来。' },
          { type: 'code', language: 'javascript', code: `const describe = (b) =>
  b == null ? 'none'
  : b instanceof Blob ? 'Blob ' + b.size + 'B'
  : b instanceof ArrayBuffer ? 'ArrayBuffer ' + b.byteLength + 'B'
  : typeof b === 'string' ? 'string ' + b.length + ' chars'
  : b.constructor.name;

const _fetch = window.fetch;
window.fetch = (input, init) => {
  console.log('[net] fetch', input.url ?? String(input), describe(init?.body));
  return _fetch(input, init);
};

const _send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (body) {
  console.log('[net] xhr', describe(body));
  return _send.call(this, body);
};

if (navigator.sendBeacon) {
  const _beacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    console.log('[net] beacon', url, describe(data));
    return _beacon(url, data);
  };
}` },
          { type: 'paragraph', text: '局限要说清楚：这段脚本只覆盖主线程。如果处理发生在 Web Worker 里（ToolGarden 的图片转换就是），Worker 里的请求不会被它捕获，但 Network 面板仍然会列出。所以脚本是补充，不能替代 Network 面板。' },
          { type: 'heading', level: 3, text: '离线测试：最干脆的证据' },
          { type: 'paragraph', text: '把页面和工具加载完（如果工具要下载模型，等模型下载完），然后在 Network 面板把节流选项切到 Offline，或者直接断开 Wi-Fi，再选文件处理。能正常得到结果，说明处理过程不依赖服务器。如果提示联网失败，要分辨是「首次需要下载模型或页面资源」，还是「处理本身必须访问服务器」，前者可以先联网加载一次再测，后者就是服务端处理。' },
          { type: 'callout', title: '最简单的第一次自查', text: '打开 JSON 格式化，开着 Network 面板粘贴一段 JSON 并格式化，观察有没有新请求。纯文本的 JSON 处理最容易看清楚，再用同样方法检查图片、PDF 等其它工具。', href: '/json-format', linkLabel: '打开 JSON 格式化' },

          { type: 'heading', level: 2, text: '四、哪些请求是正常的，不等于上传' },
          { type: 'paragraph', text: '本地处理不等于页面完全没有网络活动。以下几类都是正常的，关键是区分「下载程序」与「发送你的数据」：' },
          { type: 'list', items: [
            '页面与代码分块：打开工具页时下载的 HTML、JS、CSS。',
            '模型与 WebAssembly：ToolGarden 的部分模型和运行时放在自己的站点目录里（如 OCR、图像增强、放大），去水印使用的 MI-GAN 与 LaMa 模型则是从 Hugging Face 下载，首次使用约 28MB 的 MI-GAN；这些都是下载，不会带上你的图片。',
            '第三方脚本：如果站点接入了统计或广告，页面会产生额外请求。它们不应该包含文件内容，用上面的方法验证即可，不必凭印象判断。',
            '字体和图标：多为 GET 请求，没有请求体。',
          ] },

          { type: 'heading', level: 2, text: '五、本地处理保护什么，不保护什么' },
          { type: 'table', headers: ['风险', '本地处理能否缓解', '说明'], rows: [
            ['服务端日志、存储桶、队列里留下文件', '能', '文件根本没有到过服务器'],
            ['传输过程被截获', '基本能', '没有上传就没有文件的传输过程，但页面代码本身仍然走 HTTPS'],
            ['页面代码被篡改或被恶意脚本注入', '不能', '被篡改的页面可以读取你选中的任何文件，所以要确认是正确域名的 HTTPS'],
            ['恶意浏览器扩展', '不能', '扩展可以读取页面内容，装的扩展越多风险越大'],
            ['共享或不受信任的电脑', '不能', '文件可能留在下载文件夹、浏览器缓存或系统缩略图中'],
            ['用户自己把结果发给别人', '不能', '本地处理只保证处理过程，不管你之后怎么分享'],
          ] },

          { type: 'heading', level: 2, text: '六、真实的资源限制' },
          { type: 'paragraph', text: '浏览器标签页没有服务器那样的算力和内存，所以好的本地工具会明确设置上限，而不是让页面卡死。以下数字来自 ToolGarden 源码：' },
          { type: 'table', headers: ['场景', '限制'], rows: [
            ['图片转换、去水印、加水印等', '单个文件不超过 50MB，像素不超过 4000 万'],
            ['二维码识别', '单个图片不超过 12MB，像素不超过 2400 万'],
            ['AI 图片放大、图像增强', '源图像素不超过 400 万'],
            ['二维码 logo', '不超过 4MB，像素不超过 400 万'],
            ['音频分轨模型', '模型文件较大，Service Worker 的注释中提到约 130MB 的独立缓存'],
          ] },
          { type: 'paragraph', text: '遇到限制提示时，不要当成工具坏了：先缩小图片再处理，或者分批处理，避免一次把整个文件夹拖进去。' },

          { type: 'heading', level: 2, text: '七、离线能力到底到什么程度' },
          { type: 'paragraph', text: '站点注册了 Service Worker 和 Web App Manifest，因此可以安装为 PWA。它的缓存策略是：构建产物（/_next/static/）优先读缓存，页面路径优先走网络、网络失败时回退到缓存，其它 GET 请求同样先网络后缓存。这意味着：你访问过的页面和用到的静态资源，断网后一般还能打开；但是没有访问过的工具、没有下载过的模型，离线时不会凭空出现。想要离线使用某个工具，正确做法是联网时先打开它并跑一次完整流程。' },

          { type: 'heading', level: 2, text: '八、什么时候不该用浏览器本地处理' },
          { type: 'list', items: [
            '需要审计留痕的合规场景：如果制度要求处理过程有可追溯的服务器日志，本地处理反而缺乏记录。',
            '多 GB 级文件或长时间批处理：浏览器内存和单标签页算力有限，桌面软件或受控的服务端更合适。',
            '复杂的 Office 排版保真：把版式复杂的文档在浏览器里转格式，往往没有专业桌面软件可靠。',
            '多人协作、需要共享状态：本地处理天然是单机的。',
            '设备本身不可信：在网吧或他人电脑上，本地处理的隐私优势会被设备风险抵消。',
          ] },
          { type: 'heading', level: 3, text: '选择工具时的检查清单' },
          { type: 'list', items: [
            '用样本文件和 Network 面板验证一次，确认没有携带文件内容的上传请求。',
            '确认输出格式保留了你需要的细节（例如透明度、字体、元数据）。',
            '大批量处理之前，先看工具说明的文件大小和浏览器兼容性限制。',
            '涉及敏感文件时，用隐私窗口，关闭不必要的扩展，处理完清理下载目录。',
          ] },
          { type: 'callout', title: '图片和 PDF 也可以这样验证', text: '图片工具与 PDF 工具使用相同的本地处理思路。把上面的步骤套用在压缩一张图片或合并两个 PDF 上，观察 Network 面板就能得到自己的结论。', href: '/image', linkLabel: '打开图片工具' },
        ],
        faq: [
          { question: '「不上传」的页面还会有网络请求吗？', answer: '会，但应该只有下载：页面代码、模型、字体等。关键是看开始处理之后有没有携带文件内容的 POST/PUT 或 WebSocket 数据帧。用 Network 面板比较请求体大小与文件大小，是最直接的判断。' },
          { question: '本地处理的工具是不是一定更安全？', answer: '不一定。它减少了服务端暴露面，但你仍然需要信任页面代码本身、使用正确域名的 HTTPS、避免可疑扩展，并且不在不受信任的设备上处理敏感文件。本地处理降低风险，不是消除风险。' },
          { question: '断网之后还能用吗？', answer: '看工具和你之前是否加载过。访问过的页面与静态资源通常会被缓存，断网后能打开；但没有下载过的模型和资源离线时无法获取。建议联网时先完整运行一次想离线使用的工具。' },
          { question: '为什么去水印要先下载 28MB 的模型？', answer: '因为 AI 补全是在你的浏览器里运行的，模型文件必须先下载到本机。下载的是模型，不包含你的图片；模型加载完成之后，推理在本地完成。' },
          { question: '大文件处理很慢或失败，是工具的问题吗？', answer: '多半是浏览器资源限制。图片工具对单文件有 50MB 与 4000 万像素的上限，AI 放大对源图有 400 万像素的上限。先缩小图片、分批处理，或者对超大文件改用桌面软件。' },
          { question: '怎么知道页面上的统计脚本没有上传我的文件？', answer: '同样用 Network 面板：筛选出非本站域名的请求，查看它们的载荷。统计请求通常只有几百字节，并且不会出现文件名或内容；如果你看到与文件大小相当的请求体，才需要警惕。' },
        ],
      },
      en: {
        title: 'Do Online Tools Secretly Upload My Files? How Browser-Local Processing Works and How to Check It',
        excerpt:
          '“No upload” is not a slogan; it is a data path you can verify with developer tools. This guide explains how browser-local processing works, how to audit it with the Network panel, which requests are normal, and where the real limits are.',
        metaTitle: 'Do Online Tools Upload Your Files? A Local Check',
        metaDescription:
          'How browser-local processing works, how to verify “no upload” in the Network panel, and what offline use, limits and security boundaries to expect.',
        readingTime: '12 min read',
        tags: ['browser local processing', 'privacy-first tools', 'no upload', 'client-side'],
        relatedTools: [
          { label: 'JSON Formatter', href: '/json-format', description: 'Paste JSON and format or validate it locally; a good first no-upload test.' },
          { label: 'Image Tools', href: '/image', description: 'Compression, conversion, watermarking and more, done locally with Workers and Canvas.' },
          { label: 'PDF Tools', href: '/pdf', description: 'Merge, split and watermark PDFs without the file passing through a server.' },
        ],
        blocks: [
          { type: 'lead', text: 'Before dropping a contract, an ID photo or an API log full of keys into an unfamiliar online converter, most people wonder whether the file is being sent to a server. “We do not keep your files” sounds reassuring, but you cannot verify it. The value of browser-local processing is that it turns “do you trust them” into “can you check”.' },
          { type: 'paragraph', text: 'This guide starts from the data path and explains why a browser is able to do this work locally. It then gives you a set of checks you can run yourself (the Network panel, an offline test, a console snippet), lists which network requests are normal and which should worry you, and ends with what local processing does not protect against and which jobs do not belong in a browser at all. The numbers and behaviors cited here come from the ToolGarden source code, not from marketing copy.' },

          { type: 'heading', level: 2, text: '1. The key difference: which road does the file take?' },
          { type: 'paragraph', text: 'A traditional online converter works like this: the browser uploads the file, the server processes it, and the result is sent back for download. Browser-local processing works differently: the page downloads its program code (HTML, JavaScript, WebAssembly and, when needed, model files), then uses that code to read the file you picked, compute on your machine and hand the result back for saving. There is only one test that matters: after processing starts, does your file content appear in any network request?' },
          { type: 'table', headers: ['Dimension', 'Server-side processing', 'Browser-local processing'], rows: [
            ['File path', 'Upload, server, download', 'Read, compute locally, save; no network in between'],
            ['Privacy exposure', 'Server logs, buckets, queues and third-party services may touch the file', 'The file lives in the tab’s memory; what you must trust is the page code itself'],
            ['Speed bottleneck', 'Upload and download bandwidth', 'Local CPU, memory and browser limits'],
            ['File size', 'Server quota', 'Device memory; tools set caps (ToolGarden’s image tools cap at 50 MB)'],
            ['Offline', 'Not possible', 'Some tools work offline once the page and resources are cached'],
            ['Verifiability', 'You can only trust the privacy policy', 'You can observe network requests in developer tools'],
            ['Compute power', 'GPU clusters and large models', 'Limited to the user’s device; only smaller models are practical'],
          ] },

          { type: 'heading', level: 2, text: '2. What a browser can actually do locally' },
          { type: 'paragraph', text: 'All of these are standard browser interfaces and need no plugins:' },
          { type: 'list', items: [
            'File and Blob: read files from a picker, drag and drop or paste; the content goes straight into page memory. Previews use temporary local addresses from URL.createObjectURL, not network addresses.',
            'Canvas: decode images, resize, overlay text and re-encode as JPG, PNG or WebP. ToolGarden runs image format conversion in a Web Worker first and falls back to the main thread only if needed; the page itself notes that the local Worker is preferred and files are not uploaded.',
            'Web Workers: move heavy computation to a background thread so the page stays responsive.',
            'WebAssembly and ONNX Runtime: bring decoders, encoders and AI models that used to run on servers into the browser. ToolGarden’s watermark removal uses the MI-GAN and LaMa ONNX models for local inference; the first run downloads the model files (about 28 MB for MI-GAN), after which inference sends your image nowhere.',
            'MediaDevices: the QR decoder can open the camera and decode frames locally with jsQR; video frames do not leave the device.',
            'IndexedDB and Cache Storage: cache models and static assets so the second visit is faster, which is also the basis of offline use.',
          ] },

          { type: 'heading', level: 2, text: '3. A three-step audit: prove “no upload” with the Network panel' },
          { type: 'paragraph', text: 'Do not trust a privacy badge on the page; checking for yourself takes two minutes. The key is to let the page finish loading all of its program resources first, clear the log, and only then pick a file, so that everything left in the list was caused by the processing.' },
          { type: 'list', ordered: true, items: [
            'Open developer tools (F12 on Windows and Linux, Option + Command + I on macOS), go to the Network panel and tick Preserve log.',
            'Load the page and the tool fully, wait for requests to settle, then click the clear button (the circle with a slash).',
            'Run a conversion on a harmless sample file and watch for new requests. Filter by Fetch/XHR and WS, then look at All again.',
          ] },
          { type: 'table', headers: ['What you see', 'What it means', 'Suspicious?'], rows: [
            ['No new requests', 'Processing happened locally', 'Ideal'],
            ['GET for .wasm, .onnx, .js, fonts', 'On-demand download of code, a model or fonts', 'Normal; note the direction is download'],
            ['POST/PUT with a body close to your file size', 'The file content was sent out', 'That is an upload'],
            ['Content-Type multipart/form-data', 'A classic form file upload', 'Highly suspicious unless you submitted a form'],
            ['WebSocket with continuing frames', 'Data may be streaming out', 'Inspect frame content and size'],
            ['Small requests of type ping or beacon', 'Analytics or error reporting', 'Check whether the payload contains file names or content'],
          ] },
          { type: 'heading', level: 3, text: 'Example: testing with a 20 MB image' },
          { type: 'paragraph', text: 'Test with an image of around 20 MB. If a POST appears after you select the file and its request body is also around 20 MB, that is an upload. If the list shows either nothing new or only a tiny analytics ping of a few hundred bytes, then 20 MB of data did not leave this page. Compare the request body (Request payload and the Size column in the Network panel), not the page’s overall traffic.' },
          { type: 'heading', level: 3, text: 'Add a safety net with a console snippet' },
          { type: 'paragraph', text: 'Some uploads happen at any moment after you pick the file, and a long Network list is easy to skim past. Paste the script below into the console to print the payload type and size for fetch, XMLHttpRequest and sendBeacon calls on the main thread.' },
          { type: 'code', language: 'javascript', code: `const describe = (b) =>
  b == null ? 'none'
  : b instanceof Blob ? 'Blob ' + b.size + 'B'
  : b instanceof ArrayBuffer ? 'ArrayBuffer ' + b.byteLength + 'B'
  : typeof b === 'string' ? 'string ' + b.length + ' chars'
  : b.constructor.name;

const _fetch = window.fetch;
window.fetch = (input, init) => {
  console.log('[net] fetch', input.url ?? String(input), describe(init?.body));
  return _fetch(input, init);
};

const _send = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function (body) {
  console.log('[net] xhr', describe(body));
  return _send.call(this, body);
};

if (navigator.sendBeacon) {
  const _beacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    console.log('[net] beacon', url, describe(data));
    return _beacon(url, data);
  };
}` },
          { type: 'paragraph', text: 'The limitation matters: this only covers the main thread. If processing happens in a Web Worker (ToolGarden’s image conversion does), requests made inside the Worker are not caught by the script, although the Network panel still lists them. Treat the script as a supplement, never a replacement for the panel.' },
          { type: 'heading', level: 3, text: 'The offline test: the cleanest evidence' },
          { type: 'paragraph', text: 'Load the page and the tool (and wait for any model download to finish), then set throttling to Offline in the Network panel or simply disconnect Wi-Fi, and process a file. If you still get a result, the processing does not depend on a server. If it fails with a connection error, work out whether it needed a first-time download of a model or page resource, which you can fix by loading once online and testing again, or whether the processing itself requires a server, which means server-side processing.' },
          { type: 'callout', title: 'The easiest first audit', text: 'Open the JSON Formatter with the Network panel visible, paste some JSON, format it, and look for new requests. Plain-text JSON is the easiest case to read; then repeat the same method on image and PDF tools.', href: '/json-format', linkLabel: 'Open JSON Formatter' },

          { type: 'heading', level: 2, text: '4. Which requests are normal, and are not uploads' },
          { type: 'paragraph', text: 'Local processing does not mean zero network activity. The following are normal; the point is to tell “downloading the program” from “sending your data”.' },
          { type: 'list', items: [
            'The page and code chunks: HTML, JS and CSS downloaded when you open a tool.',
            'Models and WebAssembly: some of ToolGarden’s models and runtimes sit in the site’s own directories (OCR, image enhancement, upscaling), while the watermark-removal MI-GAN and LaMa models are downloaded from Hugging Face, with MI-GAN at about 28 MB on first use. These are downloads and carry none of your image.',
            'Third-party scripts: if a site includes analytics or ads, the page makes extra requests. They should not contain file content, which you can verify with the method above instead of guessing.',
            'Fonts and icons: usually GET requests with no request body.',
          ] },

          { type: 'heading', level: 2, text: '5. What local processing protects, and what it does not' },
          { type: 'table', headers: ['Risk', 'Mitigated by local processing?', 'Notes'], rows: [
            ['Files left in server logs, buckets or queues', 'Yes', 'The file never reached a server'],
            ['Interception in transit', 'Largely', 'There is no file transfer to intercept, though the page code itself is still served over HTTPS'],
            ['Tampered page code or injected malicious scripts', 'No', 'A tampered page can read any file you select, so confirm the correct domain over HTTPS'],
            ['Malicious browser extensions', 'No', 'Extensions can read page content; more extensions mean more risk'],
            ['Shared or untrusted computers', 'No', 'Files may remain in the Downloads folder, browser cache or system thumbnails'],
            ['You sharing the result with someone else', 'No', 'Local processing covers the processing only, not what you do afterwards'],
          ] },

          { type: 'heading', level: 2, text: '6. The real resource limits' },
          { type: 'paragraph', text: 'A browser tab does not have a server’s compute and memory, so a well-built local tool sets explicit caps instead of letting the page freeze. These numbers come from the ToolGarden source:' },
          { type: 'table', headers: ['Scenario', 'Limit'], rows: [
            ['Image conversion, watermark removal, watermarking and similar', 'Up to 50 MB per file and 40 million pixels'],
            ['QR code decoding', 'Up to 12 MB per image and 24 million pixels'],
            ['AI upscaling and image enhancement', 'Source image up to 4 million pixels'],
            ['QR code logo', 'Up to 4 MB and 4 million pixels'],
            ['Audio stem separation model', 'A large model; a comment in the service worker mentions a separate cache of about 130 MB'],
          ] },
          { type: 'paragraph', text: 'When you hit a limit, do not read it as a broken tool. Shrink the image first, or process in batches, rather than dragging a whole folder in at once.' },

          { type: 'heading', level: 2, text: '7. How far offline use really goes' },
          { type: 'paragraph', text: 'The site registers a service worker and a web app manifest, so it can be installed as a PWA. The cache strategy is: build assets (/_next/static/) are read from cache first, page routes go to the network first and fall back to the cache when the network fails, and other GET requests are also network first. In practice, pages and static resources you have visited usually still open when you are offline, but tools you never opened and models you never downloaded will not appear out of thin air. To use a tool offline, open it while online and run a complete job once.' },

          { type: 'heading', level: 2, text: '8. When not to use browser-local processing' },
          { type: 'list', items: [
            'Compliance work that needs an audit trail: if policy requires traceable server logs for processing, local processing leaves no record.',
            'Multi-gigabyte files or long batch jobs: browser memory and per-tab compute are limited, so desktop software or a controlled backend fits better.',
            'High-fidelity Office layout: converting a complex document in a browser is often less reliable than professional desktop software.',
            'Collaboration and shared state: local processing is inherently single-machine.',
            'Untrusted devices: in an internet cafe or on someone else’s computer the privacy advantage is cancelled out by device risk.',
          ] },
          { type: 'heading', level: 3, text: 'A checklist for choosing a tool' },
          { type: 'list', items: [
            'Verify once with a sample file and the Network panel that no request carries your file content.',
            'Confirm that the output format keeps the details you need, such as transparency, fonts or metadata.',
            'Before a large batch, read the tool’s file-size and browser-compatibility limits.',
            'For sensitive files, use a private window, turn off unnecessary extensions, and clean the Downloads folder afterwards.',
          ] },
          { type: 'callout', title: 'Images and PDFs can be checked the same way', text: 'The image and PDF tools use the same local-processing approach. Apply the steps above to compressing an image or merging two PDFs and watch the Network panel to reach your own conclusion.', href: '/image', linkLabel: 'Open Image Tools' },
        ],
        faq: [
          { question: 'Can a “no upload” page still make network requests?', answer: 'Yes, but they should be downloads only: page code, models, fonts. What matters is whether, after processing starts, there is a POST or PUT carrying file content, or WebSocket frames doing so. Comparing the request body size with the file size in the Network panel is the most direct test.' },
          { question: 'Is a local tool always safer?', answer: 'Not necessarily. It shrinks the server-side exposure, but you still have to trust the page code, use the correct HTTPS domain, avoid suspicious extensions and keep sensitive files off untrusted devices. Local processing reduces risk; it does not remove it.' },
          { question: 'Does it work after I go offline?', answer: 'It depends on the tool and on what you loaded before. Pages and static assets you visited are usually cached and open offline, but models and resources you never downloaded cannot be fetched without a connection. Run a complete job once while online for any tool you want offline.' },
          { question: 'Why does watermark removal download a 28 MB model first?', answer: 'The AI inpainting runs inside your browser, so the model file has to be downloaded to your machine first. What is downloaded is the model, not your image; once it is loaded, inference runs locally.' },
          { question: 'Large files are slow or fail. Is the tool broken?', answer: 'Most likely it is a browser resource limit. The image tools cap files at 50 MB and 40 million pixels, and AI upscaling caps the source at 4 million pixels. Shrink the image, process in batches, or use desktop software for very large files.' },
          { question: 'How can I tell an analytics script is not uploading my file?', answer: 'Use the Network panel again: filter for requests to domains other than the site’s own and inspect their payloads. Analytics requests are normally a few hundred bytes with no file name or content. Only a request body comparable to your file size should worry you.' },
        ],
      },
    },
  },
  {
    slug: 'remove-image-watermark-local-ai-inpainting',
    publishedAt: '2026-07-02',
    updatedAt: '2026-10-14',
    translations: {
      zh: {
        title: '图片水印去不干净怎么办？浏览器本地 AI 补全的原理、选区技巧与局限',
        excerpt:
          '去水印不是「擦掉」，而是让模型根据周围像素重新生成一块画面。本文用具体数字讲清选区大小如何影响结果、三种处理模式怎么选，以及哪些水印根本不该交给 AI 补全。',
        metaTitle: '图片水印去不干净怎么办？本地 AI 去水印技巧',
        metaDescription:
          '讲清浏览器本地 AI 去水印的原理：选区大小、MI-GAN、LaMa 与快速模式怎么选，如何避免残影和糊块，以及适用边界。',
        readingTime: '12 分钟',
        tags: ['去水印', 'AI 补全', '图片修复', '本地处理'],
        relatedTools: [
          { label: '图片去水印', href: '/image/remove-watermark', description: '框选水印区域，用本地 AI 模型补全，导出 JPG、PNG 或 WebP。' },
          { label: '图片擦除', href: '/image/erase', description: '用画笔涂抹人物、电线或杂物，适合形状不规则的目标。' },
          { label: '图片编辑', href: '/image/edit', description: '去水印之后再做裁剪、标注或打码等收尾处理。' },
          { label: 'EXIF 查看', href: '/image/exif', description: '查看图片里的拍摄信息，了解重新导出后哪些元数据不会保留。' },
        ],
        blocks: [
          { type: 'lead', text: '很多人第一次用 AI 去水印，都会碰到同一个问题：框选好了、点了生成，水印是不见了，原来的位置却变成一团模糊的色块，或者留下一圈淡淡的影子。这不是工具出了故障，而是你对「去水印」的预期和它的实际工作方式之间有一个落差：它做的不是还原，而是重新画。' },
          { type: 'paragraph', text: '这篇文章先说清楚什么样的图可以处理，再解释 ToolGarden 在浏览器里是怎么补全的，然后用两个带数字的实例演示选区大小如何决定结果好坏，最后列出残影、糊块、接缝等问题的诊断方法和不该使用的场景。工具在浏览器本地运行 AI 模型，图片不会上传到服务器。' },

          { type: 'heading', level: 2, text: '一、先划清边界：只处理你有权修改的图片' },
          { type: 'paragraph', text: '水印往往代表着版权或来源声明。移除他人作品上的水印，用于再发布、商用或冒充原创，既可能侵犯著作权，也违反多数平台的使用条款。这个工具适合的是你有权处理的图片，例如：' },
          { type: 'list', items: [
            '自己拍摄的照片，相机烙在角落的日期时间戳。',
            '自己制作的素材，加过水印但手头只剩带水印的版本。',
            '品牌更换后需要去掉旧 logo 的自有宣传图。',
            '截图里想去掉的账号名、临时标签或个人信息。',
          ] },
          { type: 'paragraph', text: '如果图片来自他人，请先获得授权，或者联系权利人索取无水印原图。工具的页面上也提醒：只处理自己拥有或获得许可修改的图片。' },

          { type: 'heading', level: 2, text: '二、原理：补全不是还原' },
          { type: 'paragraph', text: '被水印盖住的像素已经被覆盖，原图的信息并不在文件里，所以任何工具都无法「还原」它，只能根据周围的画面推测这里应该是什么，再画出来。这个过程叫图像修补（inpainting）。ToolGarden 的流程是：' },
          { type: 'list', ordered: true, items: [
            '你在原图上拖出一个矩形选区，这个矩形就是要重画的区域（遮罩）。目前遮罩是矩形，不是画笔涂抹。',
            '工具以选区为中心，截取一块带有周围上下文的图像交给模型。',
            '模型只重画遮罩内的像素，选区之外的像素保持不变。',
            '重画的结果再做一次边缘柔化（对应界面里的「边缘融合」），减少接缝。',
          ] },
          { type: 'table', headers: ['模式', '做法', '适合', '代价'], rows: [
            ['高质量 AI（默认）', 'MI-GAN 的 ONNX 模型，在浏览器本地推理', '照片、有纹理和渐变的背景', '首次使用需下载约 28MB 的模型'],
            ['兼容 AI', 'LaMa 的 ONNX 模型，在浏览器本地推理', '照片和较丰富的纹理，作为兼容备选', '同样需要下载模型文件'],
            ['快速本地', '不用 AI 模型，按周围像素的距离加权估算填充', '纯色、渐变、截图背景', '遇到复杂纹理会出现涂抹感'],
          ] },
          { type: 'paragraph', text: '三种模式之间还有自动降级：选了高质量 AI 但模型加载或运行失败，会先尝试 LaMa，再不行就退回快速本地，进度提示会显示「正在切换到快速本地修复」。所以拿到结果后，建议看一眼结果信息里的「模式」，确认最终用的是哪一种。' },

          { type: 'heading', level: 2, text: '三、操作步骤' },
          { type: 'list', ordered: true, items: [
            '上传图片。支持 JPG、PNG、WebP、GIF、BMP、SVG、AVIF，单个文件不超过 50MB，像素不超过 4000 万。',
            '拖出选区。载入图片后，工具会在右下角预置一个选区：宽为图片宽度的 32%、高为 14%，距右边和下边各留 5%。例如 1920×1080 的图，预置选区是 614×151 像素，左上角在 (1210, 875)。你可以拖动它、用八个手柄缩放，也可以直接改 X、Y、宽、高四个数值。',
            '选择模式。默认的高质量 AI 通常是首选；背景是纯色或平滑渐变时可以选快速本地，速度快得多。',
            '调整边缘融合。范围 0 到 36 像素，默认 12。它会让遮罩向外扩几个像素，并对接缝做柔化。',
            '选择输出格式。默认跟随原图：JPG 输出 JPG，WebP 输出 WebP，其它输出 PNG。JPG 和 WebP 还有质量滑块，范围 50% 到 100%，默认 92%。',
            '点「生成修复」，放大预览检查，满意再下载。移动选区或调整参数后，上一次的结果会被清掉，需要重新生成。',
          ] },
          { type: 'callout', title: '先用一张小图试选区', text: '选区大小对结果影响最大。先在一张缩小过的副本上试出合适的框，再用原图正式处理，可以省掉反复下载模型和等待的时间。', href: '/image/remove-watermark', linkLabel: '打开图片去水印' },

          { type: 'heading', level: 2, text: '四、实例：选区大小如何决定成败' },
          { type: 'heading', level: 3, text: '实例一：1920×1080 截图，右下角一行文字水印' },
          { type: 'paragraph', text: '假设水印文字占 220×40 像素，左上角在 (1650, 1000)。不要恰好框住文字，四周各留约 10 像素：选区取 x=1640、y=990、宽 240、高 60。原因是水印边缘有抗锯齿的半透明像素，有时还有描边或阴影，框得太紧会留下一圈淡淡的字影。背景如果是纯色或平滑渐变，用快速本地即可，几乎瞬间完成；背景有纹理时用高质量 AI。' },
          { type: 'heading', level: 3, text: '实例二：4000×3000 的照片，默认选区 vs 贴合选区' },
          { type: 'paragraph', text: '这是理解结果质量的关键。AI 模型的输入固定为 512×512 像素，所以工具会截取选区周围的一块上下文，缩小到 512 才交给模型。按源码的算法，上下文大小取下面三者中的最大值：48 像素、图片短边的 8%、选区长边的 80%，最后取选区长边加上两倍上下文大小作为截取的正方形边长。' },
          { type: 'table', headers: ['选区', '上下文', '截取的正方形边长', '缩放到 512 的倍数'], rows: [
            ['默认 1280×420', 'max(48, 240, 1024) = 1024', '3000（被图片短边限制）', '约缩小到原来的 17%'],
            ['贴合 logo 的 500×140', 'max(48, 240, 400) = 400', '1300', '约缩小到原来的 39%'],
          ] },
          { type: 'paragraph', text: '也就是说，在同一张 4000×3000 的照片上，用默认的大选区时，模型是在被压缩到约六分之一的画面上画出补全内容，再放大贴回去，补全区域会比周围的噪点和颗粒明显更软；改成只框住 logo 的 500×140 小选区后，模型看到的画面清晰得多。结论很直接：选区越贴近水印越好，水印很大时也宁可分几次小范围处理，每次把上一次的 PNG 结果重新载入，而不是一次框一大片。' },

          { type: 'heading', level: 2, text: '五、不同水印怎么选方案' },
          { type: 'table', headers: ['水印情况', '建议', '预期效果'], rows: [
            ['角落半透明 logo，背景有纹理的照片', '高质量 AI，选区贴合 logo 并留 5 到 10 像素', '通常自然'],
            ['纯色或渐变背景上的文字', '快速本地即可', '快，几乎看不出'],
            ['相机日期戳（橙色数字）', '小选区，高质量 AI', '背景简单时效果好'],
            ['整张图斜铺的重复水印', '不适合', '选区几乎覆盖全图，模型没有可参考的画面'],
            ['水印压在人脸、文字、商品细节上', '不适合', '被遮住的细节无法还原，只能得到「看起来合理」的合成内容'],
            ['水印叠在砖墙、格子、整齐文字等规则图案上', '谨慎，多次小范围尝试', '规则纹理容易错位、重复'],
          ] },

          { type: 'heading', level: 2, text: '六、常见问题与诊断' },
          { type: 'table', headers: ['现象', '最可能的原因', '处理方法'], rows: [
            ['留下一圈淡淡的影子', '选区贴得太紧，没盖住抗锯齿边缘和阴影', '把选区向外扩几个像素，或把边缘融合调到 18 到 24'],
            ['补全区域模糊、发软', '选区相对图片太大，模型输入被大幅缩小', '缩小选区；对大水印分多次处理'],
            ['补全区域颜色与周围不一致', '选区跨过了明显的颜色分界', '把选区限制在同一块颜色内，分别处理'],
            ['补出重复的怪异纹理', '周围可参考的信息太少，或选区太大', '缩小选区；换另一种 AI 模式再试'],
            ['结果有轻微块状噪点', '输出为 JPG，质量较低，或被多次压缩', '输出 PNG 作为中间结果，最后再导出 JPG'],
            ['第一次特别慢', '正在下载约 28MB 的模型', '等待完成，之后同一会话不必重复下载'],
            ['结果信息里模式是「快速本地」', '模型加载失败，已自动降级', '检查网络、刷新重试，或改选兼容 AI'],
          ] },
          { type: 'heading', level: 3, text: '关于元数据与画质' },
          { type: 'paragraph', text: '输出是经过 Canvas 重新编码的新文件，原图的 EXIF（拍摄时间、设备、定位等）不会保留。如果你需要知道原图里有哪些元数据，可以先用 EXIF 查看工具看一眼。另外，除选区之外的像素在 PNG 输出下保持不变；输出 JPG 或 WebP 时则因为重新压缩而整体有细微变化，要保留最高画质请选 PNG。' },
          { type: 'heading', level: 3, text: '导出格式怎么选' },
          { type: 'table', headers: ['格式', '何时用', '注意'], rows: [
            ['PNG', '需要继续编辑、保存中间结果、有透明区域', '体积最大，照片会明显变大'],
            ['JPG', '最终用于网页、社交平台、打印', '有损；透明区域会被填成白色'],
            ['WebP', '网页使用，体积更小', '部分老旧软件不识别'],
          ] },
          { type: 'callout', title: '形状不规则的目标用擦除工具', text: '如果要去掉的是电线、路人这类不规则形状，而不是矩形的水印，改用图片擦除，用画笔沿轮廓涂抹，避免把大片背景一起重算。', href: '/image/erase', linkLabel: '打开图片擦除' },

          { type: 'heading', level: 2, text: '七、什么时候不该用这个方法' },
          { type: 'list', items: [
            '你没有权利修改的图片：水印是权利声明，移除后再发布可能构成侵权。',
            '需要作为证据或档案保存的图片：修补过的区域是模型生成的内容，不能再当作原始记录。',
            '水印占据画面大部分或贯穿全图：没有足够的周围信息可参考，应该联系权利人取得无水印版本。',
            '不可见的数字水印：这个工具只处理肉眼可见的水印，对嵌入在图像数据里的隐形水印没有意义。',
            '需要精确还原被遮挡的文字或人脸：AI 只会生成看起来合理的内容，不能还原真实信息。',
          ] },
        ],
        faq: [
          { question: '去水印后为什么原位置变得模糊？', answer: '最常见的原因是选区相对整张图太大。模型的输入固定为 512×512，大选区会连同大块上下文一起被缩小，补全内容分辨率偏低。把选区缩小到贴合水印，或者分多次小范围处理，通常能明显改善。' },
          { question: '三种模式到底怎么选？', answer: '照片和有纹理的背景用默认的高质量 AI；它出问题时换兼容 AI；背景是纯色、渐变或截图时选快速本地，速度快、不需要下载模型。拿不准就先用快速本地试一下，不满意再换 AI。' },
          { question: '图片会被上传到服务器吗？', answer: '不会。模型在你的浏览器里运行，图片只在当前标签页内存中处理。首次使用会下载模型文件，这是下载，不会带上你的图片，关闭页面后数据会被清除。' },
          { question: '可以批量去水印吗？', answer: '当前一次只处理一张图片、一个矩形选区。多个水印位置需要分多次处理：生成并下载结果后，把结果重新载入，再框选下一个位置。' },
          { question: '为什么输出的文件没有拍摄时间等信息了？', answer: '输出是经过 Canvas 重新编码的新图片，EXIF 元数据不会被写入。这对隐私有利，但如果你需要保留拍摄信息，应该另行记录。' },
          { question: '可以去除别人图片上的水印吗？', answer: '不建议，也不应该。水印通常代表版权或来源声明，未经授权去除并再发布可能构成侵权。请获得授权，或联系权利人取得无水印原图。' },
        ],
      },
      en: {
        title: 'Why Does Image Watermark Removal Leave Blur or Ghosts? How Local AI Inpainting Works, and Its Limits',
        excerpt:
          'Removing a watermark is not erasing it; a model repaints the area from the surrounding pixels. This guide uses concrete numbers to show how selection size drives the result, how to pick among the three modes, and which watermarks you should not hand to AI inpainting at all.',
        metaTitle: 'Watermark Removal Leaves Blur? Local AI Inpainting Tips',
        metaDescription:
          'How browser-local AI watermark removal works: selection size, MI-GAN, LaMa and fast mode, avoiding ghosts and soft patches, and where it does not apply.',
        readingTime: '12 min read',
        tags: ['watermark removal', 'AI inpainting', 'image repair', 'local processing'],
        relatedTools: [
          { label: 'Remove Image Watermark', href: '/image/remove-watermark', description: 'Select the watermark area, repair it with a local AI model and export JPG, PNG or WebP.' },
          { label: 'Image Eraser', href: '/image/erase', description: 'Paint over people, wires or clutter with a brush; suited to irregular shapes.' },
          { label: 'Image Editor', href: '/image/edit', description: 'Crop, annotate or blur after the repair for final touch-ups.' },
          { label: 'EXIF Viewer', href: '/image/exif', description: 'Inspect the shooting data in an image and see which metadata does not survive re-export.' },
        ],
        blocks: [
          { type: 'lead', text: 'Almost everyone who tries AI watermark removal hits the same surprise: you select the area and click generate, the watermark is gone, but where it used to be there is a smeared patch of color or a faint shadow. The tool is not broken. There is a gap between what you expect from “removing” a watermark and what actually happens: it does not restore anything, it repaints.' },
          { type: 'paragraph', text: 'This guide first covers which images are fair game, then explains how ToolGarden repairs an area inside the browser, then walks through two numeric examples showing how selection size decides the outcome, and finally lists how to diagnose ghosts, soft patches and seams, plus the cases where you should not use this approach. The AI models run locally in your browser, and the image is not uploaded to a server.' },

          { type: 'heading', level: 2, text: '1. Draw the line first: only edit images you have the right to modify' },
          { type: 'paragraph', text: 'A watermark usually stands for a copyright or source claim. Removing it from someone else’s work to republish, sell or pass it off as your own can infringe copyright and breaks the terms of most platforms. The tool is meant for images you are entitled to process, for example:' },
          { type: 'list', items: [
            'Your own photos with a date-time stamp burned into a corner by the camera.',
            'Assets you made and watermarked yourself, when only the watermarked copy survives.',
            'Your own promotional images that still carry an old logo after a rebrand.',
            'Screenshots where you want to remove an account name, a temporary label or personal information.',
          ] },
          { type: 'paragraph', text: 'If the image comes from someone else, get permission first or ask the rights holder for the unwatermarked original. The tool’s own page carries the same reminder: only process images you own or are allowed to modify.' },

          { type: 'heading', level: 2, text: '2. How it works: repair is not restoration' },
          { type: 'paragraph', text: 'The pixels under a watermark have been overwritten, so the original information is not in the file, and no tool can restore it. All it can do is guess what should be there from the surrounding picture and paint that in. The technique is called inpainting. ToolGarden’s pipeline is:' },
          { type: 'list', ordered: true, items: [
            'You drag a rectangle on the image; that rectangle is the region to repaint (the mask). The mask is currently a rectangle, not a brush stroke.',
            'The tool crops a patch of the image that includes context around the selection and passes it to the model.',
            'The model repaints only the pixels inside the mask; pixels outside the selection stay unchanged.',
            'The result gets one more round of edge softening (the “Edge blend” control) to reduce the seam.',
          ] },
          { type: 'table', headers: ['Mode', 'How it works', 'Best for', 'Cost'], rows: [
            ['High quality AI (default)', 'The MI-GAN ONNX model, run locally in the browser', 'Photos, textured or gradient backgrounds', 'The first run downloads about 28 MB of model assets'],
            ['Compatible AI', 'The LaMa ONNX model, run locally in the browser', 'Photos and richer textures, as a compatible fallback', 'Also needs a model download'],
            ['Fast local', 'No AI model; fills by distance-weighted estimation from nearby pixels', 'Flat colors, gradients, screenshot backgrounds', 'Smeared look on complex texture'],
          ] },
          { type: 'paragraph', text: 'There is also automatic degradation between the modes: if you pick High quality AI and the model fails to load or run, the tool tries LaMa, and if that fails too it drops to fast local repair, with a progress message saying it is switching to fast local repair. So after generating, glance at the Mode field in the result details to confirm which one produced the output.' },

          { type: 'heading', level: 2, text: '3. The procedure' },
          { type: 'list', ordered: true, items: [
            'Upload an image. JPG, PNG, WebP, GIF, BMP, SVG and AVIF are accepted, up to 50 MB and 40 million pixels.',
            'Drag the selection. Once an image loads, a default box is placed at the bottom right: 32% of the image width, 14% of the height, with 5% margins from the right and bottom edges. On a 1920×1080 image that is 614×151 px with its top-left corner at (1210, 875). Drag it, resize it with the eight handles, or type values into the X, Y, Width and Height fields.',
            'Pick a mode. High quality AI is usually the first choice; on a flat color or smooth gradient, Fast local is far quicker.',
            'Adjust Edge blend. The range is 0 to 36 px, default 12. It grows the mask a few pixels outward and softens the seam.',
            'Choose the output format. The default follows the source: JPG gives JPG, WebP gives WebP, anything else gives PNG. JPG and WebP also have a quality slider from 50% to 100%, default 92%.',
            'Click Generate repair, zoom in on the preview, and download when satisfied. Moving the box or changing parameters clears the previous result, so regenerate afterwards.',
          ] },
          { type: 'callout', title: 'Try the selection on a small copy first', text: 'Selection size affects the result more than anything else. Work out a good box on a downscaled copy first, then process the original, and you avoid repeated waits and downloads.', href: '/image/remove-watermark', linkLabel: 'Open Remove Image Watermark' },

          { type: 'heading', level: 2, text: '4. Worked examples: how selection size decides the outcome' },
          { type: 'heading', level: 3, text: 'Example 1: a 1920×1080 screenshot with a text watermark at the bottom right' },
          { type: 'paragraph', text: 'Say the watermark text occupies 220×40 px with its top-left corner at (1650, 1000). Do not box it exactly; leave about 10 px on every side: x=1640, y=990, width 240, height 60. The reason is that watermark edges contain anti-aliased semi-transparent pixels, and sometimes a stroke or shadow, so a box that is too tight leaves a faint outline of the letters. If the background is a flat color or smooth gradient, Fast local finishes almost instantly; on a textured background use High quality AI.' },
          { type: 'heading', level: 3, text: 'Example 2: a 4000×3000 photo, default box versus a tight box' },
          { type: 'paragraph', text: 'This is the key to understanding result quality. The AI model input is a fixed 512×512 pixels, so the tool crops a patch with context around the selection and shrinks it to 512 before handing it over. Reading the source, the context size is the largest of three numbers: 48 px, 8% of the shorter image side, and 80% of the selection’s longer side; the crop is a square whose side is the selection’s longer side plus twice the context size, capped at the shorter image side.' },
          { type: 'table', headers: ['Selection', 'Context', 'Square crop side', 'Scale to reach 512'], rows: [
            ['Default 1280×420', 'max(48, 240, 1024) = 1024', '3000 (capped by the short side)', 'Shrunk to about 17% of original'],
            ['Tight 500×140 around the logo', 'max(48, 240, 400) = 400', '1300', 'Shrunk to about 39% of original'],
          ] },
          { type: 'paragraph', text: 'In other words, on the same 4000×3000 photo the default large box has the model painting on a version compressed to roughly one sixth, which is then scaled back up, so the repaired area ends up visibly softer than the grain around it. With a tight 500×140 box over the actual logo the model sees a much sharper picture. The takeaway is plain: the closer the selection hugs the watermark, the better, and for a large watermark it is better to work in several small passes, reloading the previous PNG each time, than to box a huge region at once.' },

          { type: 'heading', level: 2, text: '5. Choosing an approach per watermark type' },
          { type: 'table', headers: ['Watermark situation', 'Recommendation', 'Expected result'], rows: [
            ['Semi-transparent corner logo on a textured photo', 'High quality AI; box hugging the logo with a 5 to 10 px margin', 'Usually natural'],
            ['Text on a flat or gradient background', 'Fast local is enough', 'Fast and hard to spot'],
            ['Camera date stamp (orange digits)', 'Small box, High quality AI', 'Good on simple backgrounds'],
            ['Repeated watermark tiled across the whole image', 'Not suitable', 'The selection covers nearly everything, leaving the model nothing to reference'],
            ['Watermark over faces, text or product detail', 'Not suitable', 'Hidden detail cannot be recovered; you get plausible invented content'],
            ['Watermark over regular patterns such as brick, grids or tidy text', 'Be careful; try several small passes', 'Regular textures tend to misalign or repeat'],
          ] },

          { type: 'heading', level: 2, text: '6. Common problems and how to diagnose them' },
          { type: 'table', headers: ['Symptom', 'Most likely cause', 'What to do'], rows: [
            ['A faint outline remains', 'Box too tight; anti-aliased edges and shadow not covered', 'Grow the box a few pixels, or raise Edge blend to 18 to 24'],
            ['The repaired area is blurry or soft', 'Selection too large relative to the image; model input shrunk heavily', 'Shrink the selection; handle large watermarks in several passes'],
            ['Color differs from the surroundings', 'Selection crosses a clear color boundary', 'Keep each selection inside one color region and do them separately'],
            ['Odd repeated texture appears', 'Too little context to reference, or the box is too large', 'Shrink the box; try the other AI mode'],
            ['Slight blocky noise in the result', 'Output as JPG at low quality, or compressed repeatedly', 'Output PNG for intermediate results and export JPG only at the end'],
            ['The first run is very slow', 'About 28 MB of model data is downloading', 'Wait for it; later runs in the session do not repeat it'],
            ['Mode in the result says Fast local', 'Model loading failed and the tool fell back', 'Check the network, refresh, or choose Compatible AI'],
          ] },
          { type: 'heading', level: 3, text: 'Metadata and quality' },
          { type: 'paragraph', text: 'The output is a new file re-encoded through a Canvas, so the original EXIF data (capture time, device, location) is not kept. If you need to know what metadata the original carried, look at it in the EXIF viewer first. Also, outside the selection, pixels are unchanged when you export PNG; exporting JPG or WebP re-compresses the whole image, producing slight overall changes, so choose PNG when you need the highest fidelity.' },
          { type: 'heading', level: 3, text: 'Choosing the export format' },
          { type: 'table', headers: ['Format', 'When to use it', 'Watch out for'], rows: [
            ['PNG', 'Further editing, intermediate results, transparent areas', 'Largest files; photos grow noticeably'],
            ['JPG', 'Final use on the web, social platforms or print', 'Lossy; transparent areas are filled with white'],
            ['WebP', 'Web delivery with smaller files', 'Some older software cannot open it'],
          ] },
          { type: 'callout', title: 'Use the eraser for irregular shapes', text: 'If what you want to remove is a wire or a passer-by rather than a rectangular watermark, use Image Eraser and paint along the outline so you do not recompute a large patch of background.', href: '/image/erase', linkLabel: 'Open Image Eraser' },

          { type: 'heading', level: 2, text: '7. When not to use this approach' },
          { type: 'list', items: [
            'Images you have no right to modify: a watermark is a rights statement, and republishing after removing it may be infringement.',
            'Images that must be kept as evidence or records: the repaired region is model-generated content and can no longer count as the original record.',
            'Watermarks that cover most of the frame or run across the whole image: there is not enough surrounding information, and you should ask the rights holder for a clean version.',
            'Invisible digital watermarks: this tool handles visible watermarks only and does nothing about hidden marks embedded in image data.',
            'Needing to recover obscured text or faces exactly: AI generates plausible content; it cannot recover the real information.',
          ] },
        ],
        faq: [
          { question: 'Why is the repaired area blurry?', answer: 'The most common reason is a selection that is too large relative to the image. The model input is a fixed 512×512, so a big selection pulls in a big context that is then shrunk heavily and yields a low-resolution fill. Shrink the selection to hug the watermark, or work in several small passes, and the result usually improves clearly.' },
          { question: 'How do I choose between the three modes?', answer: 'Use the default High quality AI for photos and textured backgrounds; switch to Compatible AI if it misbehaves; choose Fast local for flat colors, gradients and screenshots, where it is quick and needs no model download. If unsure, try Fast local first and move to AI if the result is unsatisfying.' },
          { question: 'Is my image uploaded to a server?', answer: 'No. The models run in your browser and the image is processed in the current tab’s memory. The first run downloads model files, which is a download and carries none of your image; data is cleared when you close the page.' },
          { question: 'Can I remove watermarks in batch?', answer: 'Currently the tool handles one image and one rectangular selection at a time. For several watermark positions, work in passes: generate and download the result, load it again, and select the next position.' },
          { question: 'Why does the output lack capture time and other information?', answer: 'The output is a new image re-encoded through a Canvas, and EXIF metadata is not written into it. That helps privacy, but if you need the shooting data, record it separately.' },
          { question: 'Can I remove watermarks from other people’s images?', answer: 'It is not advisable, and you should not. A watermark usually states copyright or origin, and removing it without permission and republishing can be infringement. Get authorization, or ask the rights holder for an unwatermarked original.' },
        ],
      },
    },
  },
  {
    slug: 'add-watermark-to-image-text-tile-diagonal',
    publishedAt: '2026-07-02',
    updatedAt: '2026-10-14',
    translations: {
      zh: {
        title: '图片加水印太淡看不见、太显眼毁图怎么办？文字、Logo、平铺与对角线的参数选择',
        excerpt:
          '从字号为什么要按像素算、九宫格锚点为什么会让水印跑出画面，到平铺间距公式和对角线布局，用具体数字讲清楚怎样让水印既看得见又不毁图，并附防盗用强度对比。',
        metaTitle: '图片加水印怎么设置才合适？文字、平铺、对角线',
        metaDescription:
          '图片加水印的参数指南：字号按像素、九宫格锚点陷阱、平铺间距公式、对角线布局，以及不同布局的防盗用强度对比。',
        readingTime: '12 分钟',
        tags: ['图片水印', '文字水印', 'Logo 水印', '图片工具'],
        relatedTools: [
          { label: '图片加水印', href: '/image/watermark', description: '为图片添加文字或 Logo 水印，支持九宫格、平铺、对角线，全程本地处理。' },
          { label: '图片编辑', href: '/image/edit', description: '加水印前后做裁剪、标注、打码等处理。' },
          { label: 'PDF 加水印', href: '/pdf/watermark', description: '需要给 PDF 文档加水印时使用。' },
          { label: '图片去水印', href: '/image/remove-watermark', description: '了解水印在什么情况下容易被去掉，反过来指导你的加水印方案。' },
        ],
        blocks: [
          { type: 'lead', text: '给图片加水印看上去只是「放一行字」，实际用起来经常两头不讨好：调淡了，缩略图上几乎看不出；调浓了，又把画面盖得难看；放在角落里，别人一刀就能裁掉。问题的根源往往不是审美，而是没弄清工具里几个参数的真实含义——字号按什么算、位置锚点指的是哪个点、平铺间距相对什么。' },
          { type: 'paragraph', text: '这篇文章把 ToolGarden 图片加水印的参数逐个讲透，配上带数字的实例，再给出不同布局的防盗用强度对比和常见故障的诊断方法。整个过程在浏览器本地完成，图片和水印素材不会上传到服务器。' },

          { type: 'heading', level: 2, text: '一、先想清楚目的，再选布局' },
          { type: 'table', headers: ['目的', '推荐布局', '起步参数（经验值，需按图调整）'], rows: [
            ['署名、标注来源', '单个，放在九宫格右下或左下', '不透明度 50% 到 70%，字号约为图宽的 4% 到 8%'],
            ['防盗用、防转载', '对角线或平铺，覆盖全图', '不透明度 20% 到 35%，间距适中，让主体上也有水印'],
            ['草稿、机密标记', '对角线，大号文字（如 CONFIDENTIAL）', '不透明度 25% 到 40%，描边保证深浅背景都可读'],
            ['品牌 Logo', '图片水印，单个或平铺', '使用带透明背景的 PNG，宽度约为图宽的 10% 到 25%'],
          ] },
          { type: 'paragraph', text: '表中的数值是常见的起步范围，不是标准，实际要看图片的内容和用途：一张用于网页缩略图的图和一张用于大图预览的图，合适的字号可以相差很多倍。' },

          { type: 'heading', level: 2, text: '二、工具里到底有哪些控制项' },
          { type: 'table', headers: ['控制项', '范围或选项', '说明'], rows: [
            ['水印类型', '文字 / 图片', '文字水印可设字体大小、粗体、斜体、颜色和描边；图片水印需要上传 Logo'],
            ['字号', '12 到 200 像素', '按原图像素计算，不是相对比例'],
            ['描边', '0 到 12 像素', '默认 0（不描边），描边色为黑色'],
            ['图片水印大小', '图片宽度的 5% 到 150%', '保持 Logo 的宽高比'],
            ['不透明度', '5% 到 100%', '整个水印统一生效，默认 50%'],
            ['旋转', '−180° 到 180°', '默认 −20°'],
            ['布局', '单个 / 平铺 / 对角线', '单个可用九宫格或拖动定位'],
            ['间距（平铺和对角线）', '横向、纵向各 0% 到 120%', '分别相对图片宽度、图片高度'],
            ['输出格式与质量', 'JPG / PNG / WebP；质量 50% 到 100%，默认 92%', '导出尺寸与原图一致，不会缩放'],
          ] },
          { type: 'paragraph', text: '默认文字是 CONFIDENTIAL，48 像素、白色、粗体、不透明度 50%、旋转 −20°、居中的单个水印。限制方面：图片不超过 50MB 和 4000 万像素；一次处理一张图。' },

          { type: 'heading', level: 2, text: '三、操作步骤' },
          { type: 'list', ordered: true, items: [
            '上传图片，在预览里看水印的实时效果。预览按显示尺寸等比缩放，导出时按原图分辨率绘制。',
            '选择文字或图片水印，输入文字或上传 Logo。',
            '选择布局。单个水印可以点九宫格定位，也可以直接在预览里拖到任意位置；平铺和对角线用间距滑块控制密度。',
            '调字号或图片大小、不透明度和旋转。',
            '选择输出格式与质量，点「应用水印并下载」。需要微调就改参数后再次下载。',
          ] },
          { type: 'callout', title: '先在预览里调到满意再导出', text: '预览和导出使用同一套绘制逻辑，在预览里看到什么，导出的就是什么。放大到 100% 检查水印边缘和文字是否清晰。', href: '/image/watermark', linkLabel: '打开图片加水印' },

          { type: 'heading', level: 2, text: '四、三个必须弄懂的几何细节' },
          { type: 'heading', level: 3, text: '1. 字号是原图像素，不是相对比例' },
          { type: 'paragraph', text: '字号 48 的水印放在 800 像素宽的图上，宽度占比大约是 6%，看起来合适；放在 3000 像素宽的相机原图上，占比只有 1.6% 左右，缩小到屏幕上几乎看不见。同一组参数用在不同分辨率的图上效果完全不同，所以换一张尺寸差别很大的图之后，要重新调字号。可参考的起点是单个角标取图宽的 4% 到 8%：3000 像素宽的图约 120 到 240 像素。' },
          { type: 'heading', level: 3, text: '2. 九宫格锚点定位的是水印的中心点' },
          { type: 'paragraph', text: '九宫格每个位置对应的是水印中心点在图中的相对坐标：左、中、右分别是宽度的 8%、50%、92%，上、中、下分别是高度的 10%、50%、90%。后果是：右下角锚点的水印中心离右边缘只有 8% 的宽度，如果水印本身比图宽的 16% 还宽，就会有一部分被画到图外面被裁掉。' },
          { type: 'paragraph', text: '例如 3000 像素宽的图，右侧锚点的中心在 x = 2760，离右边缘 240 像素，所以宽度超过约 480 像素的水印就会被截断。以 © ToolGarden 这样 12 个字符左右的文字估算（平均字符宽度按字号的 0.6 倍粗略估算），字号 60 时宽约 430 像素，刚好放得下；字号 150 时宽约 1080 像素，会有一大截跑出画面。解决办法是在预览里直接把水印拖到合适位置，而不是依赖九宫格。' },
          { type: 'heading', level: 3, text: '3. 平铺间距：按比例，而不是像素' },
          { type: 'paragraph', text: '平铺和对角线布局里，相邻水印的步长是：横向步长 = 单个水印宽度 + 横向间距 × 图片宽度；纵向步长 = 单个水印高度（字号的约 1.2 倍）+ 纵向间距 × 图片高度。两个方向的步长都至少是 20 像素。默认间距是横向 35%、纵向 28%。' },
          { type: 'paragraph', text: '实例：3000×2000 的图，默认的 48 像素 CONFIDENTIAL（宽度按字号 0.6 倍的字符宽度粗略估算约 375 像素）。横向步长约为 375 + 0.35 × 3000 ≈ 1425 像素，纵向步长约为 58 + 0.28 × 2000 ≈ 618 像素。整张图里每行只有两个水印左右，总共三四行，而每个水印只有 375 像素宽，所以画面上大部分地方是空的，很容易被裁剪避开。把字号提到 120、间距调到横向 10%、纵向 12%，横向步长约 940 + 300 ≈ 1240，纵向步长约 144 + 240 ≈ 384，画面上就是密密麻麻的一层，而且水印本身大得足以压住主体。间距之所以用比例，是为了让同一组数值在不同尺寸的图上保持类似的疏密。' },
          { type: 'heading', level: 3, text: '对角线与平铺的差别' },
          { type: 'list', items: [
            '平铺：水印排成整齐的网格，旋转角度由「旋转」滑块决定。',
            '对角线：旋转固定为 −30°，旋转滑块对它不起作用；并且每隔一行向右错开半个步长，排成交错的砖块图案，更不容易被一条直线裁掉。',
          ] },

          { type: 'heading', level: 2, text: '五、不同布局的防盗用强度对比' },
          { type: 'table', headers: ['布局', '被裁剪避开', '被 AI 修补去掉', '对画面的影响'], rows: [
            ['单个，角落', '很容易，裁掉一边就没了', '很容易，小面积矩形正好是修补擅长的场景', '很小'],
            ['单个，居中半透明', '无法裁掉', '有难度，但遮住主体的位置会影响修补质量', '中等，遮挡主体'],
            ['平铺（网格）', '难', '较难，需要处理整张图', '较大'],
            ['对角线（交错）', '最难', '最难，水印覆盖面积最大', '最大，要靠低不透明度控制'],
          ] },
          { type: 'paragraph', text: '要诚实地说：没有任何可见水印是不可移除的，它的作用是提高盗用的成本和留下来源提示，不是版权保护的替代品。小面积水印正是 AI 修补最擅长的对象，具体原理可以参考去水印的文章。需要更强的证明力，应配合原始文件、拍摄记录或平台的版权登记，而不是只靠水印。' },

          { type: 'heading', level: 2, text: '六、颜色、描边与格式' },
          { type: 'list', items: [
            '背景深浅不一的图，白色文字加黑色细描边最稳：描边默认是 0，需要时自己调大。字号 48 左右时，可以先试 2 到 4 像素。',
            'JPG 输出时，细小文字边缘容易出现噪点。质量不要低于 85% 左右，水印文字清晰度要求高时用 PNG。',
            '如果源图是带透明背景的 PNG 而你导出 JPG，透明区域会被填成白色，加水印之后画面底色也是白的。需要保留透明就导出 PNG 或 WebP。',
            '水印是画进像素里的，导出后无法再单独关闭或移动，所以请保留一份无水印的原图。',
            '导出是经过 Canvas 重新编码的新文件，原图的 EXIF 信息不会保留。',
          ] },
          { type: 'table', headers: ['输出格式', '适合', '注意'], rows: [
            ['JPG', '照片、网页发布', '有损；透明区域变白色'],
            ['PNG', '截图、需要保留透明、要继续编辑', '体积大'],
            ['WebP', '网页发布，要求体积小', '少数旧软件打不开'],
          ] },

          { type: 'heading', level: 2, text: '七、常见问题与诊断' },
          { type: 'table', headers: ['现象', '原因', '处理'], rows: [
            ['水印几乎看不见', '字号按原图像素算，大图上显得太小；或不透明度太低', '把字号调到图宽的 4% 到 8%；不透明度提到 50% 以上'],
            ['水印被画出画面一部分', '九宫格定位的是中心点，水印太宽', '拖动到合适位置，或减小字号'],
            ['平铺太稀、能被裁剪避开', '默认间距按图宽比例，大图上显得很稀', '调小间距，增大字号'],
            ['平铺太密、盖住主体', '间距过小且不透明度高', '增大间距，降低不透明度到 20% 到 30%'],
            ['中文变成方块或字体不统一', '工具使用系统默认字体，设备缺少相应字体', '换到装有中文字体的设备，或改用图片水印'],
            ['Logo 水印发糊', '源 Logo 像素太小，被放大绘制', '在 3000 像素宽的图上 25% 约为 750 像素，需要更大的 Logo 源文件'],
            ['导出的 PNG 特别大', 'PNG 是无损格式，照片压缩效率低', '照片类改用 JPG 或 WebP'],
          ] },

          { type: 'heading', level: 2, text: '八、什么时候不该用这个方法' },
          { type: 'list', items: [
            '需要可验证的版权归属：可见水印不能替代版权登记、原始拍摄文件和内容凭证，也不能防止被去除。',
            '批量处理成百上千张图：工具一次处理一张，批量场景更适合脚本或专业软件。',
            '需要不可见水印或数字指纹：这类需求不在可见水印的能力范围内。',
            'PDF 文档：请使用 PDF 加水印，它能按页处理。',
            '需要保留全部元数据的摄影原片：导出会重新编码并丢掉 EXIF。',
          ] },
          { type: 'callout', title: '文档也需要水印？', text: 'PDF 文件可以用专门的 PDF 加水印工具，逐页添加文字水印，同样在浏览器本地完成。', href: '/pdf/watermark', linkLabel: '打开 PDF 加水印' },
        ],
        faq: [
          { question: '为什么同样的设置，换一张图水印就变得很小？', answer: '因为字号按原图像素计算，而间距按图片宽高的比例计算。4000 像素宽的图上 48 像素的字只占 1.2% 的宽度。换图之后需要重新按图宽的 4% 到 8% 调字号。' },
          { question: '九宫格右下角的水印为什么有一部分在画面外？', answer: '九宫格定位的是水印中心点，右侧锚点位于宽度的 92% 处，离右边缘只有 8%。水印宽度超过图宽的约 16% 就会跑出画面。把字号调小，或在预览里直接拖动水印到合适的位置。' },
          { question: '对角线布局的旋转滑块为什么不起作用？', answer: '对角线布局的旋转固定为 −30°，并且每隔一行错开半个步长。如果想要自定义角度，选「平铺」布局，再用旋转滑块调整。' },
          { question: '加了水印的图片能被别人去掉吗？', answer: '可以。没有任何可见水印是不可移除的。角落里的小水印最容易被裁剪或修补；居中、半透明、覆盖全图的平铺或对角线水印更难去除，但代价是对画面影响更大。' },
          { question: '导出的图片尺寸会变吗？', answer: '不会。导出尺寸与原图一致，水印按原图像素绘制。导出格式可选 JPG、PNG 或 WebP，EXIF 信息不会保留。' },
          { question: '图片会被上传吗？', answer: '不会。图片和水印素材都在浏览器本地处理，不会发送到服务器，关闭页面后数据会被清除。' },
        ],
      },
      en: {
        title: 'Watermark Too Faint or Too Intrusive? Choosing Text, Logo, Tiled and Diagonal Settings That Work',
        excerpt:
          'From why font size is measured in image pixels, to how nine-grid anchors can push a stamp off the picture, to the tiling spacing formula and the diagonal layout: concrete numbers for watermarks that are visible without ruining the image, plus a comparison of how hard each layout is to defeat.',
        metaTitle: 'How to Set Image Watermarks: Text, Tiled, Diagonal',
        metaDescription:
          'Image watermark settings explained: pixel font size, nine-grid anchor pitfalls, tiling spacing math, diagonal layout, and resistance to removal.',
        readingTime: '11 min read',
        tags: ['image watermark', 'text watermark', 'logo watermark', 'image tools'],
        relatedTools: [
          { label: 'Add Watermark to Image', href: '/image/watermark', description: 'Add text or logo watermarks with nine-grid, tiled and diagonal layouts, all processed locally.' },
          { label: 'Image Editor', href: '/image/edit', description: 'Crop, annotate or blur before or after watermarking.' },
          { label: 'PDF Watermark', href: '/pdf/watermark', description: 'Use this when the document to watermark is a PDF.' },
          { label: 'Remove Image Watermark', href: '/image/remove-watermark', description: 'See when watermarks are easy to remove, and plan your own accordingly.' },
        ],
        blocks: [
          { type: 'lead', text: 'Adding a watermark looks like “put a line of text on the picture”, yet it often fails both ways: too faint and it vanishes in a thumbnail, too strong and it ruins the picture, and tucked into a corner it can be cropped off in one move. The cause is rarely taste. It is usually a misunderstanding of what the controls mean: what font size is measured against, which point an anchor refers to, and what tiling spacing is relative to.' },
          { type: 'paragraph', text: 'This guide goes through the ToolGarden watermark controls one by one, with numeric examples, then compares how well each layout resists removal and shows how to diagnose common failures. Everything runs locally in the browser; the image and the watermark asset are not uploaded.' },

          { type: 'heading', level: 2, text: '1. Decide the purpose, then the layout' },
          { type: 'table', headers: ['Purpose', 'Suggested layout', 'Starting values (rules of thumb, adjust per image)'], rows: [
            ['Credit or attribution', 'Single, nine-grid bottom right or bottom left', 'Opacity 50% to 70%, font size around 4% to 8% of image width'],
            ['Deterring reuse', 'Diagonal or tiled across the whole image', 'Opacity 20% to 35%, moderate spacing so the subject is covered too'],
            ['Draft or confidential marking', 'Diagonal, large text such as CONFIDENTIAL', 'Opacity 25% to 40%, with a stroke so it reads on light and dark areas'],
            ['Brand logo', 'Image watermark, single or tiled', 'A transparent PNG, about 10% to 25% of image width'],
          ] },
          { type: 'paragraph', text: 'These are common starting ranges, not standards. A thumbnail used on a web page and a large preview image can need font sizes that differ many times over.' },

          { type: 'heading', level: 2, text: '2. What the controls actually are' },
          { type: 'table', headers: ['Control', 'Range or options', 'Notes'], rows: [
            ['Type', 'Text / Image', 'Text supports size, bold, italic, color and stroke; an image watermark needs an uploaded logo'],
            ['Font size', '12 to 200 px', 'Measured in source-image pixels, not as a ratio'],
            ['Stroke', '0 to 12 px', 'Default 0 (no stroke); the stroke color is black'],
            ['Image watermark size', '5% to 150% of image width', 'Keeps the logo’s aspect ratio'],
            ['Opacity', '5% to 100%', 'Applies to the whole stamp; default 50%'],
            ['Rotation', '−180° to 180°', 'Default −20°'],
            ['Layout', 'Single / Tile / Diagonal', 'Single can use the nine-grid or free dragging'],
            ['Spacing (tile and diagonal)', '0% to 120% horizontally and vertically', 'Relative to image width and image height respectively'],
            ['Output format and quality', 'JPG / PNG / WebP; quality 50% to 100%, default 92%', 'Export size equals the original; nothing is resized'],
          ] },
          { type: 'paragraph', text: 'The default text is CONFIDENTIAL: 48 px, white, bold, 50% opacity, −20° rotation, a single stamp in the center. Limits: images up to 50 MB and 40 million pixels, one image at a time.' },

          { type: 'heading', level: 2, text: '3. The procedure' },
          { type: 'list', ordered: true, items: [
            'Upload an image and watch the live preview. The preview is scaled to the display size, while the export draws at the original resolution.',
            'Choose a text or image watermark, then type the text or upload the logo.',
            'Choose a layout. A single stamp can be placed with the nine-grid or dragged anywhere in the preview; tiled and diagonal layouts use the spacing sliders for density.',
            'Tune font size or image size, opacity and rotation.',
            'Choose the output format and quality, then click Apply watermark & download. To adjust, change the parameters and download again.',
          ] },
          { type: 'callout', title: 'Get it right in the preview before exporting', text: 'The preview and the export use the same drawing logic, so what you see is what you get. Zoom to 100% to check that the edges and text are crisp.', href: '/image/watermark', linkLabel: 'Open Add Watermark to Image' },

          { type: 'heading', level: 2, text: '4. Three geometry details you need to understand' },
          { type: 'heading', level: 3, text: '1. Font size is in source pixels, not a ratio' },
          { type: 'paragraph', text: 'A 48 px watermark on an 800 px wide image takes about 6% of the width and looks fine. On a 3000 px wide camera original it takes only about 1.6%, and on a screen it is nearly invisible. The same settings behave completely differently on images of different resolution, so re-tune the font size when the image size changes a lot. A reasonable starting point for a single corner mark is 4% to 8% of image width, which is roughly 120 to 240 px on a 3000 px wide image.' },
          { type: 'heading', level: 3, text: '2. Nine-grid anchors position the center of the stamp' },
          { type: 'paragraph', text: 'Each nine-grid position is a relative coordinate for the stamp’s center: left, middle and right are 8%, 50% and 92% of the width, and top, middle and bottom are 10%, 50% and 90% of the height. The consequence is that a stamp on the bottom-right anchor has its center only 8% of the width from the right edge, and if the stamp is wider than about 16% of the image width, part of it is drawn outside the picture and cut off.' },
          { type: 'paragraph', text: 'For example, on a 3000 px wide image the right-hand anchor puts the center at x = 2760, 240 px from the right edge, so anything wider than about 480 px is truncated. Take text like © ToolGarden, around 12 characters (average character width roughly 0.6 of the font size, as a rough estimate): at 60 px it is about 430 px wide and just fits, but at 150 px it is about 1080 px wide and a big piece falls off the picture. The fix is to drag the stamp to a suitable spot in the preview rather than relying on the grid.' },
          { type: 'heading', level: 3, text: '3. Tiling spacing is a proportion, not pixels' },
          { type: 'paragraph', text: 'In tiled and diagonal layouts the step between neighbors is: horizontal step = stamp width + horizontal spacing × image width; vertical step = stamp height (about 1.2 times the font size) + vertical spacing × image height. Both steps are at least 20 px. The defaults are 35% horizontally and 28% vertically.' },
          { type: 'paragraph', text: 'Example: a 3000×2000 image with the default 48 px CONFIDENTIAL (roughly 375 px wide, using the 0.6-times-font-size estimate). The horizontal step is about 375 + 0.35 × 3000 ≈ 1425 px and the vertical step about 58 + 0.28 × 2000 ≈ 618 px. That gives around two stamps per row and three or four rows, each only 375 px wide, so most of the picture is empty and easy to crop around. Raise the font to 120 px and set spacing to 10% horizontally and 12% vertically: the horizontal step is about 940 + 300 ≈ 1240 px and the vertical step about 144 + 240 ≈ 384 px, a dense layer whose stamps are large enough to land on the subject. Spacing is proportional so the same numbers keep a similar density on images of different sizes.' },
          { type: 'heading', level: 3, text: 'Diagonal versus tile' },
          { type: 'list', items: [
            'Tile: stamps form a regular grid and the Rotation slider sets the angle.',
            'Diagonal: rotation is fixed at −30° and the Rotation slider has no effect; every other row is offset by half a step, giving a staggered brick pattern that is harder to cut away with one straight crop.',
          ] },

          { type: 'heading', level: 2, text: '5. How hard is each layout to defeat?' },
          { type: 'table', headers: ['Layout', 'Cropped around', 'Removed by AI inpainting', 'Impact on the picture'], rows: [
            ['Single, corner', 'Very easy; crop one side', 'Very easy; a small rectangle is what inpainting does best', 'Small'],
            ['Single, centered, semi-transparent', 'Cannot be cropped out', 'Harder, though a stamp over the subject hurts repair quality', 'Medium; covers the subject'],
            ['Tile (grid)', 'Hard', 'Harder; the whole image must be processed', 'Larger'],
            ['Diagonal (staggered)', 'Hardest', 'Hardest; the most area is covered', 'Largest; control it with low opacity'],
          ] },
          { type: 'paragraph', text: 'To be honest about it: no visible watermark is impossible to remove. Its job is to raise the cost of reuse and leave a source hint, not to replace copyright protection. Small watermarks are exactly what AI inpainting handles best; the watermark removal article explains why. For stronger proof, combine it with original files, shooting records or platform copyright registration instead of relying on the mark alone.' },

          { type: 'heading', level: 2, text: '6. Color, stroke and format' },
          { type: 'list', items: [
            'On images with mixed light and dark areas, white text with a thin black stroke is the safest. The default stroke is 0, so raise it yourself; at around 48 px try 2 to 4 px first.',
            'In JPG output, small text edges can show noise. Keep quality at about 85% or higher, and use PNG when crisp watermark text matters.',
            'If the source is a PNG with transparency and you export JPG, the transparent areas are filled with white before the watermark is drawn. Export PNG or WebP to keep transparency.',
            'The watermark is drawn into the pixels, so it cannot be toggled or moved afterwards. Keep an unwatermarked original.',
            'The export is a new file re-encoded through a Canvas, and the original EXIF data is not kept.',
          ] },
          { type: 'table', headers: ['Output format', 'Good for', 'Watch out for'], rows: [
            ['JPG', 'Photos, web publishing', 'Lossy; transparency becomes white'],
            ['PNG', 'Screenshots, keeping transparency, further editing', 'Large files'],
            ['WebP', 'Web publishing with small files', 'A few older programs cannot open it'],
          ] },

          { type: 'heading', level: 2, text: '7. Common problems and how to diagnose them' },
          { type: 'table', headers: ['Symptom', 'Cause', 'Fix'], rows: [
            ['The watermark is nearly invisible', 'Font size is in source pixels and looks tiny on a large image; or opacity is too low', 'Set the font to 4% to 8% of image width; raise opacity above 50%'],
            ['Part of the watermark is outside the picture', 'The nine-grid positions the center and the stamp is too wide', 'Drag it into place, or reduce the font size'],
            ['Tiling is sparse and can be cropped around', 'Default spacing is proportional to image width and looks sparse on large images', 'Reduce the spacing and increase the font size'],
            ['Tiling is too dense and covers the subject', 'Spacing too small and opacity too high', 'Increase the spacing and drop opacity to 20% to 30%'],
            ['Non-Latin text turns into boxes or mixed fonts', 'The tool uses the system default font and the device lacks the right one', 'Use a device with the fonts installed, or use an image watermark'],
            ['A logo watermark looks blurry', 'The source logo has too few pixels and is being enlarged', 'At 25% of a 3000 px image the logo is drawn about 750 px wide, so supply a larger source'],
            ['The exported PNG is huge', 'PNG is lossless and compresses photos poorly', 'Use JPG or WebP for photos'],
          ] },

          { type: 'heading', level: 2, text: '8. When not to use this approach' },
          { type: 'list', items: [
            'You need verifiable ownership: a visible mark is no substitute for copyright registration, original files or content credentials, and it cannot prevent removal.',
            'Processing hundreds or thousands of images: the tool handles one at a time, so scripts or professional software suit bulk work better.',
            'Invisible watermarks or digital fingerprints: these are outside what a visible watermark can do.',
            'PDF documents: use PDF Watermark, which works page by page.',
            'Photographic originals whose full metadata must survive: export re-encodes the image and drops EXIF.',
          ] },
          { type: 'callout', title: 'Need a watermark on a document?', text: 'For PDF files use the dedicated PDF watermark tool, which adds text watermarks page by page, also locally in the browser.', href: '/pdf/watermark', linkLabel: 'Open PDF Watermark' },
        ],
        faq: [
          { question: 'Why does the same setting look much smaller on another image?', answer: 'Font size is measured in source pixels while spacing is a proportion of image width and height. A 48 px font takes just 1.2% of the width on a 4000 px wide image. Re-tune the font to roughly 4% to 8% of the width after switching images.' },
          { question: 'Why is part of my bottom-right watermark outside the picture?', answer: 'The nine-grid positions the stamp’s center, and the right-hand anchor sits at 92% of the width, only 8% from the edge. A stamp wider than about 16% of the image width spills out. Reduce the font size, or drag the stamp to a better spot in the preview.' },
          { question: 'Why does the rotation slider do nothing in the diagonal layout?', answer: 'The diagonal layout fixes rotation at −30° and offsets every other row by half a step. For a custom angle, choose the Tile layout and use the Rotation slider.' },
          { question: 'Can someone remove a watermark I add?', answer: 'Yes. No visible watermark is impossible to remove. A small corner mark is the easiest to crop or repair; a centered, semi-transparent mark, or a tiled or diagonal one covering the whole image, is harder to remove at the cost of a bigger impact on the picture.' },
          { question: 'Does the exported image change size?', answer: 'No. The export has the same dimensions as the original and the watermark is drawn in source pixels. You can export JPG, PNG or WebP, and EXIF data is not kept.' },
          { question: 'Is my image uploaded?', answer: 'No. The image and the watermark asset are processed locally in the browser and not sent to a server; data is cleared when you close the page.' },
        ],
      },
    },
  },
  {
    slug: 'png-to-jpg-jpg-to-png-transparency',
    publishedAt: '2026-07-01',
    updatedAt: '2026-10-14',
    translations: {
      zh: {
        title: 'PNG 转 JPG 透明背景变白了怎么办？JPG 转 PNG 为什么更大？格式转换的真相',
        excerpt:
          'PNG 转 JPG 会把透明变成白色并引入有损压缩，JPG 转 PNG 不会让画质变好却会让体积暴涨。本文用计算和实例讲清楚每一步发生了什么、怎样选质量，以及转换后的常见问题怎么排查。',
        metaTitle: 'PNG 转 JPG 透明背景变白怎么办？质量与体积',
        metaDescription:
          '讲清 PNG 与 JPG 互转时透明背景、画质、体积和元数据的变化，附质量选择方法、排错表和格式选择指南。',
        readingTime: '11 分钟',
        tags: ['PNG 转 JPG', 'JPG 转 PNG', '透明背景', '图片格式转换'],
        relatedTools: [
          { label: '图片转 JPG', href: '/image/to-jpg', description: '把 PNG、WebP 等转成 JPG，可调质量，透明区域填充白色，支持批量。' },
          { label: '图片转 PNG', href: '/image/to-png', description: '把 JPG、WebP 等转成无损 PNG，保留透明通道。' },
          { label: '图片转 WebP', href: '/image/to-webp', description: '需要比 JPG 和 PNG 更小体积、又要保留透明时的另一个选择。' },
          { label: '图片压缩', href: '/image/compress', description: '不换格式，只缩小文件体积。' },
          { label: 'EXIF 查看', href: '/image/exif', description: '转换前查看有哪些元数据会在重新编码后丢失。' },
        ],
        blocks: [
          { type: 'lead', text: '把 PNG 转成 JPG，透明背景变成了白色，有时还多出一圈白边；把 JPG 转成 PNG，画质一点没变好，文件却大了好几倍。很多人把这些当成工具的 bug，实际上这是两种格式的设计决定的：PNG 无损且带透明通道，JPG 有损且没有透明通道。' },
          { type: 'paragraph', text: '这篇文章把转换过程拆开讲：每个方向上到底丢了什么、多了什么；用像素计算解释白边和体积；告诉你质量滑块怎么选；给出常见问题的诊断表和格式选择指南。转换在浏览器本地完成，图片不会上传到服务器。' },

          { type: 'heading', level: 2, text: '一、先看两种格式的本质差别' },
          { type: 'table', headers: ['项目', 'PNG', 'JPG'], rows: [
            ['压缩方式', '无损：解码后每个像素与原来完全相同', '有损：丢弃人眼不敏感的信息，换取更小体积'],
            ['透明通道', '支持，每个像素有 0 到 255 的不透明度', '不支持，每个像素必须是不透明的颜色'],
            ['擅长的内容', '截图、界面、文字、线稿、图标、Logo', '照片、渐变、色彩丰富的自然画面'],
            ['不擅长的内容', '照片（体积很大）', '文字和锐利线条（边缘出现杂色和块状痕迹）'],
            ['兼容性', '所有现代浏览器与软件', '兼容性最好，几乎所有系统、打印和证件上传流程都认'],
          ] },
          { type: 'paragraph', text: '体积为什么差别这么大，可以先算一笔账。一张 1920×1080 的图，每个像素 8 位 RGBA 时未压缩大小是 1920 × 1080 × 4 = 8,294,400 字节，约 7.9 MiB；如果是不带透明的 RGB，则是 6,220,800 字节，约 5.9 MiB。PNG 和 JPG 都是在这个原始数据上做压缩：照片里相邻像素几乎都不同，无损压缩几乎无从下手，所以照片存成 PNG 又大又慢；而截图里有大片重复的纯色，PNG 能压得很小，JPG 反而会在文字边缘留下杂色。' },

          { type: 'heading', level: 2, text: '二、PNG 转 JPG：发生了四件事' },
          { type: 'heading', level: 3, text: '1. 透明被填成白色' },
          { type: 'paragraph', text: 'JPG 没有透明通道，所以转换时必须先把图片合成到一个不透明的底色上。ToolGarden 的 JPG 转换固定使用白色（#ffffff），页面上也写明「透明区域会被填充为白色」。如果你期待的是黑底或某种指定颜色，要先在图片编辑里自己铺好底色再转换。' },
          { type: 'heading', level: 3, text: '2. 半透明边缘会变成「白边」' },
          { type: 'paragraph', text: '带抗锯齿的 Logo 或带阴影的图标，边缘像素是半透明的。合成到白底上的公式是：结果 = α × 前景 + (1 − α) × 底色。以一个黑色边缘像素为例：' },
          { type: 'table', headers: ['边缘像素的不透明度 α', '合成到白底后的灰度值', '感觉'], rows: [
            ['100%', '0（纯黑）', '主体'],
            ['50%', '约 128', '中灰'],
            ['25%', '约 191', '浅灰'],
            ['0%', '255（纯白）', '与背景融为一体'],
          ] },
          { type: 'paragraph', text: '问题出现在你之后把这张 JPG 放到深色背景上：边缘那一圈浅灰就成了清晰的白边。如果最终要放在深色背景上，要么保持 PNG，要么先把图片合成到与目标背景相同的颜色上再转 JPG。' },
          { type: 'heading', level: 3, text: '3. 有损重新编码' },
          { type: 'paragraph', text: 'JPG 把图像切成 8×8 的小块，对每块做频率变换，再按质量设置舍弃高频细节。质量越低舍弃越多，文字边缘和细线首先出现杂色和块状痕迹。工具的质量滑块范围是 10% 到 100%，JPG 默认 92%。这个百分比不是「保留 92% 的画质」，而是编码器的一个控制参数，不同软件的同一数值并不等价。' },
          { type: 'heading', level: 3, text: '4. 元数据和动画被丢弃' },
          { type: 'paragraph', text: '转换是在浏览器里解码再用 Canvas 重新编码，原图里的 EXIF（拍摄设备、时间、定位）不会写入新文件，这对隐私是好事，但如果你需要保留它们就要另外备份。GIF 或动图只会取第一帧。嵌入的色彩配置文件通常也不会随之保留，色域很广的图转换后可能看起来没那么饱和。' },

          { type: 'heading', level: 2, text: '三、JPG 转 PNG：不会变好，只会变大' },
          { type: 'paragraph', text: '转成 PNG 是无损的，像素值与转换前完全一致。但是「无损」是相对于输入而言的：JPG 在压缩时已经丢掉的细节不会因为换了个容器就回来，8×8 的块状痕迹也会被原样、无损地保存进 PNG。结果是文件体积大幅增加，而画质一点没变好。' },
          { type: 'paragraph', text: '既然这样，什么时候还需要 JPG 转 PNG？主要有三种情况：后续要继续编辑（改多次不想叠加有损）、需要在图上做透明蒙版或抠图再保存、目标平台只接受 PNG。除此之外，不要为了「提升画质」做这一步。' },
          { type: 'callout', title: '转成 JPG，质量自己控制', text: '拖入图片即可自动转换，调质量滑块后点「重新转换」。结果可以直接和原图并排预览对比，支持批量，并可打包成 ZIP 下载。', href: '/image/to-jpg', linkLabel: '打开图片转 JPG' },

          { type: 'heading', level: 2, text: '四、操作步骤与实用技巧' },
          { type: 'list', ordered: true, items: [
            '打开图片转 JPG 或图片转 PNG。可以点击选择、拖入文件，也可以直接粘贴剪贴板里的图片。支持 PNG、JPG、WebP、GIF、BMP、SVG、AVIF，单个文件不超过 50MB，像素不超过 4000 万。',
            '选择文件后会自动开始转换，可以一次放入多张。',
            '转 JPG 时用质量滑块（10% 到 100%）调整，改完点「重新转换」。转 PNG 没有质量选项，因为 PNG 是无损的。',
            '点缩略图打开预览，在源图与输出之间切换（可用键盘左右方向键），在 100% 或更大的缩放比例下检查文字边缘和渐变。',
            '单张下载，或点「批量下载 ZIP」一次取回全部。结果面板会显示输出尺寸、体积和耗时。',
          ] },
          { type: 'heading', level: 3, text: '实例：怎样为一张图找到合适的 JPG 质量' },
          { type: 'paragraph', text: '不要凭感觉直接选一个数字。比较稳妥的做法是：先以默认的 92% 生成作为基线，然后依次试 85%、75%、65%，每次都在 200% 的缩放下看文字边缘、纯色色块旁边是否出现杂点，以及天空、墙面等大面积渐变是否出现一条条的色带。选「刚好开始出现可见痕迹」的前一档。下面是经验性的起点，不是标准：' },
          { type: 'table', headers: ['用途', '质量起点', '理由'], rows: [
            ['需要继续编辑、存档', '90% 以上', '尽量少损失，后续还要再编码'],
            ['网页大图、作品展示', '80% 到 90%', '多数照片在此区间肉眼难分差别'],
            ['缩略图、列表小图', '70% 到 80%', '显示尺寸小，细节损失不明显'],
            ['含文字、线条的图', '尽量用 PNG', 'JPG 在文字边缘最先出问题'],
          ] },
          { type: 'heading', level: 3, text: '转换不会改变什么' },
          { type: 'paragraph', text: '格式转换只改变编码方式，不改变像素尺寸：1920×1080 的 PNG 转出来仍是 1920×1080 的 JPG，不会因此变清晰，也不会变小。需要缩小尺寸请用图片缩放，只想减小体积而保持格式请用图片压缩。另外，文件里标注的 DPI 只是给打印软件的建议，并不等于真实分辨率：一张 600×400 像素的图，无论标成 72 还是 300 DPI，能提供的细节都一样多。用于冲印时，应当看像素尺寸够不够，而不是 DPI 数字。' },
          { type: 'heading', level: 3, text: '往返转换为什么越转越差' },
          { type: 'paragraph', text: 'PNG → JPG → PNG 之后，文件又变回了 PNG，但 JPG 那一步的损失已经永久留在像素里，体积却比单纯的 JPG 大得多。反复在 JPG 上打开、保存同样会一次次叠加损失（所谓世代损失）。正确做法是始终保留一份最初的无损原图，每次从原图出发导出需要的格式。' },

          { type: 'heading', level: 2, text: '五、格式选择指南' },
          { type: 'table', headers: ['你的图片', '推荐格式', '说明'], rows: [
            ['照片，用于网页、社交平台', 'JPG，或体积更小的 WebP', '照片用 JPG 体积合适'],
            ['截图、界面、含文字', 'PNG', '无损，文字边缘干净'],
            ['Logo、图标、需要透明背景的素材', 'PNG 或 WebP', '保留透明通道，JPG 不可以'],
            ['证件照上传、旧系统、邮件附件、印刷店', 'JPG', '兼容性最好，流程普遍认'],
            ['需要多次编辑的中间稿', 'PNG', '避免每次保存都叠加损失'],
          ] },

          { type: 'heading', level: 2, text: '六、常见问题与排查' },
          { type: 'table', headers: ['现象', '原因', '处理'], rows: [
            ['转 JPG 后透明背景变成白色', 'JPG 没有透明通道，工具固定填充白色', '需要透明请保留 PNG 或改用 WebP；需要其它底色先在编辑器铺底'],
            ['图标在深色背景上有一圈白边', '半透明边缘被合成到白底再转 JPG', '保持 PNG；或先合成到目标背景色再转 JPG'],
            ['转成 JPG 后文件反而变大', '源图是压缩得很好的 WebP 或 AVIF，JPG 压缩效率不如它们', '选 JPG 的理由应是兼容性，而非体积'],
            ['JPG 转 PNG 后体积暴增', 'PNG 无损，照片几乎没有可压缩的冗余', '正常现象；不需要 PNG 就别转'],
            ['颜色看起来没原来饱和', '嵌入的色彩配置文件没有保留，广色域图尤其明显', '需要精确色彩的印刷或设计稿保留原文件'],
            ['文字边缘有杂色和块状痕迹', 'JPG 质量太低，或文字类内容不适合 JPG', '提高质量；文字类图片改用 PNG'],
            ['动图只剩一张静态图', 'GIF 或动图只取第一帧', '需要动画请保留原格式，或使用 GIF 工具分帧'],
            ['拍摄时间、定位等信息没了', '重新编码不写入 EXIF', '需要的话先用 EXIF 查看工具记录，原件另存'],
          ] },
          { type: 'callout', title: '需要无损格式或保留透明？', text: '转成 PNG 无损且保留透明通道，适合截图、图标和后续继续编辑的中间稿。', href: '/image/to-png', linkLabel: '打开图片转 PNG' },

          { type: 'heading', level: 2, text: '七、什么时候不该用这个方法' },
          { type: 'list', items: [
            '需要保留拍摄元数据的摄影原片：转换会丢掉 EXIF，请保留原文件。',
            '指望靠 JPG 转 PNG 提升画质：做不到，已经损失的细节不会回来。',
            '需要动画：转换只取第一帧。',
            '需要精确色彩管理的印刷稿（CMYK、专业 ICC 配置文件）：浏览器 Canvas 转换不适合。',
            '只想缩小体积、不想换格式：应使用图片压缩，它可以保持原格式。',
          ] },
        ],
        faq: [
          { question: 'PNG 转 JPG 后透明背景变成什么颜色？', answer: '白色。JPG 没有透明通道，ToolGarden 在转换 JPG 时固定把透明区域填充为白色。要保留透明，请保持 PNG 或使用 WebP；要换成其它底色，先在图片编辑里铺好再转换。' },
          { question: '为什么 JPG 转 PNG 之后文件大了很多，画质也没变好？', answer: 'PNG 是无损压缩，照片类内容几乎没有可压缩的冗余，所以体积大。JPG 已经丢掉的细节不会因为换成无损格式而恢复。这一步的意义是之后编辑不再叠加新的损失，而不是修复已有的压缩痕迹。' },
          { question: 'JPG 质量该选多少？', answer: '没有放之四海皆准的数字。以 92% 为基线，依次试 85%、75%，在 200% 缩放下检查文字边缘和渐变，选刚开始出现可见痕迹的前一档。含文字的图片尽量用 PNG。' },
          { question: '转换后拍摄时间、定位信息还在吗？', answer: '不在。转换是解码后重新编码，EXIF 不会写入新文件。如果你需要这些信息，转换前先用 EXIF 查看工具记录，并保留原文件。' },
          { question: '可以一次转换很多张吗？', answer: '可以。支持一次放入多张，每张有独立的状态，完成后可以逐张下载，也可以打包成 ZIP 一次下载。单个文件上限是 50MB 和 4000 万像素。' },
          { question: '图片会被上传到服务器吗？', answer: '不会。转换优先在浏览器的本地 Worker 中完成，文件不会上传，关闭页面后数据会被清除。' },
        ],
      },
      en: {
        title: 'PNG to JPG Turned the Transparent Background White? Why JPG to PNG Gets Bigger, Explained',
        excerpt:
          'Converting PNG to JPG replaces transparency with white and adds lossy compression, while JPG to PNG cannot improve quality yet makes the file much larger. Calculations and examples show what happens at each step, how to pick a quality setting, and how to troubleshoot.',
        metaTitle: 'PNG to JPG Transparency Turned White? Quality and Size',
        metaDescription:
          'What happens to transparency, quality, size and metadata when converting PNG to JPG and back, plus a quality-picking method and fixes.',
        readingTime: '11 min read',
        tags: ['PNG to JPG', 'JPG to PNG', 'transparency', 'image conversion'],
        relatedTools: [
          { label: 'Image to JPG', href: '/image/to-jpg', description: 'Convert PNG, WebP and more to JPG with adjustable quality; transparent areas become white; batch supported.' },
          { label: 'Image to PNG', href: '/image/to-png', description: 'Convert JPG, WebP and more to lossless PNG, keeping the alpha channel.' },
          { label: 'Image to WebP', href: '/image/to-webp', description: 'Another option when you want smaller files than JPG or PNG while keeping transparency.' },
          { label: 'Image Compressor', href: '/image/compress', description: 'Shrink the file without changing the format.' },
          { label: 'EXIF Viewer', href: '/image/exif', description: 'See which metadata will be lost on re-encoding before you convert.' },
        ],
        blocks: [
          { type: 'lead', text: 'You convert a PNG to JPG and the transparent background turns white, sometimes with a white fringe around the edges. You convert a JPG to PNG and the quality does not improve at all while the file grows several times over. Many people assume the tool is buggy, but both outcomes follow from how the formats are designed: PNG is lossless and has a transparency channel, while JPG is lossy and has none.' },
          { type: 'paragraph', text: 'This guide takes the conversion apart: what is lost and what is added in each direction; pixel arithmetic that explains white fringes and file size; how to choose the quality slider; and a troubleshooting table and format guide. Conversion runs locally in the browser and the image is not uploaded.' },

          { type: 'heading', level: 2, text: '1. The essential difference between the formats' },
          { type: 'table', headers: ['Item', 'PNG', 'JPG'], rows: [
            ['Compression', 'Lossless: every decoded pixel equals the original', 'Lossy: discards information the eye is less sensitive to, in exchange for smaller files'],
            ['Transparency', 'Supported; each pixel has an opacity from 0 to 255', 'Not supported; every pixel must be an opaque color'],
            ['Good at', 'Screenshots, interfaces, text, line art, icons, logos', 'Photographs, gradients, colorful natural scenes'],
            ['Poor at', 'Photographs (very large files)', 'Text and sharp lines (stray color and blocky artifacts at edges)'],
            ['Compatibility', 'All modern browsers and software', 'The safest; accepted by almost every system, print workflow and ID upload form'],
          ] },
          { type: 'paragraph', text: 'To see why file sizes differ so much, do the arithmetic. A 1920×1080 image at 8-bit RGBA is 1920 × 1080 × 4 = 8,294,400 bytes uncompressed, about 7.9 MiB; as opaque RGB it is 6,220,800 bytes, about 5.9 MiB. PNG and JPG both compress that raw data. In a photograph neighboring pixels almost never match, so lossless compression has little to work with and a PNG photo is large and slow; a screenshot has big areas of flat color that PNG compresses very small, while JPG leaves stray color around the text.' },

          { type: 'heading', level: 2, text: '2. PNG to JPG: four things happen' },
          { type: 'heading', level: 3, text: '1. Transparency is filled with white' },
          { type: 'paragraph', text: 'JPG has no alpha channel, so the image must first be composited onto an opaque background. ToolGarden’s JPG conversion always uses white (#ffffff), and the page states that transparent areas are filled with white. If you want black or some specific color, lay that backdrop down in an image editor before converting.' },
          { type: 'heading', level: 3, text: '2. Semi-transparent edges turn into a white fringe' },
          { type: 'paragraph', text: 'An anti-aliased logo or an icon with a shadow has semi-transparent edge pixels. Compositing onto white follows: result = α × foreground + (1 − α) × background. Take a black edge pixel as an example:' },
          { type: 'table', headers: ['Edge pixel opacity α', 'Gray value after compositing on white', 'Appearance'], rows: [
            ['100%', '0 (pure black)', 'The subject'],
            ['50%', 'about 128', 'Mid gray'],
            ['25%', 'about 191', 'Light gray'],
            ['0%', '255 (pure white)', 'Blends into the background'],
          ] },
          { type: 'paragraph', text: 'The trouble comes when you later place the JPG on a dark background: that ring of light gray at the edge becomes a visible white fringe. If the image will end up on a dark background, either keep it as PNG, or composite it onto the target background color first and then convert to JPG.' },
          { type: 'heading', level: 3, text: '3. Lossy re-encoding' },
          { type: 'paragraph', text: 'JPG cuts the image into 8×8 blocks, applies a frequency transform to each, and discards high-frequency detail according to the quality setting. The lower the quality, the more is discarded, and text edges and thin lines show stray color and blocks first. The tool’s quality slider runs from 10% to 100%, with 92% as the JPG default. The percentage is not “92% of the quality is kept”; it is a control parameter of the encoder, and the same number in different software is not equivalent.' },
          { type: 'heading', level: 3, text: '4. Metadata and animation are dropped' },
          { type: 'paragraph', text: 'The conversion decodes in the browser and re-encodes through a Canvas, so the original EXIF data (device, time, location) is not written to the new file. That is good for privacy, but if you need it, back it up separately. Only the first frame of a GIF or animation is taken. An embedded color profile generally does not carry over either, so a wide-gamut image may look less saturated afterwards.' },

          { type: 'heading', level: 2, text: '3. JPG to PNG: it cannot get better, only bigger' },
          { type: 'paragraph', text: 'Converting to PNG is lossless: pixel values are identical to what went in. But “lossless” is relative to the input. Detail that JPG already discarded does not return because the container changed, and the 8×8 block artifacts are preserved perfectly inside the PNG. The result is a much larger file and no improvement in quality.' },
          { type: 'paragraph', text: 'So when is JPG to PNG still worth doing? Mainly in three cases: you will keep editing and do not want each save to add loss, you need to apply a transparency mask or cutout before saving, or the destination accepts only PNG. Otherwise do not do it “to improve quality”.' },
          { type: 'callout', title: 'Convert to JPG and control the quality yourself', text: 'Drop images in and conversion starts automatically; adjust the quality slider and press Convert again. Results can be previewed side by side with the source, converted in batch and downloaded as a ZIP.', href: '/image/to-jpg', linkLabel: 'Open Image to JPG' },

          { type: 'heading', level: 2, text: '4. Procedure and practical tips' },
          { type: 'list', ordered: true, items: [
            'Open Image to JPG or Image to PNG. Click to choose files, drag them in, or paste an image from the clipboard. PNG, JPG, WebP, GIF, BMP, SVG and AVIF are accepted, up to 50 MB and 40 million pixels per file.',
            'Conversion starts automatically after you choose files, and you can drop in several at once.',
            'For JPG, adjust with the quality slider (10% to 100%) and press Convert again. PNG has no quality option because it is lossless.',
            'Click a thumbnail to open the preview and flip between source and output (the left and right arrow keys work). Check text edges and gradients at 100% or higher zoom.',
            'Download one by one, or press Download ZIP to take everything at once. The result panel shows output dimensions, size and time taken.',
          ] },
          { type: 'heading', level: 3, text: 'Example: finding the right JPG quality for one image' },
          { type: 'paragraph', text: 'Do not pick a number by feel. A more reliable method is to generate at the default 92% as a baseline, then try 85%, 75% and 65%, each time checking at 200% zoom for stray specks around text edges and beside flat color areas, and for banding in large gradients such as sky or walls. Choose the step just before visible artifacts begin. The table below gives rule-of-thumb starting points, not standards.' },
          { type: 'table', headers: ['Purpose', 'Starting quality', 'Reason'], rows: [
            ['Further editing, archiving', '90% or higher', 'Lose as little as possible; it will be re-encoded again'],
            ['Large web images, portfolio display', '80% to 90%', 'In this range most photos are hard to tell apart by eye'],
            ['Thumbnails, small list images', '70% to 80%', 'Displayed small, so detail loss is hardly visible'],
            ['Images with text or lines', 'Prefer PNG', 'JPG fails first at text edges'],
          ] },
          { type: 'heading', level: 3, text: 'What conversion does not change' },
          { type: 'paragraph', text: 'Format conversion changes only the encoding, not the pixel dimensions: a 1920×1080 PNG comes out as a 1920×1080 JPG, which is neither sharper nor smaller in size. Use the resize tool to change dimensions, or the compressor to shrink the file while keeping the format. Also, the DPI value stored in a file is only a hint for print software and is not the real resolution: a 600×400 pixel image holds the same amount of detail whether it is labeled 72 or 300 DPI. For photo printing, check whether the pixel dimensions are large enough, not the DPI number.' },
          { type: 'heading', level: 3, text: 'Why round trips get worse every time' },
          { type: 'paragraph', text: 'After PNG to JPG to PNG the file is a PNG again, but the loss from the JPG step is permanently baked into the pixels, and the file is much larger than the JPG alone. Opening and re-saving a JPG repeatedly stacks loss each time (generation loss). The right habit is to keep one original lossless image and export every format you need from it.' },

          { type: 'heading', level: 2, text: '5. Choosing a format' },
          { type: 'table', headers: ['Your image', 'Recommended format', 'Notes'], rows: [
            ['Photo for the web or social platforms', 'JPG, or the smaller WebP', 'JPG is a good size for photos'],
            ['Screenshots, interfaces, text', 'PNG', 'Lossless, with clean text edges'],
            ['Logos, icons, assets needing transparency', 'PNG or WebP', 'Keeps the alpha channel; JPG cannot'],
            ['ID photo uploads, legacy systems, email attachments, print shops', 'JPG', 'The best compatibility; accepted almost everywhere'],
            ['Working files edited several times', 'PNG', 'Avoids stacking loss on every save'],
          ] },

          { type: 'heading', level: 2, text: '6. Common problems and how to check them' },
          { type: 'table', headers: ['Symptom', 'Cause', 'Fix'], rows: [
            ['Transparent background becomes white after converting to JPG', 'JPG has no alpha channel and the tool fills with white', 'Keep PNG or use WebP for transparency; lay a different backdrop in an editor first if needed'],
            ['A white fringe appears around an icon on a dark background', 'Semi-transparent edges were composited onto white before saving as JPG', 'Keep PNG, or composite onto the target background color first'],
            ['The file got bigger after converting to JPG', 'The source was a well-compressed WebP or AVIF, which JPG cannot match', 'Choose JPG for compatibility, not size'],
            ['File size explodes after JPG to PNG', 'PNG is lossless and photos have little redundancy to remove', 'Expected; do not convert if you do not need PNG'],
            ['Colors look less saturated than before', 'The embedded color profile is not kept; wide-gamut images show it most', 'Keep the original for color-critical print or design work'],
            ['Stray color and blocks around text', 'JPG quality too low, or text-heavy content does not suit JPG', 'Raise quality; use PNG for text-heavy images'],
            ['An animation became a single still', 'Only the first frame of a GIF or animation is taken', 'Keep the original format, or use a GIF tool to split frames'],
            ['Capture time and location are gone', 'Re-encoding does not write EXIF', 'Record it with the EXIF viewer first and keep the original file'],
          ] },
          { type: 'callout', title: 'Need lossless output or transparency?', text: 'PNG is lossless and keeps the transparency channel, which suits screenshots, icons and working files you will keep editing.', href: '/image/to-png', linkLabel: 'Open Image to PNG' },

          { type: 'heading', level: 2, text: '7. When not to use this approach' },
          { type: 'list', items: [
            'Photographic originals whose capture metadata matters: conversion drops EXIF, so keep the original file.',
            'Hoping JPG to PNG will improve quality: it cannot; detail already lost does not come back.',
            'Anything animated: only the first frame is kept.',
            'Print work needing strict color management (CMYK, professional ICC profiles): a browser Canvas conversion is not suitable.',
            'Just wanting a smaller file without changing format: use the image compressor, which can keep the original format.',
          ] },
        ],
        faq: [
          { question: 'What color does the transparent background become when converting PNG to JPG?', answer: 'White. JPG has no transparency channel, and ToolGarden always fills transparent areas with white when converting to JPG. To keep transparency, stay with PNG or use WebP; for another backdrop color, lay it down in an image editor first and then convert.' },
          { question: 'Why is a PNG made from a JPG so much larger, with no better quality?', answer: 'PNG is lossless, and photographic content has almost no redundancy to remove, so the file is large. Detail that JPG already discarded does not come back in a lossless container. The point of the step is that later edits add no new loss, not that existing artifacts are repaired.' },
          { question: 'What JPG quality should I choose?', answer: 'There is no universal number. Use 92% as a baseline, then try 85% and 75%, check text edges and gradients at 200% zoom, and pick the step just before visible artifacts appear. For images with text, prefer PNG.' },
          { question: 'Are capture time and location kept after conversion?', answer: 'No. Conversion decodes and re-encodes, and EXIF is not written to the new file. If you need that information, record it with the EXIF viewer before converting and keep the original file.' },
          { question: 'Can I convert many images at once?', answer: 'Yes. You can drop in several; each has its own status, and you can download them one by one or as a single ZIP. Each file is limited to 50 MB and 40 million pixels.' },
          { question: 'Is my image uploaded to a server?', answer: 'No. Conversion runs in a local browser Worker first, files are not uploaded, and data is cleared when you close the page.' },
        ],
      },
    },
  },
];
