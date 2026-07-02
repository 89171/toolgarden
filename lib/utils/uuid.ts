export type UuidVersion = 'v1' | 'v4' | 'v7' | 'nanoid';

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function formatUuid(bytes: Uint8Array): string {
  const hex = toHex(bytes);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateV4(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return formatUuid(bytes);
}

const V1_STATE = { lastMs: 0, clockSeq: 0, initialized: false };

function ensureV1State() {
  if (!V1_STATE.initialized) {
    const rand = randomBytes(2);
    V1_STATE.clockSeq = ((rand[0] << 8) | rand[1]) & 0x3fff;
    V1_STATE.initialized = true;
  }
}

export function generateV1(): string {
  ensureV1State();
  let ms = Date.now();
  if (ms <= V1_STATE.lastMs) {
    V1_STATE.clockSeq = (V1_STATE.clockSeq + 1) & 0x3fff;
    ms = V1_STATE.lastMs + 1;
  }
  V1_STATE.lastMs = ms;

  const uuidEpochOffset = BigInt('12219292800000');
  const intervals = (BigInt(ms) + uuidEpochOffset) * BigInt(10000);
  const mask32 = BigInt('0xffffffff');
  const mask16 = BigInt('0xffff');
  const mask12 = BigInt('0x0fff');
  const timeLow = Number(intervals & mask32);
  const timeMid = Number((intervals >> BigInt(32)) & mask16);
  const timeHiVersion = (Number((intervals >> BigInt(48)) & mask12) | 0x1000) & 0xffff;

  const bytes = new Uint8Array(16);
  bytes[0] = (timeLow >>> 24) & 0xff;
  bytes[1] = (timeLow >>> 16) & 0xff;
  bytes[2] = (timeLow >>> 8) & 0xff;
  bytes[3] = timeLow & 0xff;
  bytes[4] = (timeMid >>> 8) & 0xff;
  bytes[5] = timeMid & 0xff;
  bytes[6] = (timeHiVersion >>> 8) & 0xff;
  bytes[7] = timeHiVersion & 0xff;
  bytes[8] = ((V1_STATE.clockSeq >>> 8) & 0x3f) | 0x80;
  bytes[9] = V1_STATE.clockSeq & 0xff;
  const node = randomBytes(6);
  node[0] |= 0x01;
  bytes.set(node, 10);

  return formatUuid(bytes);
}

export function generateV7(): string {
  const ms = BigInt(Date.now());
  const rand = randomBytes(10);
  const mask8 = BigInt('0xff');
  const bytes = new Uint8Array(16);
  bytes[0] = Number((ms >> BigInt(40)) & mask8);
  bytes[1] = Number((ms >> BigInt(32)) & mask8);
  bytes[2] = Number((ms >> BigInt(24)) & mask8);
  bytes[3] = Number((ms >> BigInt(16)) & mask8);
  bytes[4] = Number((ms >> BigInt(8)) & mask8);
  bytes[5] = Number(ms & mask8);
  bytes[6] = (rand[0] & 0x0f) | 0x70;
  bytes[7] = rand[1];
  bytes[8] = (rand[2] & 0x3f) | 0x80;
  for (let i = 9; i < 16; i += 1) bytes[i] = rand[i - 6];
  return formatUuid(bytes);
}

const NANOID_ALPHABET = '_-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateNanoId(size = 21): string {
  const bytes = randomBytes(size);
  let out = '';
  for (let i = 0; i < size; i += 1) {
    out += NANOID_ALPHABET[bytes[i] & 63];
  }
  return out;
}

export interface UuidOptions {
  version: UuidVersion;
  count: number;
  uppercase: boolean;
  removeHyphens: boolean;
}

export function generateUuids(options: UuidOptions): string[] {
  const results: string[] = [];
  for (let i = 0; i < Math.max(1, Math.min(1000, options.count)); i += 1) {
    let value: string;
    if (options.version === 'v1') value = generateV1();
    else if (options.version === 'v4') value = generateV4();
    else if (options.version === 'v7') value = generateV7();
    else value = generateNanoId();

    if (options.version !== 'nanoid') {
      if (options.removeHyphens) value = value.replace(/-/g, '');
      if (options.uppercase) value = value.toUpperCase();
    }
    results.push(value);
  }
  return results;
}
