import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { isQuizzesLoadingAtom, type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import { SessionExpiredError, withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { getQuizzes } from './api/getQuizzes';

const fetchQuizzesProgram = getQuizzes().pipe(
  withStandardErrors({ action: 'fetch quizzes', fallback: [] as const }),
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);

export const useQuizzesQuery = () => {
  const setQuizzes = useSetAtom(quizzesAtom);
  const setLoading = useSetAtom(isQuizzesLoadingAtom);

  const query = useQuery({
    queryKey: ['quizzes'] as const,
    staleTime: 30_000, // Consider data fresh for 30 seconds
    queryFn: ({ signal }) =>
      Effect.runPromise(
        fetchQuizzesProgram.pipe(
          Effect.provide(applicationLayer),
          Effect.ensureErrorType<SessionExpiredError>(),
          Effect.ensureRequirementsType<never>()
        ),
        { signal }
      ),
  });

  React.useEffect(() => {
    setLoading(query.isPending);
  }, [query.isPending, setLoading]);

  // Sync data to atom
  React.useEffect(() => {
    if (query.data == null) {
      return;
    }

    const quizzes: /* mutable */ Map<QuizId, Quiz> = new Map();
    for (const quiz of query.data) {
      quizzes.set(quiz.quizId, quiz);
    }

    setQuizzes(quizzes);
  }, [query.data, setQuizzes]);
};
