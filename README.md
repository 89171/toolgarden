# ToolGarden / JSON Toolkit

ToolGarden is a browser-local toolbox for developers and everyday file work. It includes JSON utilities, PDF tools, image tools, audio tools, text tools, QR code tools, whiteboards, mind maps, and other small tools that are useful when you need to process something quickly without installing a desktop app.

The project started as a JSON toolkit and has grown into a registry-driven web app with 88 tools, bilingual pages, static SEO output, and a strong preference for local processing.

## Highlights

- Browser-local processing for most JSON, PDF, image, audio, subtitle, and text tasks.
- No account required.
- Bilingual UI for Chinese and English.
- Local model loading for AI-style tools where practical, instead of routing files through a backend service.
- Registry-driven discovery: home page cards, categories, related tools, breadcrumbs, sitemap, metadata, JSON-LD, and `llms.txt` are derived from the tool registry.
- PWA support for repeated use from the browser.

## Tool Categories

### JSON And Developer Tools

- JSON format, minify, escape, repair, diff, stats, and JSONPath query.
- JSON conversion to YAML, XML, CSV, Excel, TypeScript interfaces, and JSON Schema.
- JSON Schema validation.
- JWT decode and HS256 verification.
- Timestamp conversion, UUID generation, regex testing, cron expression parsing, color conversion, URL query builder, and information codec tools.

### PDF And File Tools

- Convert Word, Excel, PowerPoint, images, Markdown, HTML, text, CSV, RTF, EPUB, and supported MOBI files to PDF.
- PDF to Word and PDF to image.
- Merge, split, extract, organize, encrypt, decrypt, and watermark PDFs.
- Merge Word, PPT, Excel, CSV, TXT, Markdown, RTF, and image files.

### Image Tools

- Compress, resize, crop, rotate, flip, convert, and merge images.
- Convert images to JPG, PNG, WebP, AVIF, Base64, ICO, ICNS, and multi-size PNG icon bundles.
- Remove background, make ID photos, remove or add watermarks, enhance clarity, upscale images, run OCR, inspect or remove EXIF data, pick colors, and split or create GIFs.

### Audio, Text, And Other Tools

- Convert audio to MP3 or WAV.
- Extract audio from video, merge audio, trim audio, compress audio, record audio, change volume, change speed, change sample rate, change bitrate, and remove silence.
- Transcribe audio, split audio stems, and generate speech from text.
- Convert Markdown to PDF or HTML, compare text, count words, generate or decode QR codes, subset fonts, draw on a whiteboard, use an Excalidraw board, and edit mind maps.

## Local Models And No Backend Processing

ToolGarden is designed around a simple rule: if a task can reasonably run in the browser, it should not require a backend service.

Some examples:

- Image background removal loads an open-source model in the browser and exports a transparent PNG locally.
- Image enhancement and upscaling run local image-processing or model-based workflows where supported by the browser.
- Image OCR extracts text in the browser.
- Audio transcription loads an open-source Whisper-style model locally.
- Audio stem separation runs in the browser and exports separate tracks such as vocals, drums, bass, guitar, piano, and other.
- Text-to-speech uses locally loaded Kokoro voice assets to generate audio.
- Many PDF, image, audio, subtitle, and JSON conversions happen directly in browser memory.

This keeps user files on the device for supported tools and avoids server-side queues or file-processing infrastructure. The tradeoff is that first use may download model files, and heavy jobs depend on the user's browser, memory, CPU, and GPU support.

## Architecture

The project follows a registry-driven "Harness Engineering" architecture.

The tool registry is the single source of truth:

```ts
// lib/tools/registry.ts
export const toolRegistry = [
  {
    id: 'json-format',
    name: 'JSON Format',
    path: '/json-format',
    category: 'format',
    featured: true,
  },
];
```

From that registry, the app derives:

- Home page tool cards.
- Category groups.
- Featured tools.
- Breadcrumbs.
- Related tools.
- Localized tool URLs.
- Sitemap entries.
- SEO metadata.
- Open Graph metadata.
- JSON-LD structured data.
- `llms.txt` and `llms-full.txt` discovery files.

Tool pages stay thin. Complex parsing, conversion, validation, model routing, and file-processing logic belongs in `lib/utils/` as reusable functions. Pages under `app/[locale]/...` should mainly handle React state, user input, and rendering.

## Project Structure

```text
app/                  Next.js App Router pages and layouts
app/[locale]/         Localized pages
components/           Shared UI and tool shells
components/ui/        Low-level UI components
i18n/                 next-intl routing and request config
lib/tools/            Tool registry, metadata, SEO, and content helpers
lib/utils/            Pure or browser-local tool logic
lib/workers/          Web workers for heavier local processing
messages/             Chinese and English translations
public/               Static assets and generated public files
scripts/              Build, sitemap, static metadata, and content scripts
tests/                Vitest tests
```

## Development

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test
```

## Adding A Tool

When adding a new tool:

1. Add its metadata to `lib/tools/registry.ts`.
2. Add Chinese and English copy to `messages/zh.json` and `messages/en.json`.
3. Put reusable logic in `lib/utils/`.
4. Create the localized page under `app/[locale]/...`.
5. Wrap the page with `ToolLayout`.
6. Reuse existing metadata helpers for SEO.
7. Run lint, TypeScript, build, and relevant tests.

Avoid hardcoding duplicate discovery data in home pages, navigation, breadcrumbs, sitemap, or SEO files. If a tool is official, it should be discoverable from the registry.

## Privacy Notes

Supported local tools process input in the browser and do not upload the user's file or text content to an application backend for conversion. Page-level analytics, ads, CDN security, browser cache, service-worker data, and third-party scripts are separate from tool input processing and should be reviewed in the site's privacy policy.

For sensitive work, users should still use a maintained browser, be careful with browser extensions, and work on copies of important files.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- next-intl
- Vitest
- FFmpeg WebAssembly
- PDF.js and PDF libraries
- Transformers-style browser inference
- Browser workers for heavy local tasks
