import { Duration } from 'effect';

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;

export function formatDuration(duration: Duration.Duration): string {
  const totalSeconds = Math.floor(Duration.toSeconds(duration));

  const minutes = Math.floor(totalSeconds / SECONDS_IN_MINUTE);
  const seconds = totalSeconds % SECONDS_IN_MINUTE;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export function formatDurationEstimate(duration: Duration.Duration): string {
  const minutes = Duration.toMinutes(duration);

  if (minutes < 1) {
    return '<1 min';
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / MINUTES_IN_HOUR);
  const remainingMinutes = Math.round(minutes % MINUTES_IN_HOUR);

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}
