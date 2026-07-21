import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { type QuizId, QuizIdSchema } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { QuizAccessDeniedError, QuizNotFoundError } from './errors';

export const TopPlayer = Schema.Struct({
  nickname: Schema.String,
  score: Schema.Number,
  playedAt: Schema.DateTimeUtc,
});

export const QuizStats = Schema.Struct({
  quizId: QuizIdSchema,
  timesPlayed: Schema.Number,
  totalPlayers: Schema.Number,
  averageScore: Schema.Number,
  averageDurationSeconds: Schema.Number,
  topPlayers: Schema.Array(TopPlayer),
});

export type QuizStats = Schema.Schema.Type<typeof QuizStats>;

export const getQuizStats = Effect.fn('getQuizStats')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/stats`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return yield* Fetch.fetchJsonWithSchema(request, QuizStats).pipe(
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message })),
      withStructuredError('QUIZ_ACCESS_DENIED', (message) => new QuizAccessDeniedError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
