import { gunzipSync, strFromU8 } from 'fflate';
import { stringifyJSONValue } from './json';

export type InfoCodecOperation =
  | 'legacy-encode'
  | 'unicode-encode'
  | 'url-encode'
  | 'utf16-encode'
  | 'base64-encode'
  | 'md5'
  | 'hex-encode'
  | 'sha1'
  | 'string-escape'
  | 'unicode-decode'
  | 'url-decode'
  | 'utf16-decode'
  | 'base64-decode'
  | 'hex-decode'
  | 'html-entity-decode'
  | 'url-params-parse'
  | 'jwt-decode'
  | 'cookie-format'
  | 'gzip-decompress'
  | 'string-unescape';

export type InfoCodecErrorCode =
  | 'invalid_unicode'
  | 'invalid_url'
  | 'invalid_hex'
  | 'invalid_base64'
  | 'invalid_html_entity'
  | 'invalid_url_params'
  | 'invalid_jwt'
  | 'invalid_cookie'
  | 'invalid_gzip'
  | 'invalid_escape'
  | 'unsupported_operation';

export type InfoCodecOutcome =
  | { ok: true; output: string }
  | { ok: false; code: InfoCodecErrorCode; message: string };

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function error(code: InfoCodecErrorCode, message: string): InfoCodecOutcome {
  return { ok: false, code, message };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function bytesToHexEscapes(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => `\\x${byte.toString(16).padStart(2, '0')}`).join('');
}

function parseHexBytes(input: string): Uint8Array | null {
  const normalized = input
    .replace(/\\x/gi, '')
    .replace(/0x/gi, '')
    .replace(/[\s,;:_-]/g, '');

  if (!normalized || normalized.length % 2 !== 0 || /[^0-9a-f]/i.test(normalized)) {
    return null;
  }

  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

function encodeBase64(input: string): string {
  const bytes = encoder.encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64ToBytes(input: string): Uint8Array | null {
  const cleaned = input
    .trim()
    .replace(/^data:[^,]+,/i, '')
    .replace(/\s/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  if (!cleaned) return new Uint8Array();

  try {
    const padded = cleaned.padEnd(cleaned.length + ((4 - (cleaned.length % 4)) % 4), '=');
    const binary = atob(padded);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  } catch {
    return null;
  }
}

function decodeBase64(input: string): InfoCodecOutcome {
  const bytes = decodeBase64ToBytes(input);
  if (!bytes) return error('invalid_base64', 'Invalid Base64 input.');
  return { ok: true, output: decoder.decode(bytes) };
}

function legacyEncode(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const code = input.charCodeAt(i);

    if (/^[A-Za-z0-9@*_+\-./]$/.test(char)) {
      output += char;
    } else if (code < 256) {
      output += `%${code.toString(16).toUpperCase().padStart(2, '0')}`;
    } else {
      output += `%u${code.toString(16).toUpperCase().padStart(4, '0')}`;
    }
  }
  return output;
}

function unicodeEncode(input: string): string {
  let output = '';
  for (let i = 0; i < input.length; i += 1) {
    output += `\\u${input.charCodeAt(i).toString(16).padStart(4, '0')}`;
  }
  return output;
}

function unicodeDecode(input: string): InfoCodecOutcome {
  const pattern = /\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g;
  let matched = false;

  const output = input.replace(pattern, (_, codePoint: string | undefined, codeUnit: string | undefined) => {
    matched = true;
    const value = Number.parseInt(codePoint ?? codeUnit ?? '0', 16);
    return codePoint ? String.fromCodePoint(value) : String.fromCharCode(value);
  });

  if (!matched && input.includes('\\u')) {
    return error('invalid_unicode', 'Invalid Unicode escape sequence.');
  }

  return { ok: true, output };
}

function urlDecode(input: string): InfoCodecOutcome {
  try {
    const legacyDecoded = input.replace(/%u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      String.fromCharCode(Number.parseInt(hex, 16))
    );
    return { ok: true, output: decodeURIComponent(legacyDecoded.replace(/\+/g, '%20')) };
  } catch (e) {
    return error('invalid_url', (e as Error).message);
  }
}

function hexDecode(input: string): InfoCodecOutcome {
  const bytes = parseHexBytes(input);
  if (!bytes) return error('invalid_hex', 'Invalid hex input.');
  return { ok: true, output: decoder.decode(bytes) };
}

const htmlEntities: Record<string, string> = {
  amp: '&',
  apos: "'",
  copy: '©',
  gt: '>',
  lt: '<',
  nbsp: '\u00a0',
  quot: '"',
  reg: '®',
  trade: '™',
};

function htmlEntityDecode(input: string): InfoCodecOutcome {
  const output = input.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]+);/g, (entity, body: string) => {
    if (body.startsWith('#x')) {
      return String.fromCodePoint(Number.parseInt(body.slice(2), 16));
    }
    if (body.startsWith('#')) {
      return String.fromCodePoint(Number.parseInt(body.slice(1), 10));
    }
    return htmlEntities[body] ?? entity;
  });

  return { ok: true, output };
}

