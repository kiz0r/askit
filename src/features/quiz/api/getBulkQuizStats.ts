import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { type QuizId, QuizIdSchema } from '@/entities/quiz';
import { withAuthError } from '@/entities/user';
import { AskitServerUrl, handleContractErrors } from '@/shared/api';
import { QuizStats } from './getQuizStats';

const BulkStatsOut = Schema.Struct({
  items: Schema.Array(QuizStats),
});

const BulkStatsIn = Schema.Struct({
  quizIds: Schema.Array(QuizIdSchema),
});

const encodeBody = Schema.parseJson(BulkStatsIn).pipe(Schema.encode);

export const getBulkQuizStats = Effect.fn('getBulkQuizStats')(
  function* (quizIds: readonly QuizId[]) {
    const baseUrl = yield* AskitServerUrl;
    const url = `${baseUrl}/api/v1/quiz/stats`;

    const request = Request.unsafeMake({
      url,
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: yield* encodeBody({ quizIds }),
    });

    const result = yield* Fetch.fetchJsonWithSchema(request, BulkStatsOut);
    return result.items;
  },
  withAuthError,
  handleContractErrors
);
