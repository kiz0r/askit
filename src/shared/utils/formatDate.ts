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

const userLocale =
  typeof globalThis.navigator === 'undefined' ? 'en-US' : globalThis.navigator.language;

const FormatterWithSeconds = new Intl.DateTimeFormat(userLocale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

const FormatterWithoutSeconds = new Intl.DateTimeFormat(userLocale, {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

const FormatterRelative = new Intl.DateTimeFormat(userLocale, {
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
});

function getFormatterByOptions(
  relativeDate: boolean,
  excludeSeconds: boolean
): Intl.DateTimeFormat {
  if (relativeDate) {
    return FormatterRelative;
  }

  if (excludeSeconds) {
    return FormatterWithoutSeconds;
  }

  return FormatterWithSeconds;
}

type Options = {
  readonly excludeSeconds?: boolean;
  readonly relativeDate?: boolean;
};

/**
 * Utility function to format a date to a human-readable string.
 *
 * @example
 * ```ts
 * const now = new Date();
 *
 * formatDate(now); // => "Today, 12:00:00 PM"
 * formatDate(now, { relativeDate: false }); // => "6/1/2024, 12:00:00 PM"
 * formatDate(now, { excludeSeconds: true }); // => "Today, 12:00 PM"
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

  const date = dateOption.value;
  const now = DateTime.unsafeNow();

  const excludeSeconds = options?.excludeSeconds ?? false;
  const relativeDate = options?.relativeDate ?? true;

  if (!relativeDate) {
    // We do not want to show "Today" or "Yesterday", so we exclude them from the formatter and just show the date and time.
    const formatter = getFormatterByOptions(false, excludeSeconds);
    return DateTime.formatIntl(date, formatter);
  }

  const isSameDate = isTheSameDate(date, now);
  const isDayBeforeDate = isDayBefore(date, now);

  const formatter = getFormatterByOptions(relativeDate, excludeSeconds);

  const dateTime = DateTime.formatIntl(date, formatter);

  if (isSameDate) {
    return `Today, ${dateTime}`;
  }

  if (isDayBeforeDate) {
    return `Yesterday, ${dateTime}`;
  }

  return dateTime;
}
