import { Duration } from 'effect';
import { describe, expect, it } from 'vitest';
import { formatDuration, formatDurationEstimate } from './formatDuration';

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [1_000, '1s'],
    [59_000, '59s'],
    [60_000, '1m'],
    [61_000, '1m 1s'],
    [3_600_000, '60m'],
    [3_661_000, '61m 1s'],
  ])('renders %ims as %s', (millis, expected) => {
    expect(formatDuration(Duration.millis(millis))).toBe(expected);
  });

  it('truncates sub-second remainders rather than rounding up', () => {
    expect(formatDuration(Duration.millis(1_999))).toBe('1s');
  });
});

describe('formatDurationEstimate', () => {
  it('collapses anything under a minute', () => {
    expect(formatDurationEstimate(Duration.millis(59_000))).toBe('<1 min');
  });

  it.each([
    [90_000, '2 min'],
    [3_600_000, '1h'],
    [5_400_000, '1h 30m'],
  ])('renders %ims as %s', (millis, expected) => {
    expect(formatDurationEstimate(Duration.millis(millis))).toBe(expected);
  });
});
