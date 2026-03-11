import { Duration } from 'effect';

/**
 * @internal
 */
type DurationLimits = Record<string, Duration.Duration>;

/**
 * Limits for quiz durations.
 * @internal
 */
const quizDurationLimits = {
  /**
   * Minimum time per question (5 seconds)
   */
  MinTimePerQuestion: Duration.millis(5_000),
  /**
   * Maximum time per question (5 minutes)
   */
  MaxTimePerQuestion: Duration.millis(300_000),
  /**
   * Default time per question (30 seconds)
   */
  DefaultTimePerQuestion: Duration.millis(30_000),
} as const satisfies DurationLimits;

/**
 * Limits for quiz settings.
 */
export const QuizLimits = {
  Duration: quizDurationLimits,
  /**
   * Maximum number of participants
   */
  MaxParticipants: 30,
  /**
   * Minimum number of participants
   */
  MinParticipants: 1,
} as const;