function parseUrlParams(input: string): InfoCodecOutcome {
  const trimmed = input.trim();
  let query = trimmed;

  try {
    if (/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed)) {
      query = new URL(trimmed).search;
    } else if (trimmed.includes('?')) {
      query = trimmed.slice(trimmed.indexOf('?') + 1);
    }

    query = query.replace(/^#/, '').replace(/^\?/, '').split('#')[0];
    const params = new URLSearchParams(query);
    const parsed: Record<string, string | string[]> = {};

    params.forEach((value, key) => {
      const current = parsed[key];
      if (current === undefined) {
        parsed[key] = value;
      } else if (Array.isArray(current)) {
        current.push(value);
      } else {
        parsed[key] = [current, value];
      }
    });

    if (Object.keys(parsed).length === 0 && trimmed) {
      return error('invalid_url_params', 'No URL parameters found.');
    }

    return { ok: true, output: stringifyJSONValue(parsed, 2) };
  } catch (e) {
    return error('invalid_url_params', (e as Error).message);
  }
}

function decodeBase64UrlJson(part: string): unknown {
  const bytes = decodeBase64ToBytes(part);
  if (!bytes) throw new Error('Invalid Base64URL segment.');
  return JSON.parse(decoder.decode(bytes));
}

function decodeJwtInfo(input: string): InfoCodecOutcome {
  const parts = input.trim().split('.');
  if (parts.length !== 3) return error('invalid_jwt', 'JWT must contain header, payload, and signature.');

  try {
    const header = decodeBase64UrlJson(parts[0]);
    const payload = decodeBase64UrlJson(parts[1]);
    const result: Record<string, unknown> = {
      header,
      payload,
      signature: parts[2],
    };

    if (
      payload &&
      typeof payload === 'object' &&
      'exp' in payload &&
      typeof (payload as { exp?: unknown }).exp === 'number'
    ) {
      const expiresAt = new Date((payload as { exp: number }).exp * 1000);
      result.expiresAt = expiresAt.toISOString();
      result.expired = expiresAt < new Date();
    }

    return { ok: true, output: stringifyJSONValue(result, 2) };
  } catch (e) {
    return error('invalid_jwt', (e as Error).message);
  }
}

function formatCookie(input: string): InfoCodecOutcome {
  const parsed: Record<string, string | string[]> = {};
  const parts = input
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0 && input.trim()) {
    return error('invalid_cookie', 'No cookie pairs found.');
  }

  parts.forEach((part) => {
    const separator = part.indexOf('=');
    const rawKey = separator >= 0 ? part.slice(0, separator).trim() : part.trim();
    const rawValue = separator >= 0 ? part.slice(separator + 1).trim() : '';
    if (!rawKey) return;

    let value = rawValue;
    try {
      value = decodeURIComponent(rawValue);
    } catch {
      value = rawValue;
    }

    const current = parsed[rawKey];
    if (current === undefined) {
      parsed[rawKey] = value;
    } else if (Array.isArray(current)) {
      current.push(value);
    } else {
      parsed[rawKey] = [current, value];
    }
  });

  return { ok: true, output: stringifyJSONValue(parsed, 2) };
}

function gzipDecompress(input: string): InfoCodecOutcome {
  const candidates = [decodeBase64ToBytes(input), parseHexBytes(input)].filter(
    (candidate): candidate is Uint8Array => Boolean(candidate)
  );

  for (const candidate of candidates) {
    try {
      return { ok: true, output: strFromU8(gunzipSync(candidate)) };
    } catch {
      // Try the next supported textual representation.
    }
  }

  return error('invalid_gzip', 'Input must be Base64 or hex encoded gzip data.');
}

function stringEscape(input: string): string {
  const escaped = JSON.stringify(input);
  return escaped.slice(1, -1);
}

function stringUnescape(input: string): InfoCodecOutcome {
  try {
    const trimmed = input.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed !== 'string') throw new Error('Input is not a JSON string.');
      return { ok: true, output: parsed };
    }

    const output = input.replace(
      /\\(u\{[0-9a-fA-F]+\}|u[0-9a-fA-F]{4}|x[0-9a-fA-F]{2}|n|r|t|b|f|v|0|"|'|\\|\/)/g,
      (escapeSequence: string) => {
        const body = escapeSequence.slice(1);
        if (body.startsWith('u{')) {
          return String.fromCodePoint(Number.parseInt(body.slice(2, -1), 16));
        }
        if (body.startsWith('u')) {
          return String.fromCharCode(Number.parseInt(body.slice(1), 16));
        }
        if (body.startsWith('x')) {
          return String.fromCharCode(Number.parseInt(body.slice(1), 16));
        }

        const replacements: Record<string, string> = {
          '"': '"',
          "'": "'",
          '/': '/',
          '\\': '\\',
          '0': '\0',
          b: '\b',
          f: '\f',
          n: '\n',
          r: '\r',
          t: '\t',
          v: '\v',
        };
        return replacements[body] ?? escapeSequence;
      }
    );

    return { ok: true, output };
  } catch (e) {
    return error('invalid_escape', (e as Error).message);
  }
}

function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

