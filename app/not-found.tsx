import { Analytics } from '@/components/Analytics';
import { NotFoundContent } from '@/components/NotFoundContent';
import { SiteProtection } from '@/components/SiteProtection';
import './globals.css';

export default function RootNotFound() {
  return (
    <html lang="zh">
      <head />
      <body className="antialiased">
        <NotFoundContent />
        <Analytics />
        <SiteProtection />
      </body>
    </html>
  );
}
