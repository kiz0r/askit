import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { Quiz } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';

const ResultSchema = Schema.Struct({
  items: Schema.Array(Quiz),
  total: Schema.Number,
});

export const getQuizzes = Effect.fn('getQuizzes')(
  function* () {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz`;

    const request = Request.unsafeMake({
      url,
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const quizzes = yield* Fetch.fetchJsonWithSchema(request, ResultSchema);
    return quizzes.items;
  },
  withAuthError,
  handleContractErrors
);
