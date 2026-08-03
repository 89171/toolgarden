import { AudioTool } from '@/components/AudioTool';
import { audioTrimContent } from '@/lib/tools/content/audio-trim';

export default function AudioTrimPage() {
  return <AudioTool toolId="audio-trim" mode="trim" content={audioTrimContent} />;
}
