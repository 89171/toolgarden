# ONNX Runtime Web browser entry

`ort.wasm.min.mjs` is the browser WASM entry from `onnxruntime-web@1.24.3` (MIT).

It exists for one consumer: `@paddleocr/paddleocr-js` bundles its own ORT 1.24.3
into `dist/assets/worker-entry-*.js` and loads it at runtime as
`new URL('ort.bundle.min.mjs', import.meta.url)`. That bare filename is not
resolvable by the bundler, so `next.config.ts` aliases `ort.bundle.min.mjs` to
this file — which must stay at 1.24.3 to match the WASM served from
`public/models/paddleocr/onnxruntime-web/`.

It is deliberately **not** aliased onto the bare `onnxruntime-web` specifier:
that alias is global and would also hijack `@imgly/background-removal`, which
pairs its ORT JS with older WASM from its own CDN. See the comment in
`next.config.ts`.

SHA-256: `d5a6d7bc8ee587648fb3742dde8c0094d17cbd3822a68bbec8ddfcd4f2adb88e`
