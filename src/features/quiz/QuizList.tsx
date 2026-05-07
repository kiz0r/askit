import { Link } from '@tanstack/react-router';
import { DateTime, Equal } from 'effect';
import { useAtomValue } from 'jotai';
import { ListX, Plus, SearchX } from 'lucide-react';
import * as React from 'react';
import {
  favoriteQuizIdsAtom,
  isQuizzesLoadingAtom,
  type Quiz,
  type QuizId,
  quizzesAtom,
} from '@/entities/quiz';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Spinner,
} from '@/shared/ui';
import { stringFilter } from '@/shared/utils';
import { QuizCard } from './QuizCard';
import { defaultQuizFilter, QuizFilter, type QuizFilterState, type SortRule } from './QuizFilter';
import { useFavoritesQuery } from './useFavoritesQuery';

function sortQuizzes(quizzes: readonly Quiz[], sortBy: SortRule): readonly Quiz[] {
  return quizzes.toSorted((quizA, quizB) => {
    switch (sortBy) {
      case 'updatedAt': {
        if (!Equal.equals(quizA.updatedAt, quizB.updatedAt)) {
          return DateTime.lessThan(quizB.updatedAt, quizA.updatedAt) ? -1 : 1;
        }

        return quizA.title.localeCompare(quizB.title);
      }

      case 'createdAt': {
        if (!Equal.equals(quizA.createdAt, quizB.createdAt)) {
          return DateTime.lessThan(quizB.createdAt, quizA.createdAt) ? -1 : 1;
        }

        return quizA.title.localeCompare(quizB.title);
      }

      case 'title': {
        return quizA.title.localeCompare(quizB.title);
      }

      default: {
        const _exhaustiveCheck: never = sortBy;
        return _exhaustiveCheck;
      }
    }
  });
}

function filterQuizzes(
  quizzes: ReadonlyMap<QuizId, Quiz>,
  filter: QuizFilterState,
  favoriteIds: ReadonlySet<QuizId>
): readonly Quiz[] {
  const filteredItems: /* mutable */ Quiz[] = [];

  for (const quiz of quizzes.values()) {
    const isFavorite = favoriteIds.has(quiz.quizId);
    if (filter.favoritesOnly && !isFavorite) {
      continue;
    }

    if (filter.visibility !== 'all' && quiz.settings.visibility !== filter.visibility) {
      continue;
    }

    if (
      filter.searchQuery.length > 0 &&
      !stringFilter.matchAny([quiz.title, quiz.description ?? ''], filter.searchQuery)
    ) {
      continue;
    }

    filteredItems.push(quiz);
  }

  return sortQuizzes(filteredItems, filter.sortBy);
}

export const QuizList = React.memo(() => {
  const [filter, setFilter] = React.useState<QuizFilterState>(() => defaultQuizFilter);
  const quizzes = useAtomValue(quizzesAtom);
  const isLoading = useAtomValue(isQuizzesLoadingAtom);
  const favoriteIds = useAtomValue(favoriteQuizIdsAtom);
  useFavoritesQuery();

  const filteredQuizzes = React.useMemo(
    () => filterQuizzes(quizzes, filter, favoriteIds),
    [quizzes, filter, favoriteIds]
  );

  if (isLoading) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <Spinner className='size-10' />
          </EmptyMedia>
          <EmptyTitle>Loading quizzes…</EmptyTitle>
        </EmptyHeader>
      </Empty>
    );
  }

  if (!isLoading && quizzes.size === 0) {
    // No quizzes yet
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <ListX />
          </EmptyMedia>
          <EmptyTitle>You have no quizzes yet</EmptyTitle>
          <EmptyDescription>Create a new one to get started!</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to='/quiz/new'>
              <Plus className='w-4 h-4 mr-1' />
              Create
            </Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className='flex flex-col gap-6 grow'>
      <QuizFilter filter={filter} onFilterChange={setFilter} />

      {filteredQuizzes.length === 0 ? (
        <Empty>
          <EmptyMedia>
            <SearchX />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>No quizzes match the current filter</EmptyTitle>
            <EmptyDescription>Try adjusting your filter criteria</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setFilter(defaultQuizFilter)}>Reset filters</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <p className='text-sm text-muted-foreground'>
            Showing {filteredQuizzes.length} of {quizzes.size}{' '}
            {quizzes.size === 1 ? 'quiz' : 'quizzes'}
          </p>
          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.quizId} quiz={quiz} searchQuery={filter.searchQuery} />
            ))}
          </div>
        </>
      )}
    </div>
  );
});
