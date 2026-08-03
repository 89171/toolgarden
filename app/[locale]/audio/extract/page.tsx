import { AudioTool } from '@/components/AudioTool';
import { audioExtractContent } from '@/lib/tools/content/audio-extract';

export default function AudioExtractPage() {
  return <AudioTool toolId="audio-extract" mode="extract" content={audioExtractContent} />;
}
