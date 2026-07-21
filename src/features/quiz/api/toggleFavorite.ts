import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import type { QuizId } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors, withStructuredError } from '@/shared/api';
import { QuizNotFoundError } from './errors';

const ToggleFavoriteResponse = Schema.Struct({
  quizId: Schema.String,
  isFavorited: Schema.Boolean,
});

export type ToggleFavoriteResult = Schema.Schema.Type<typeof ToggleFavoriteResponse>;

export const toggleFavorite = Effect.fn('toggleFavorite')(
  function* (quizId: QuizId) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/${quizId}/favorite/toggle`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    return yield* Fetch.fetchJsonWithSchema(request, ToggleFavoriteResponse).pipe(
      withStructuredError('QUIZ_NOT_FOUND', (message) => new QuizNotFoundError({ message }))
    );
  },
  withAuthError,
  handleContractErrors
);
