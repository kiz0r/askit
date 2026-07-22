import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Data, Effect, Schedule, Schema } from 'effect';
import { Fetch } from 'fx-fetch';
import * as React from 'react';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { importQuiz } from './api/importQuiz';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';

/** The selected file could not be read or is not valid JSON. Carries a user-facing message. */
class InvalidQuizFileError extends Data.TaggedError('InvalidQuizFileError')<{
  readonly message: string;
}> {}

const decodeJson = Schema.decode(Schema.parseJson(Schema.Unknown));

const readQuizFile = Effect.fn('readQuizFile')(function* (file: File) {
  const text = yield* Effect.tryPromise({
    try: () => file.text(),
    catch: () => new InvalidQuizFileError({ message: 'Could not read the selected file.' }),
  });

  return yield* decodeJson(text).pipe(
    Effect.mapError(
      () => new InvalidQuizFileError({ message: 'The selected file is not valid JSON.' })
    )
  );
});

const program = (file: File) =>
  readQuizFile(file).pipe(
    Effect.flatMap((data) =>
      importQuiz(data).pipe(
        Effect.retry({
          while: isQuizErrorRecoverable,
          schedule: Schedule.exponential('250 millis').pipe(
            Schedule.union(Schedule.spaced('20 seconds')),
            Schedule.jittered
          ),
        })
      )
    ),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Import failed',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

/**
 * Encapsulates importing a quiz from a JSON file: the hidden file input's ref, the
 * upload mutation, and reading/parsing the file as an Effect (so a read failure or
 * malformed JSON surfaces the same way as any other import error). The page only
 * wires the returned handlers to a button and an `<input type="file" />`.
 */
export const useImportQuiz = () => {
  const queryClient = useQueryClient();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationKey: ['importQuiz'] as const,
    mutationFn: (file: File) =>
      program(file).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        runProgram
      ),
    onSuccess: (result) => {
      Toast.success({ title: 'Quiz imported', description: result.title });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] as const });
    },
  });

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? undefined;
    if (file !== undefined) {
      mutation.mutate(file);
    }

    event.target.value = '';
  };

  return {
    fileInputRef,
    isImporting: mutation.isPending,
    openFilePicker,
    handleFileChange,
  };
};
