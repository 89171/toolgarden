import { AudioTool } from '@/components/AudioTool';
import { audioCompressContent } from '@/lib/tools/content/audio-compress';

export default function AudioCompressPage() {
  return <AudioTool toolId="audio-compress" mode="compress" content={audioCompressContent} />;
}
