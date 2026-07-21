import { ImageResponse } from 'next/og';

export const alt = 'ToolGarden — browser-local privacy-first web tools';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

export function createSocialImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #07131d 0%, #102c2b 58%, #153f36 100%)',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between',
          padding: '72px 80px',
          width: '100%',
        }}
      >
        <div
          style={{
            alignItems: 'center',
            color: '#86efac',
            display: 'flex',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 5,
          }}
        >
          BROWSER-LOCAL · PRIVACY-FIRST
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', fontSize: 92, fontWeight: 800, letterSpacing: -4 }}>
            ToolGarden
          </div>
          <div style={{ color: '#d1fae5', display: 'flex', fontSize: 34, lineHeight: 1.35 }}>
            Practical tools for JSON, images, PDFs, audio, text, QR codes, and documents
          </div>
        </div>
        <div
          style={{
            alignItems: 'center',
            borderTop: '2px solid rgba(167, 243, 208, 0.28)',
            color: '#a7f3d0',
            display: 'flex',
            fontSize: 25,
            justifyContent: 'space-between',
            paddingTop: 26,
          }}
        >
          <span>Process supported files on your device</span>
          <span>toolgarden.xyz</span>
        </div>
      </div>
    ),
    size,
  );
}

export default function OpenGraphImage() {
  return createSocialImage();
}
