import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { createQuiz } from './api/createQuiz';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';
import { QuizForm } from './QuizForm';
import type { QuizFormInput } from './QuizFormInput';

const program = (input: QuizFormInput) =>
  createQuiz(input).pipe(
    Effect.retry({
      while: isQuizErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    // A defect: form validation should prevent invalid quiz data from being sent.
    Effect.catchTag('InvalidQuizDataError', () => Effect.dieMessage('Received invalid quiz data.')),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to create quiz',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

export const CreateQuizForm = () => {
  const navigate = useNavigate();
  const createQuizMutation = useMutation({
    mutationKey: ['createQuiz'] as const,
    mutationFn: (input: QuizFormInput) =>
      program(input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: (quiz) => {
      Toast.success({ title: 'Quiz created successfully' });
      navigate({ to: '/quiz/edit/$quizId', params: { quizId: quiz.quizId } });
    },
  });

  return (
    <QuizForm
      heading='Create Quiz'
      submitText='Create'
      quiz={null}
      submitLoading={createQuizMutation.isPending}
      onSubmit={createQuizMutation.mutateAsync}
    />
  );
};
