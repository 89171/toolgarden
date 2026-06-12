export interface JwtDecoded {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  /** payload 中的过期时间（可读） */
  expiry?: string;
  isExpired?: boolean;
}

function base64UrlDecode(str: string): string {
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const b64 = (str + pad).replace(/-/g, '+').replace(/_/g, '/');
  try {
    return decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
  } catch {
    return atob(b64);
  }
}

/** 解码 JWT Token（不验证签名） */
export function decodeJwt(token: string): { ok: true; decoded: JwtDecoded } | { ok: false; message: string } {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return { ok: false, message: 'JWT 格式无效，应包含三段（header.payload.signature）' };

  try {
    const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    const signature = parts[2];

    const decoded: JwtDecoded = { header, payload, signature };

    if (typeof payload.exp === 'number') {
      const expDate = new Date(payload.exp * 1000);
      decoded.expiry = expDate.toLocaleString();
      decoded.isExpired = expDate < new Date();
    }

    return { ok: true, decoded };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

/** 使用 Web Crypto API 验证 HS256 签名 */
export async function verifyJwtHs256(
  token: string,
  secret: string
): Promise<{ ok: true; valid: boolean } | { ok: false; message: string }> {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return { ok: false, message: 'JWT 格式无效' };

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const signingInput = encoder.encode(`${parts[0]}.${parts[1]}`);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const pad = parts[2].length % 4 === 0 ? '' : '='.repeat(4 - (parts[2].length % 4));
    const sigBytes = Uint8Array.from(
      atob((parts[2] + pad).replace(/-/g, '+').replace(/_/g, '/')),
      (c) => c.charCodeAt(0)
    );

    const valid = await crypto.subtle.verify('HMAC', cryptoKey, sigBytes, signingInput);
    return { ok: true, valid };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
