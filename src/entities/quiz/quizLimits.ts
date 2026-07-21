import { Duration } from 'effect';

type DurationLimits = Readonly<Record<string, Duration.Duration>>;

const quizDurationLimits = {
  /**
   * Minimum time per question (5 seconds)
   */
  minTimePerQuestion: Duration.millis(5_000),
  /**
   * Maximum time per question (5 minutes)
   */
  maxTimePerQuestion: Duration.millis(300_000),
  /**
   * Default time per question (30 seconds)
   */
  defaultTimePerQuestion: Duration.millis(30_000),
} as const satisfies DurationLimits;

/**
 * Limits for quiz settings.
 */
export const quizLimits = {
  duration: quizDurationLimits,
  /**
   * Maximum number of participants
   */
  maxParticipants: 30,
  /**
   * Minimum number of participants
   */
  minParticipants: 1,
  /**
   * Maximum length of quiz title
   */
  maxTitleLength: 50,
  /**
   * Minimum length of quiz title
   */
  minTitleLength: 1,
  /**
   * Maximum length of quiz description
   */
  maxDescriptionLength: 300,
  /**
   * Maximum number of tags per quiz
   */
  maxTagsPerQuiz: 5,
  /**
   * Maximum length of question text
   */
  maxQuestionLength: 500,
  /**
   * Maximum length of answer text
   */
  maxAnswerLength: 200,
  /**
   * Maximum number of answers per question
   */
  maxAnswersPerQuestion: 6,
  /**
   * Minimum number of answers per question
   */
  minAnswersPerQuestion: 2,
} as const;
