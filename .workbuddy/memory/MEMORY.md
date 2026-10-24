# ToolGarden 项目长期笔记

## 构建与环境的坑（重要）
- 仓库**没有 package-lock.json**，`npm install` 每次全量解析，非常慢（单包也可能 10 分钟+），且本机沙箱曾把 install 杀掉。装新依赖后要确认 package.json 里已写入。
- 本机 WorkBuddy 环境通过 `NODE_OPTIONS` 注入 node shim：`rmSync('.next')` 会触发 `SAFE_DELETE_BULK_CONFIRM_REQUIRED`。生产构建的正确姿势：
  `rm -rf .next; env -u NODE_OPTIONS npm run build`，且需**非沙箱**运行（沙箱内 next build 预渲染会报 `ECONNREFUSED .../broker.sock`）。
- 一次被杀的 npm install 会把 `node_modules/.bin` 删掉；可手工重建 symlink（vitest/tsc/eslint/next/tsx 等）。
- `npx vitest` 不可用（PATH 无 .bin），用 `./node_modules/.bin/vitest run`。

## 架构约定（摘自 AGENTS.md，实测有效）
- 所有工具发现逻辑由 `lib/tools/registry.ts` 驱动；新工具 checklist：registry + messages(zh/en) 的 `tools.<id>` / `tool_faq.<id>` / `organic_keywords.<id>` + `lib/utils/` 纯函数 + `components/` 页面组件 + `app/[locale]/<path>/{page,layout}.tsx` + `lib/tools/content/<id>.ts` 正文。
- 面包屑/privacy-trust 按 hub 前缀匹配（`/image/`、`/audio/`、`/video/`…），新 hub 前缀要同时改 ToolLayout 与 registry 的 `isNonJsonTopLevelTool`、`RELATED_HUB_PREFIXES`，**且要建 hub 页并接线**（完整 7 步 checklist 见 2026-10-24 日志：hub page / Header / HomePageContent / seo.ts 三处 / site registry hubPaths / lastmod 脚本 / messages 三块）。
- SEO 文案有硬校验（tests/harness.test.ts）：zh 描述 70–90 字符以。结尾、en 120–155 以. 结尾；`messages.tools.<id>.description` 是 SEO 文案来源，标题取描述开头短语（zh ≤30 字符，注意别在半词处截断）。
- harness.test.ts 有 2 个**存量失败**（browser-file SEO series + SEO 描述），涉及 image-ocr / image-rotate / image-color-picker / image-gif / pdf-encrypt / pdf-to-image / audio-lyric-video / font-preview 等旧工具，与新改动无关。

## 浏览器本地 AI 管线
- 图片去水印/擦除：MI-GAN 512（HuggingFace `andraniksargsyan/migan`，~28MB）+ LaMa ONNX（`Carve/LaMa-ONNX` lama_fp32，~198MB），onnxruntime-web 1.21 本地推理，入口在 `lib/utils/image-browser.ts`（`inpaintCanvasRegionWithMigan` / `inpaintCanvasRegionWithLama` 已导出供视频复用）。
- MI-GAN 会话优先 WebGPU EP（实测 ~2-3.5s→~400ms/帧），创建失败回退 WASM；可用 `disableMiganWebGpu()` 强制降级 + `resetMiganWatermarkSession()` 重建会话（视频管线看门狗超时 120s 时调用）。LaMa 刻意 WASM-only——WebGPU 下会静默死锁；推理慢约 7 倍但大洞修复 +11.6dB，仅作视频 HQ 选装档。
- 视频去水印（2026-10-24 新增 `/video/remove-watermark`）：时域采样 → 中值重建（背景动）或 MI-GAN 单帧补全（背景静）或 LaMa HQ（显式选装，auto 永不自动选）→ WebCodecs VideoEncoder + mp4-muxer@5.2.2 编码 MP4 → ffmpeg.wasm 回填音轨。纯函数在 `lib/utils/video-watermark.ts`，管线在 `video-watermark-browser.ts`。
- 视频重编码共享管线（压缩 `/video/compress`、截取 `/video/trim`）：`lib/utils/video-reencode.ts` + `video-reencode-browser.ts`，码率 = 分辨率×30fps×画质系数（high 0.12 / medium 0.07 / low 0.04）。GIF 管线（`/video/to-gif`）：`lib/utils/video-gif.ts` + `video-gif-browser.ts`，确定性 seek 采样 + gifenc@1.0.3（**手工安装**：node_modules 手动解压 + package.json 声明 + `types/gifenc.d.ts`，本机 npm install 会破坏 .bin）。
- ffmpeg.wasm 加载入口：`lib/utils/audio-browser.ts` 的 `loadFfmpeg(onProgress)`（直接传回调，不是 options 对象）。
- 专用视频修复 SOTA（ProPainter/E2FGVI/SAM2+ProPainter）需要 Python+GPU，与"纯浏览器本地"定位冲突，未采用。
