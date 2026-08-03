import { ImageCropResize } from '@/components/ImageCropResize';
import { imageCropContent } from '@/lib/tools/content/image-crop';

export default function ImageCropPage() {
  return <ImageCropResize mode="crop" content={imageCropContent} />;
}
