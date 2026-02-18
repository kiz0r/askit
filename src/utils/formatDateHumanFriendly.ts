import { DateTime, Equal } from 'effect';

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

/**
 * Utility function to format a date to a human-readable string.
 */
export function formatDateHumanFriendly(
  input: DateTime.DateTime | null,
  options?: {
    readonly excludeSeconds?: boolean;
  }
): string {
  if (input == null) {
    return '—';
  }

  const now = DateTime.unsafeNow();
  const excludeSeconds = options?.excludeSeconds ?? false;

  const isSameDate = isTheSameDate(input, now);
  const isDayBeforeDate = isDayBefore(input, now);

  const excludeDate = isSameDate || isDayBeforeDate;

  // TODO: Check whether we do not break the logic here by passing our real locale.
  // HINT: We may do it dynamically by getting the locale from the user browser settings
  const dateTimeFormat = new Intl.DateTimeFormat('cs-CZ', {
    year: excludeDate ? undefined : 'numeric',
    month: excludeDate ? undefined : 'numeric',
    day: excludeDate ? undefined : 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: excludeSeconds ? undefined : '2-digit',
  });

  const dateTime = DateTime.formatIntl(input, dateTimeFormat);

  if (isSameDate) {
    return `Today, ${dateTime}`;
  }

  if (isDayBeforeDate) {
    return `Yesterday, ${dateTime}`;
  }

  return dateTime;
}
