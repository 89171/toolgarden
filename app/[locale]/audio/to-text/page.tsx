import { AudioTool } from '@/components/AudioTool';
import { audioToTextContent } from '@/lib/tools/content/audio-to-text';

export default function AudioToTextPage() {
  return <AudioTool toolId="audio-to-text" mode="transcribe" content={audioToTextContent} />;
}
