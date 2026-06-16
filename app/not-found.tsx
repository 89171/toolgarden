import { Geist, Geist_Mono } from 'next/font/google';
import { BaiduAnalytics } from '@/components/BaiduAnalytics';
import { NotFoundContent } from '@/components/NotFoundContent';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'], display: 'swap' });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' });

export default function RootNotFound() {
  return (
    <html lang="zh">
      <head>
        <BaiduAnalytics />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <NotFoundContent locale="zh" />
      </body>
    </html>
  );
}
