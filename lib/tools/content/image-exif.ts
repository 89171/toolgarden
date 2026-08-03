import { defineToolContent } from './define';

export const imageExifContent = defineToolContent({
  zh: {
    overview: [
      'EXIF 是相机和手机常写入图片的元数据，可能包含拍摄时间、设备型号、镜头、曝光、方向以及 GPS 坐标。它能帮助整理和排查照片，也可能在公开分享时泄露家庭、工作地点或设备信息。',
      '工具会在浏览器中读取可识别的元数据，并可通过重新绘制图片生成移除 EXIF 的副本。重新编码通常会清除常见拍摄字段，但也可能改变格式、质量、色彩配置或其它非 EXIF 元数据，因此需要单独验证输出。',
    ],
    steps: [
      ['上传并读取元数据', '查看设备、时间、方向与位置字段，重点留意 latitude 和 longitude。'],
      ['判断是否需要保留', '归档原件可保留拍摄信息，公开副本则按隐私需要移除。'],
      ['导出并复查', '下载清理后的新文件，再重新读取确认敏感字段已经消失。'],
    ],
    scenarios: [
      ['发布照片前检查隐私', '确认社交媒体、论坛或二手交易图片不包含精确 GPS 位置。'],
      ['排查照片来源', '查看拍摄时间、相机型号和方向字段，解释显示旋转或排序异常。'],
      ["公开发布照片前清掉定位", "把手机拍的照片发到公开平台前抹除 EXIF，避免同时公开拍摄地点、时间和设备型号。"],
    ],
    notes: [
      '没有读取到 EXIF 不代表文件完全没有元数据，格式还可能包含 XMP、IPTC 或自定义块。',
      '重新编码会生成新图片，应保留原件用于归档、取证或后续专业处理。',
      '拍摄时间可能没有可靠时区，跨设备排序时不能只依赖该字段。',
    ],
    specs: [["可读取的信息", "拍摄时间、相机与镜头型号、光圈快门 ISO、GPS 定位、软件与编辑记录"], ["隐私风险", "手机拍摄的照片默认含精确 GPS 坐标，直接分享等于公开拍摄地点"], ["清除操作", "一键抹除后重新导出，输出文件不含任何 EXIF"], ["不可逆", "抹除后原信息无法找回，需要留档请先另存一份原图"], ["哪些格式有 EXIF", "主要是 JPG 和部分 TIFF / HEIC；PNG 通常不携带 EXIF"], ["其它工具的副作用", "图片压缩、转格式、裁剪等重新编码操作本身也会丢弃 EXIF"]],
    faq: [{ question: "社交平台不是会自动去掉 EXIF 吗？", answer: "多数主流平台确实会，但不能一概而论：直接发原图到聊天工具、上传到网盘或邮件附件通常都保留完整 EXIF。涉及住址或行程的照片，自己先清一遍更稳妥。" }, { question: "抹除后照片本身会变化吗？", answer: "画面像素不受影响。但清除操作会重新写出文件，如果输出为 JPG 则涉及一次重编码，画质会有极轻微损失。对隐私敏感的场景，这个代价通常是值得的。" }],
    reference: [
      ['EXIF', '常见于照片中的拍摄设备和参数元数据标准。'],
      ['GPS metadata', '记录纬度、经度，有时还包含海拔和方向的定位字段。'],
    ],
  },
  en: {
    overview: [
      'EXIF is metadata commonly written by cameras and phones and may contain capture time, device model, lens, exposure, orientation, and GPS coordinates. It helps organize and diagnose photos but can reveal a home, workplace, or device when an image is shared publicly.',
      'The tool reads recognizable metadata in the browser and can create a re-rendered copy with EXIF removed. Re-encoding usually clears common capture fields but may also change format, quality, color profile, or other non-EXIF metadata, so the output needs independent verification.',
    ],
    steps: [
      ['Upload and read metadata', 'Inspect device, time, orientation, and location fields, especially latitude and longitude.'],
      ['Decide what to retain', 'Keep capture information in an archive original and remove it from a public copy when privacy requires.'],
      ['Export and recheck', 'Download the cleaned copy and read it again to confirm sensitive fields are absent.'],
    ],
    scenarios: [
      ['Checking privacy before sharing', 'Confirm that a social, forum, or marketplace photo does not expose precise GPS coordinates.'],
      ['Investigating photo origin', 'Use capture time, camera model, and orientation to explain rotation or sorting problems.'],
      ["Stripping location before publishing a photo", "Clearing EXIF from a phone photo before it goes to a public platform avoids publishing where and when it was taken, and on what device."],
    ],
    notes: [
      'No detected EXIF does not prove that all metadata is absent; a format may also carry XMP, IPTC, or custom chunks.',
      'Re-encoding creates a new image, so retain the original for archives, evidence, or later professional work.',
      'Capture time may lack a reliable time zone and should not be the sole basis for cross-device ordering.',
    ],
    specs: [["What it reads", "Capture time, camera and lens model, aperture / shutter / ISO, GPS coordinates, and software and edit history"], ["Privacy risk", "Phone photos carry precise GPS by default, so sharing one unedited publishes where it was taken"], ["Stripping", "One click removes everything and re-exports a file with no EXIF at all"], ["Irreversible", "Stripped data cannot be recovered; save a copy of the original if you need it on file"], ["Which formats carry EXIF", "Mainly JPG and some TIFF / HEIC; PNG usually carries none"], ["Side effect of other tools", "Compressing, converting or cropping re-encodes the image and discards EXIF as a by-product"]],
    faq: [{ question: "Do social platforms not strip EXIF automatically?", answer: "Most major ones do, but you cannot rely on it in general; sending an original through a chat app, uploading to cloud storage or attaching to email typically keeps the full EXIF. Strip it yourself for anything involving your home or travel." }, { question: "Does stripping change the photo?", answer: "The pixels are unaffected. The file is rewritten, though, and JPG output means one re-encode with a very slight quality cost. For anything privacy-sensitive that trade is usually worth it." }],
    reference: [
      ['EXIF', 'A metadata standard commonly used for photographic device and capture parameters.'],
      ['GPS metadata', 'Location fields containing latitude and longitude and sometimes altitude or direction.'],
    ],
  },
});
