# RealESRGAN_x4plus ONNX FP16

- Source project: https://github.com/xinntao/Real-ESRGAN
- Source release: `v0.1.0/RealESRGAN_x4plus.pth`
- Source SHA-256: `4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1`
- Reconstructed model SHA-256: `6d7f5edb582625d7c0db3bd2883f1cdfe7fcf9b75a3138da238ad8be95741c7d`
- Deployment part 1: `realesrgan-x4plus-fp16.part-01.onnx`, 17,000,000 bytes, SHA-256 `f2c7dc36077831f4c4874a94a8639620c4839378be11a5bc6cc6ecdccaec9dee`
- Deployment part 2: `realesrgan-x4plus-fp16.part-02.onnx`, 16,756,472 bytes, SHA-256 `28345f9f03a92cc2ac329ccaf77d5e2669c3523d6638995428c6128b44c0fc3b`
- ONNX opset: 17
- Input/output: float32 NCHW, dynamic spatial dimensions
- Internal weights and operations: float16 where supported
- License: BSD 3-Clause; see `LICENSE-Real-ESRGAN.txt`

The PyTorch FP32 checkpoint is used only as the conversion and numerical
reference and is not shipped to browsers. For ESA Pages deployment, the ONNX
file is split into two byte-for-byte parts below the 25 MB per-file limit. The
browser joins both parts in memory before creating the ONNX Runtime session;
the split does not change the graph or weights.

Validation on a deterministic 12 × 13 RGB tensor:

- PyTorch FP32 vs ONNX FP32 maximum absolute error: `8.28505e-06`
- PyTorch FP32 vs ONNX FP16 maximum absolute error: `0.00272`
- PyTorch FP32 vs ONNX FP16 mean absolute error: `0.000247787`
