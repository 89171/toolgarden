import { AudioTool } from '@/components/AudioTool';
import { audioToMp3Content } from '@/lib/tools/content/audio-to-mp3';

export default function AudioToMp3Page() {
  return <AudioTool toolId="audio-to-mp3" mode="to-mp3" content={audioToMp3Content} />;
}
