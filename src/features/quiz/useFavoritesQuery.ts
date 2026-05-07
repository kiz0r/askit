import { useQuery } from '@tanstack/react-query';
import { Effect } from 'effect';
import { useSetAtom } from 'jotai';
import * as React from 'react';
import { favoriteQuizIdsAtom, type QuizId } from '@/entities/quiz';
import { SessionExpiredError, withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { getFavorites } from './api/getFavorites';

const fetchFavoritesProgram = getFavorites().pipe(
  withStandardErrors({ action: 'fetch favorites', fallback: [] as const }),
  Effect.catchTags({
    ParseError: Effect.die,
    MalformedJsonError: Effect.die,
  })
);

export const useFavoritesQuery = () => {
  const setFavoriteIds = useSetAtom(favoriteQuizIdsAtom);

  const query = useQuery({
    queryKey: ['favorites'] as const,
    staleTime: 30_000,
    queryFn: ({ signal }) =>
      Effect.runPromise(
        fetchFavoritesProgram.pipe(
          Effect.provide(applicationLayer),
          Effect.ensureErrorType<SessionExpiredError>(),
          Effect.ensureRequirementsType<never>()
        ),
        { signal }
      ),
  });

  React.useEffect(() => {
    if (query.data == null) {
      return;
    }

    const quizIds: ReadonlySet<QuizId> = new Set(query.data.map((quiz) => quiz.quizId));
    setFavoriteIds(quizIds);
  }, [query.data, setFavoriteIds]);

  return query;
};
