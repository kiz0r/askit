import { DateTime, Equal, Option } from 'effect';

function isTheSameDate(dateTime: DateTime.DateTime, now: DateTime.DateTime): boolean {
  const dateStartOfDay = DateTime.startOf(dateTime, 'day');
  const nowStartOfDay = DateTime.startOf(now, 'day');

  return Equal.equals(dateStartOfDay, nowStartOfDay);
}

function isDayBefore(dateTime: DateTime.DateTime, now: DateTime.DateTime): boolean {
  const dateStartOfDay = DateTime.startOf(dateTime, 'day');
  const nowStartOfDay = DateTime.startOf(now, 'day');
  const dayBeforeNowStartOfDay = DateTime.add(nowStartOfDay, { days: -1 });

  return Equal.equals(dateStartOfDay, dayBeforeNowStartOfDay);
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

function formatTime(date: Date, excludeSeconds: boolean): string {
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  if (excludeSeconds) {
    return time;
  }

  return `${time}:${pad2(date.getSeconds())}`;
}

type Options = {
  readonly excludeSeconds?: boolean;
  readonly relativeDate?: boolean;
};

/**
 * Utility function to format a date to a human-readable string in the day-first,
 * 24-hour European style.
 *
 * @example
 * ```ts
 * const now = new Date();
 *
 * formatDate(now); // => "Today, 12:00:00"
 * formatDate(now, { excludeSeconds: true }); // => "Today, 12:00"
 * formatDate(lastWeek, { excludeSeconds: true }); // => "16.6.2026 10:55"
 * ```
 */
export function formatDate(input: DateTime.DateTime.Input | null, options?: Options): string {
  if (input === null) {
    return '—';
  }

  const dateOption = DateTime.make(input);
  if (Option.isNone(dateOption)) {
    return '—';
  }

  const dateTime = dateOption.value;
  const date = DateTime.toDate(dateTime);
  const excludeSeconds = options?.excludeSeconds ?? false;
  const relativeDate = options?.relativeDate ?? true;

  const time = formatTime(date, excludeSeconds);

  if (relativeDate) {
    const now = DateTime.unsafeNow();

    if (isTheSameDate(dateTime, now)) {
      return `Today, ${time}`;
    }

    if (isDayBefore(dateTime, now)) {
      return `Yesterday, ${time}`;
    }
  }

  const day = `${pad2(date.getDate())}.${pad2(date.getMonth() + 1)}.${date.getFullYear()}`;
  return `${day} ${time}`;
}
