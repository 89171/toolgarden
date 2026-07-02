export type TimestampUnit = 'seconds' | 'milliseconds' | 'microseconds';

export interface TimestampResult {
  ok: true;
  date: Date;
  millis: number;
  iso: string;
  utc: string;
  local: string;
  relative: string;
  seconds: number;
  milliseconds: number;
  microseconds: number;
}

export type TimestampOutcome = TimestampResult | { ok: false; message: string };

function detectUnit(numeric: number): TimestampUnit {
  const abs = Math.abs(numeric);
  if (abs >= 1e14) return 'microseconds';
  if (abs >= 1e11) return 'milliseconds';
  return 'seconds';
}

export function normalizeToMillis(value: number, unit: TimestampUnit): number {
  if (unit === 'seconds') return value * 1000;
  if (unit === 'milliseconds') return value;
  return Math.round(value / 1000);
}

export function parseTimestamp(
  input: string,
  unit: TimestampUnit | 'auto'
): TimestampOutcome {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, message: 'empty' };

  const numeric = Number(trimmed);
  let millis: number;

  if (!Number.isNaN(numeric) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    const resolvedUnit = unit === 'auto' ? detectUnit(numeric) : unit;
    millis = normalizeToMillis(numeric, resolvedUnit);
  } else {
    const parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) return { ok: false, message: 'invalid' };
    millis = parsed;
  }

  const date = new Date(millis);
  if (Number.isNaN(date.getTime())) return { ok: false, message: 'invalid' };

  return {
    ok: true,
    date,
    millis,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
    relative: relativeTimeFromNow(millis),
    seconds: Math.floor(millis / 1000),
    milliseconds: millis,
    microseconds: millis * 1000,
  };
}

export function relativeTimeFromNow(millis: number): string {
  const now = Date.now();
  const diffMs = millis - now;
  const abs = Math.abs(diffMs);
  const sign = diffMs < 0 ? '-' : '+';
  const units: Array<[string, number]> = [
    ['y', 365 * 24 * 3600 * 1000],
    ['mo', 30 * 24 * 3600 * 1000],
    ['d', 24 * 3600 * 1000],
    ['h', 3600 * 1000],
    ['m', 60 * 1000],
    ['s', 1000],
  ];
  for (const [label, ms] of units) {
    if (abs >= ms) {
      const value = Math.floor(abs / ms);
      return `${sign}${value}${label}`;
    }
  }
  return '±0s';
}

export function formatDate(date: Date, timezone: 'local' | 'utc'): string {
  if (timezone === 'utc') {
    const y = date.getUTCFullYear();
    const mo = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const h = String(date.getUTCHours()).padStart(2, '0');
    const mi = String(date.getUTCMinutes()).padStart(2, '0');
    const s = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}-${mo}-${d} ${h}:${mi}:${s} UTC`;
  }
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
