import { AudioTool } from '@/components/AudioTool';
import { audioSampleRateContent } from '@/lib/tools/content/audio-sample-rate';

export default function AudioSampleRatePage() {
  return <AudioTool toolId="audio-sample-rate" mode="sample-rate" content={audioSampleRateContent} />;
}
