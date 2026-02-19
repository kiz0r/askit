import { Effect, Schema } from 'effect';
import { Fetch, Request } from 'fx-fetch';
import { AskitServerUrl } from '../api/apiUrls';
import { QuizSchema } from './Quiz';
import type { QuizFormInput } from './QuizFormInput';

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

const CreateQuizInputSchema = Schema.Struct({
  title: Schema.String.pipe(Schema.nonEmptyString()),
  description: Schema.String,
  settings: SettingsSchema,
  questions: QuestionSchema.pipe(Schema.NonEmptyArray),
});

const encodeBody = Schema.parseJson(CreateQuizInputSchema).pipe(Schema.encode);
const validateInput = Schema.decodeUnknown(CreateQuizInputSchema);

export const createQuiz = Effect.fn('createQuiz')(function* (input: QuizFormInput) {
  const validatedInput = yield* validateInput(input);
  const apiUrl = yield* AskitServerUrl;
  const url = `${apiUrl}/api/v1/quiz`;

  const body = yield* encodeBody(validatedInput);

  const request = Request.unsafeMake({
    url,
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  const response = yield* Fetch.fetchJsonWithSchema(request, QuizSchema);

  return response;
});
