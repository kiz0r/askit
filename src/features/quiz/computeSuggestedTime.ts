import { Duration } from 'effect';
import { quizLimits } from '@/entities/quiz';

const READING_WORDS_PER_MINUTE = 200;
const PER_ANSWER_OVERHEAD_MS = 3_000;

const MIN_TIME_MS = Duration.toMillis(quizLimits.duration.minTimePerQuestion);
const MAX_TIME_MS = Duration.toMillis(quizLimits.duration.maxTimePerQuestion);

const wordCount = (text: string): number => {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  return trimmed.split(/\s+/).filter(Boolean).length;
};

type SuggestedTimeInput = {
  readonly text: string;
  readonly answers: readonly {
    readonly text: string;
  }[];
};

export const computeSuggestedTimeMs = (question: SuggestedTimeInput): number => {
  const totalWords =
    wordCount(question.text) +
    question.answers.reduce((sum, answer) => sum + wordCount(answer.text), 0);

  const readingMs = Math.ceil((totalWords * 60 * 1_000) / READING_WORDS_PER_MINUTE);
  const overheadMs = question.answers.length * PER_ANSWER_OVERHEAD_MS;
  const raw = readingMs + overheadMs;

  return Math.min(Math.max(raw, MIN_TIME_MS), MAX_TIME_MS);
};
