import { AudioTool } from '@/components/AudioTool';
import { audioRecorderContent } from '@/lib/tools/content/audio-recorder';

export default function AudioRecorderPage() {
  return <AudioTool toolId="audio-recorder" mode="recorder" content={audioRecorderContent} />;
}
