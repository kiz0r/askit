import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import * as React from 'react';
import { Quiz, QuizId, type QuizStatus } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { editQuiz } from './api/editQuiz';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';
import { updateQuizStatus } from './api/setQuizStatus';
import { QuizForm } from './QuizForm';
import type { QuizFormInput } from './QuizFormInput';

const editQuizProgram = (quizId: QuizId, input: QuizFormInput) =>
  editQuiz(quizId, input).pipe(
    Effect.retry({
      while: isQuizErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
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
          title: 'Failed to edit quiz',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

const updateQuizStatusProgram = (quizId: QuizId, status: QuizStatus) =>
  updateQuizStatus(quizId, status).pipe(
    Effect.retry({
      while: isQuizErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: status === 'published' ? 'Failed to publish quiz' : 'Failed to unpublish quiz',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

type Props = {
  readonly quizId: QuizId;
  readonly quiz: Quiz;
};

export const EditQuizForm = (props: Props) => {
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = React.useState(false);

  const blocker = useBlocker({ shouldBlockFn: () => isDirty, withResolver: true });

  React.useEffect(() => {
    if (blocker.status !== 'blocked') {
      return;
    }

    if (window.confirm('You have unsaved changes. Leave anyway?')) {
      blocker.proceed();
      return;
    }

    blocker.reset();
  }, [blocker]);

  const editQuizMutation = useMutation({
    mutationKey: ['editQuiz', props.quizId] as const,
    mutationFn: (input: QuizFormInput) =>
      editQuizProgram(props.quizId, input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: () => {
      Toast.success({ title: 'Quiz edited successfully' });

      queryClient.invalidateQueries({ queryKey: ['quiz', props.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] as const });
    },
  });

  const updateStatusMutation = useMutation({
    mutationKey: ['updateQuizStatus', props.quizId] as const,
    mutationFn: (status: QuizStatus) =>
      updateQuizStatusProgram(props.quizId, status).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: (_quiz, status) => {
      Toast.success({ title: status === 'published' ? 'Quiz published' : 'Quiz moved to draft' });

      queryClient.invalidateQueries({ queryKey: ['quiz', props.quizId] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] as const });
    },
  });

  return (
    <QuizForm
      heading='Edit Quiz'
      submitText='Save Changes'
      quiz={props.quiz}
      submitLoading={editQuizMutation.isPending}
      onSubmit={editQuizMutation.mutateAsync}
      onStatusToggle={(status) => updateStatusMutation.mutate(status)}
      statusLoading={updateStatusMutation.isPending}
      onDirtyChange={setIsDirty}
    />
  );
};
