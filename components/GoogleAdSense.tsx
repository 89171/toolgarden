const GOOGLE_ADSENSE_CLIENT_ID = 'ca-pub-2234306257256278';

export function GoogleAdSense() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
    />
  );
}
