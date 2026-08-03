import { AudioTool } from '@/components/AudioTool';
import { audioSpeedContent } from '@/lib/tools/content/audio-speed';

export default function AudioSpeedPage() {
  return <AudioTool toolId="audio-speed" mode="speed" content={audioSpeedContent} />;
}
