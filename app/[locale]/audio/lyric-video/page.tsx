import { MvGenerator } from '@/components/MvGenerator';
import { audioLyricVideoContent } from '@/lib/tools/content/audio-lyric-video';

export default function AudioLyricVideoPage() {
  return <MvGenerator content={audioLyricVideoContent} />;
}