function wordToLittleEndianHex(word: number): string {
  return [0, 8, 16, 24]
    .map((shift) => ((word >>> shift) & 0xff).toString(16).padStart(2, '0'))
    .join('');
}

function appendLittleEndianBitLength(bytes: number[], originalByteLength: number): void {
  const low = (originalByteLength * 8) >>> 0;
  const high = Math.floor(originalByteLength / 0x20000000) >>> 0;

  for (let shift = 0; shift < 32; shift += 8) {
    bytes.push((low >>> shift) & 0xff);
  }
  for (let shift = 0; shift < 32; shift += 8) {
    bytes.push((high >>> shift) & 0xff);
  }
}

function appendBigEndianBitLength(bytes: number[], originalByteLength: number): void {
  const low = (originalByteLength * 8) >>> 0;
  const high = Math.floor(originalByteLength / 0x20000000) >>> 0;

  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((high >>> shift) & 0xff);
  }
  for (let shift = 24; shift >= 0; shift -= 8) {
    bytes.push((low >>> shift) & 0xff);
  }
}

function md5(input: string): string {
  const bytes = Array.from(encoder.encode(input));
  const originalByteLength = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  appendLittleEndianBitLength(bytes, originalByteLength);

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const shifts = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];
  const constants = Array.from({ length: 64 }, (_, index) =>
    Math.floor(Math.abs(Math.sin(index + 1)) * 2 ** 32) >>> 0
  );

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 16 }, (_, index) => {
      const start = offset + index * 4;
      return (
        bytes[start] |
        (bytes[start + 1] << 8) |
        (bytes[start + 2] << 16) |
        (bytes[start + 3] << 24)
      ) >>> 0;
    });

    let a = a0;
    let b = b0;
    let c = c0;
    let d = d0;

    for (let i = 0; i < 64; i += 1) {
      let f: number;
      let g: number;

      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }

      const next = d;
      d = c;
      c = b;
      b = (b + rotateLeft((a + f + constants[i] + words[g]) >>> 0, shifts[i])) >>> 0;
      a = next;
    }

    a0 = (a0 + a) >>> 0;
    b0 = (b0 + b) >>> 0;
    c0 = (c0 + c) >>> 0;
    d0 = (d0 + d) >>> 0;
  }

  return [a0, b0, c0, d0].map(wordToLittleEndianHex).join('');
}

function sha1(input: string): string {
  const bytes = Array.from(encoder.encode(input));
  const originalByteLength = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  appendBigEndianBitLength(bytes, originalByteLength);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  for (let offset = 0; offset < bytes.length; offset += 64) {
    const words = Array.from({ length: 80 }, (_, index) => {
      if (index < 16) {
        const start = offset + index * 4;
        return (
          (bytes[start] << 24) |
          (bytes[start + 1] << 16) |
          (bytes[start + 2] << 8) |
          bytes[start + 3]
        ) >>> 0;
      }
      return 0;
    });

    for (let i = 16; i < 80; i += 1) {
      words[i] = rotateLeft(words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16], 1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let i = 0; i < 80; i += 1) {
      let f: number;
      let k: number;

      if (i < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (i < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (rotateLeft(a, 5) + f + e + k + words[i]) >>> 0;
      e = d;
      d = c;
      c = rotateLeft(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  return [h0, h1, h2, h3, h4].map((word) => word.toString(16).padStart(8, '0')).join('');
}

export function runInfoCodecOperation(input: string, operation: InfoCodecOperation): InfoCodecOutcome {
  try {
    switch (operation) {
      case 'legacy-encode':
        return { ok: true, output: legacyEncode(input) };
      case 'unicode-encode':
        return { ok: true, output: unicodeEncode(input) };
      case 'url-encode':
        return { ok: true, output: encodeURIComponent(input) };
      case 'utf16-encode':
        return { ok: true, output: bytesToHexEscapes(encoder.encode(input)) };
      case 'base64-encode':
        return { ok: true, output: encodeBase64(input) };
      case 'md5':
        return { ok: true, output: md5(input) };
      case 'hex-encode':
        return { ok: true, output: bytesToHex(encoder.encode(input)) };
      case 'sha1':
        return { ok: true, output: sha1(input) };
      case 'string-escape':
        return { ok: true, output: stringEscape(input) };
      case 'unicode-decode':
        return unicodeDecode(input);
      case 'url-decode':
        return urlDecode(input);
      case 'utf16-decode':
        return hexDecode(input);
      case 'base64-decode':
        return decodeBase64(input);
      case 'hex-decode':
        return hexDecode(input);
      case 'html-entity-decode':
        return htmlEntityDecode(input);
      case 'url-params-parse':
        return parseUrlParams(input);
      case 'jwt-decode':
        return decodeJwtInfo(input);
      case 'cookie-format':
        return formatCookie(input);
      case 'gzip-decompress':
        return gzipDecompress(input);
      case 'string-unescape':
        return stringUnescape(input);
      default:
        return error('unsupported_operation', 'Unsupported operation.');
    }
  } catch (e) {
    return error('unsupported_operation', (e as Error).message);
  }
}
