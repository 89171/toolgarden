import cronstrue from 'cronstrue/i18n';
import { CronExpressionParser } from 'cron-parser';

export interface CronOutcome {
  ok: true;
  description: string;
  nextRuns: Date[];
}

export type CronResult = CronOutcome | { ok: false; message: string };

export function parseCron(
  expression: string,
  locale: 'zh_CN' | 'en',
  count: number,
  timezone: 'local' | 'utc'
): CronResult {
  const expr = expression.trim();
  if (!expr) return { ok: false, message: 'empty' };

  let description: string;
  try {
    description = cronstrue.toString(expr, { locale });
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  let interval;
  try {
    interval = CronExpressionParser.parse(expr, {
      tz: timezone === 'utc' ? 'UTC' : undefined,
    });
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  const runs: Date[] = [];
  const safeCount = Math.max(1, Math.min(20, count));
  for (let i = 0; i < safeCount; i += 1) {
    try {
      runs.push(interval.next().toDate());
    } catch {
      break;
    }
  }

  return { ok: true, description, nextRuns: runs };
}

export const CRON_TEMPLATES = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Daily 00:00', value: '0 0 * * *' },
  { label: 'Weekly Mon 09:00', value: '0 9 * * 1' },
  { label: 'Monthly 1st 00:00', value: '0 0 1 * *' },
  { label: 'Weekdays 09:30', value: '30 9 * * 1-5' },
];
