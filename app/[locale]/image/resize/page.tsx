import { ImageCropResize } from '@/components/ImageCropResize';
import { imageResizeContent } from '@/lib/tools/content/image-resize';

export default function ImageResizePage() {
  return <ImageCropResize mode="resize" content={imageResizeContent} />;
}
