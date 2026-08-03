import { AudioTool } from '@/components/AudioTool';
import { audioVolumeContent } from '@/lib/tools/content/audio-volume';

export default function AudioVolumePage() {
  return <AudioTool toolId="audio-volume" mode="volume" content={audioVolumeContent} />;
}
