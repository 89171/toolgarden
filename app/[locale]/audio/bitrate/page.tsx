import { AudioTool } from '@/components/AudioTool';
import { audioBitrateContent } from '@/lib/tools/content/audio-bitrate';

export default function AudioBitratePage() {
  return <AudioTool toolId="audio-bitrate" mode="bitrate" content={audioBitrateContent} />;
}
