import { AudioStemSplitter } from '@/components/AudioStemSplitter';
import { audioSplitStemsContent } from '@/lib/tools/content/audio-split-stems';

export default function AudioSplitStemsPage() {
  return <AudioStemSplitter toolId="audio-split-stems" content={audioSplitStemsContent} />;
}
