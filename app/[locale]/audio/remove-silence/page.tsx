import { AudioTool } from '@/components/AudioTool';
import { audioRemoveSilenceContent } from '@/lib/tools/content/audio-remove-silence';

export default function AudioRemoveSilencePage() {
  return <AudioTool toolId="audio-remove-silence" mode="remove-silence" content={audioRemoveSilenceContent} />;
}
