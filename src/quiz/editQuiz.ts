import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { QuizSchema } from './Quiz';
import type { QuizFormInput } from './QuizFormInput';
import type { QuizId } from './QuizId';

const AnswerSchema = Schema.Struct({
  text: Schema.String.pipe(Schema.nonEmptyString()),
  isCorrect: Schema.Boolean,
});

const QuestionSchema = Schema.Struct({
  text: Schema.String.pipe(Schema.nonEmptyString()),
  answers: AnswerSchema.pipe(Schema.NonEmptyArray),
});

const SettingsSchema = Schema.Struct({
  randomizeQuestions: Schema.Boolean,
  randomizeAnswers: Schema.Boolean,
  showImmediateFeedback: Schema.Boolean,
  timePerQuestion: Schema.Number.pipe(Schema.positive()),
  visibility: Schema.Literal('public', 'private'),
  maxParticipants: Schema.Number.pipe(Schema.positive(), Schema.int()),
});

const EditQuizInputSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String,
  settings: SettingsSchema,
  questions: QuestionSchema.pipe(Schema.NonEmptyArray),
});

const encodeBody = Schema.parseJson(EditQuizInputSchema).pipe(Schema.encode);
const validateInput = Schema.decodeUnknown(EditQuizInputSchema);

export const editQuiz = Effect.fn('editQuiz')(function* (quizId: QuizId, input: QuizFormInput) {
  const validatedInput = yield* validateInput(input);
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/quiz/${quizId}`;

  const body = yield* encodeBody(validatedInput);

  const request = Request.unsafeMake({
    url,
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, QuizSchema);

  return response;
});
