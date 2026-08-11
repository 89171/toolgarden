# RealESRGAN_x4plus ONNX FP16

- Source project: https://github.com/xinntao/Real-ESRGAN
- Source release: `v0.1.0/RealESRGAN_x4plus.pth`
- Source SHA-256: `4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1`
- Converted model: `realesrgan-x4plus-fp16.onnx`
- Converted SHA-256: `6d7f5edb582625d7c0db3bd2883f1cdfe7fcf9b75a3138da238ad8be95741c7d`
- ONNX opset: 17
- Input/output: float32 NCHW, dynamic spatial dimensions
- Internal weights and operations: float16 where supported
- License: BSD 3-Clause; see `LICENSE-Real-ESRGAN.txt`

The conversion is reproducible with `scripts/convert-realesrgan-x4plus.py`.
The PyTorch FP32 checkpoint is used only as the conversion and numerical
reference and is not shipped to browsers.

Validation on a deterministic 12 × 13 RGB tensor:

- PyTorch FP32 vs ONNX FP32 maximum absolute error: `8.28505e-06`
- PyTorch FP32 vs ONNX FP16 maximum absolute error: `0.00272`
- PyTorch FP32 vs ONNX FP16 mean absolute error: `0.000247787`
