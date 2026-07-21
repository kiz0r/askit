import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useAtomValue } from 'jotai';
import { PlusIcon, UploadIcon } from 'lucide-react';
import * as React from 'react';
import { type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import { SessionExpiredError, userAtom } from '@/entities/user';
import { importQuiz, QuizList, useQuizzesQuery } from '@/features/quiz';
import { isQuizErrorRecoverable } from '@/features/quiz/api/isQuizErrorRecoverable';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { Button } from '@/shared/ui';

function filterQuizzesToPublished(quizzes: ReadonlyMap<QuizId, Quiz>): readonly Quiz[] {
  const filteredQuizzes: /* mutable */ Quiz[] = [];

  for (const [_quizId, quiz] of quizzes) {
    const isPublished = quiz.status === 'published';
    if (!isPublished) {
      continue;
    }

    filteredQuizzes.push(quiz);
  }

  return filteredQuizzes;
}

const greetingMessages = [
  '👋',
  '👋🏻',
  'Ahoy',
  'Good to see you',
  'Greetings',
  'Greetings',
  'Hello',
  'Hey',
  'Hi there',
  'Howdy',
  'Salutations',
  'Welcome back',
  'Yo',
  "What's up",
] as const;

const sessionGreeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

const importQuizProgram = (data: unknown) =>
  importQuiz(data).pipe(
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
          title: 'Import failed',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

const QuizzesPage = () => {
  useQuizzesQuery();
  const queryClient = useQueryClient();

  const user = useAtomValue(userAtom);
  const quizzes = useAtomValue(quizzesAtom);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const publishedQuizzes = filterQuizzesToPublished(quizzes);
  const publishedCount = publishedQuizzes.length;

  const importMutation = useMutation({
    mutationKey: ['importQuiz'] as const,
    mutationFn: (data: unknown) =>
      importQuizProgram(data).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSuccess: (result) => {
      Toast.success({ title: 'Quiz imported', description: result.title });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] as const });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? undefined;
    if (file === undefined) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        importMutation.mutate(data);
      } catch {
        Toast.danger({ title: 'Invalid file', description: 'Could not parse the JSON file.' });
      }
    };
    fileReader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className='flex flex-col gap-8 grow'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>
            {user !== null ? `${sessionGreeting}, ${user.username}.` : 'My Quizzes'}
          </h1>

          <p className='text-muted-foreground mt-1'>
            {quizzes.size === 0
              ? 'Create your first quiz to get started.'
              : `${quizzes.size} ${quizzes.size === 1 ? 'quiz' : 'quizzes'} · ${publishedCount} published`}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <input
            ref={fileInputRef}
            type='file'
            accept='.json'
            className='hidden'
            onChange={handleFileUpload}
          />
          <Button
            variant='outline'
            disabled={importMutation.isPending}
            loading={importMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon className='size-4' />
            Import
          </Button>
          <Button asChild>
            <Link to='/quiz/new'>
              <PlusIcon className='size-4' />
              Create Quiz
            </Link>
          </Button>
        </div>
      </div>

      <QuizList />
    </div>
  );
};

export const Route = createFileRoute('/(app)/_appLayout/quizzes')({
  head: () => ({
    meta: [
      { title: 'AskIt ⋅ Quizzes' },
      { name: 'description', content: 'View and manage your quizzes on the AskIt dashboard' },
    ],
  }),
  component: QuizzesPage,
});
