import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';
export const revalidate = false;
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#1f2937',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'monospace',
          fontSize: 18,
          fontWeight: 700,
          color: '#f9fafb',
          letterSpacing: -1,
        }}
      >
        {'{}'}
      </div>
    ),
    { ...size }
  );
}
