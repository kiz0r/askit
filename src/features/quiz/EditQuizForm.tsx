import { useMutation } from '@tanstack/react-query';
import { Effect } from 'effect';
import * as React from 'react';
import { queryClient } from '@/app/providers/QueryClientProvider';
import { Quiz, QuizId } from '@/entities/quiz';
import { SessionExpiredError, withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
import { editQuiz } from './api/editQuiz';
import { publishQuiz, unpublishQuiz } from './api/publishQuiz';
import { QuizForm } from './QuizForm';
import type { QuizFormInput } from './QuizFormInput';

const editQuizProgram = (quizId: QuizId, input: QuizFormInput) =>
  editQuiz(quizId, input).pipe(
    withStandardErrors({ action: 'edit quiz', fallback: null }),
    Effect.catchTags({
      QuizAccessDeniedError: toast.handle('error', {
        title: 'Access denied',
        description: 'You do not have permission to edit this quiz.',
        fallback: null,
      }),
      QuizNotFoundError: toast.handle('error', {
        title: 'Quiz not found',
        description: 'The quiz you are trying to edit does not exist.',
        fallback: null,
      }),
      QuizPublishedError: toast.handle('error', {
        title: 'Quiz is published',
        description: 'Move it to draft before editing.',
        fallback: null,
      }),
      InvalidQuizDataError: () => Effect.dieMessage('Received invalid quiz data.'), // This is a defect. The error should never happen due to form validation.
    }),
    Effect.tap((result) => {
      if (result === null) {
        return;
      }
      toast.success({ title: 'Quiz edited successfully' });
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

const publishProgram = (quizId: QuizId) =>
  publishQuiz(quizId).pipe(
    withStandardErrors({ action: 'publish quiz', fallback: null }),
    Effect.catchTags({
      QuizAccessDeniedError: toast.handle('error', {
        title: 'Access denied',
        description: 'You do not have permission to publish this quiz.',
        fallback: null,
      }),
      QuizNotFoundError: toast.handle('error', {
        title: 'Quiz not found',
        description: 'The quiz you are trying to publish does not exist.',
        fallback: null,
      }),
      InvalidQuizDataError: toast.handle('error', {
        title: 'Cannot publish',
        description: 'The quiz has no questions.',
        fallback: null,
      }),
    }),
    Effect.tap((result) => {
      if (result === null) {
        return;
      }
      toast.success({ title: 'Quiz published' });
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

const unpublishProgram = (quizId: QuizId) =>
  unpublishQuiz(quizId).pipe(
    withStandardErrors({ action: 'unpublish quiz', fallback: null }),
    Effect.catchTags({
      QuizAccessDeniedError: toast.handle('error', {
        title: 'Access denied',
        description: 'You do not have permission to unpublish this quiz.',
        fallback: null,
      }),
      QuizNotFoundError: toast.handle('error', {
        title: 'Quiz not found',
        description: 'The quiz you are trying to unpublish does not exist.',
        fallback: null,
      }),
    }),
    Effect.tap((result) => {
      if (result === null) {
        return;
      }
      toast.success({ title: 'Quiz moved to draft' });
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

type Props = {
  readonly quizId: QuizId;
  readonly quiz: Quiz;
};

export const EditQuizForm = React.memo((props: Props) => {
  const editQuizMutation = useMutation({
    mutationKey: ['editQuiz', props.quizId] as const,
    mutationFn: (input: QuizFormInput) =>
      editQuizProgram(props.quizId, input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureErrorType<SessionExpiredError>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      if (result == null) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['quiz', props.quizId] });
    },
  });

  const publishMutation = useMutation({
    mutationKey: ['publishQuiz', props.quizId] as const,
    mutationFn: () =>
      publishProgram(props.quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureErrorType<SessionExpiredError>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      if (result == null) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['quiz', props.quizId] });
    },
  });

  const unpublishMutation = useMutation({
    mutationKey: ['unpublishQuiz', props.quizId] as const,
    mutationFn: () =>
      unpublishProgram(props.quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureErrorType<SessionExpiredError>(),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      if (result == null) {
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['quiz', props.quizId] });
    },
  });

  return (
    <QuizForm
      heading='Edit Quiz'
      submitText='Save Changes'
      quiz={props.quiz}
      loading={editQuizMutation.isPending}
      onSubmit={editQuizMutation.mutateAsync}
      onPublish={publishMutation.mutateAsync}
      onUnpublish={unpublishMutation.mutateAsync}
      statusMutationLoading={publishMutation.isPending || unpublishMutation.isPending}
    />
  );
});

EditQuizForm.displayName = 'EditQuizForm';
