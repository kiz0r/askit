import { useMutation } from '@tanstack/react-query';
import { Effect } from 'effect';
import * as React from 'react';
import { SessionExpiredError, withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
import { createQuiz } from './api/createQuiz';
import { QuizForm } from './QuizForm';
import type { QuizFormInput } from './QuizFormInput';

const createQuizProgram = (input: QuizFormInput) =>
  createQuiz(input).pipe(
    withStandardErrors({ action: 'create quiz', fallback: null }),
    Effect.catchTag(
      'InvalidQuizDataError',
      () => Effect.dieMessage('Received invalid quiz.') // This is a defect. The error should never happen due to form validation.
    ),
    Effect.tap((result) => {
      if (result === null) {
        // Error happened → notification is already shown
        return;
      }

      toast.success({
        title: 'Quiz created successfully',
      });
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

export const CreateQuizForm = React.memo(() => {
  const createQuizMutation = useMutation({
    mutationKey: ['createQuiz'] as const,
    mutationFn: (input: QuizFormInput) =>
      createQuizProgram(input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureErrorType<SessionExpiredError>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
  });

  return (
    <QuizForm
      heading='Create Quiz'
      submitText='Create'
      quiz={null}
      loading={createQuizMutation.isPending}
      onSubmit={createQuizMutation.mutateAsync}
    />
  );
});

CreateQuizForm.displayName = 'CreateQuizForm';
