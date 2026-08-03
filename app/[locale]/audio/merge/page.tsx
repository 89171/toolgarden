import { AudioTool } from '@/components/AudioTool';
import { audioMergeContent } from '@/lib/tools/content/audio-merge';

export default function AudioMergePage() {
  return <AudioTool toolId="audio-merge" mode="merge" content={audioMergeContent} />;
}
