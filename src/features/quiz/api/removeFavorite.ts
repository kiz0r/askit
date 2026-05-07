import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { withAuthError } from '@/features/auth';
import { AskitServerUrl, withStructuredError } from '@/shared/api';
import { QuizNotFoundError } from './errors';

const FavoriteResponseSchema = Schema.Struct({
  quizId: Schema.String,
  isFavorited: Schema.Boolean,
});

export const removeFavorite = Effect.fn('removeFavorite')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl.AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/favorite`;

    const request = Request.unsafeMake({
      url,
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return yield* Fetch.fetchJsonWithSchema(request, FavoriteResponseSchema).pipe(
      withAuthError,
      withStructuredError('QUIZ_NOT_FOUND', () => new QuizNotFoundError())
    );
  },
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);
