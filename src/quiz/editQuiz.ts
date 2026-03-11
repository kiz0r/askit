import { Effect, Schema } from 'effect';
import { Fetch, Request, Url } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { Quiz } from './Quiz';
import { type QuizFormInput, QuizFormInputSchema } from './QuizFormInput';
import type { QuizId } from './QuizId';

const encodeBody = Schema.parseJson(QuizFormInputSchema).pipe(Schema.encode);

export const editQuiz = Effect.fn('editQuiz')(function* (quizId: QuizId, input: QuizFormInput) {
  const baseUrl = yield* AskitServerUrl;
  const url = Url.unsafeMake(`${baseUrl}/api/v1/quiz/${quizId}`);

  const request = Request.unsafeMake({
    url,
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: yield* encodeBody(input),
  });

  return yield* Fetch.fetchJsonWithSchema(request, Quiz);
});
