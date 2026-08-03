import { AudioTool } from '@/components/AudioTool';
import { audioTtsContent } from '@/lib/tools/content/audio-tts';

export default function AudioTtsPage() {
  return <AudioTool toolId="audio-tts" mode="tts" content={audioTtsContent} />;
}
