import { AudioTool } from '@/components/AudioTool';
import { audioToWavContent } from '@/lib/tools/content/audio-to-wav';

export default function AudioToWavPage() {
  return <AudioTool toolId="audio-to-wav" mode="to-wav" content={audioToWavContent} />;
}
