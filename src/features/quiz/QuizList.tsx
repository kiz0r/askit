import { Link } from '@tanstack/react-router';
import { DateTime, Equal } from 'effect';
import { useAtomValue } from 'jotai';
import { ListXIcon, PlusIcon, SearchXIcon } from 'lucide-react';
import * as React from 'react';
import { isQuizzesLoadingAtom, type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Skeleton,
} from '@/shared/ui';
import { generateArrayFromLength, stringFilter } from '@/shared/utils';
import { QuizCard } from './QuizCard';
import { defaultQuizFilter, QuizFilter, type QuizFilterState, type SortRule } from './QuizFilter';

function renderSkeletons() {
  return (
    <div className='flex flex-col gap-6 grow'>
      <div className='flex justify-between items-center gap-4'>
        <Skeleton className='h-10 max-w-md w-full' />
        <div className='flex gap-2'>
          <Skeleton className='h-10 w-28' />
          <Skeleton className='h-10 w-36' />
          <Skeleton className='h-10 w-40' />
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4'>
        {generateArrayFromLength(8, (_, index) => (
          <div key={index} className='flex flex-col gap-3 p-5 rounded-xl border bg-card'>
            <div className='flex justify-between gap-2'>
              <Skeleton className='h-5 w-3/4' />
              <Skeleton className='h-5 w-16 rounded-md' />
            </div>
            <Skeleton className='h-4 w-full' />
            <Skeleton className='h-4 w-2/3' />
            <div className='grid grid-cols-2 gap-2 mt-2'>
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
              <Skeleton className='h-4 w-full' />
            </div>
            <div className='flex justify-between mt-2 pt-3 border-t'>
              <Skeleton className='h-8 w-20' />
              <Skeleton className='h-8 w-20' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function quizzesToSortedList(quizzes: readonly Quiz[], sortBy: SortRule): readonly Quiz[] {
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
  filter: QuizFilterState
): readonly Quiz[] {
  const filteredItems: /* mutable */ Quiz[] = [];

  for (const quiz of quizzes.values()) {
    if (filter.visibility !== 'all' && quiz.settings.visibility !== filter.visibility) {
      continue;
    }

    if (filter.favoritesOnly && !quiz.isFavorited) {
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

  return quizzesToSortedList(filteredItems, filter.sortBy);
}

export const QuizList = () => {
  const [filter, setFilter] = React.useState<QuizFilterState>(() => defaultQuizFilter);
  const quizzes = useAtomValue(quizzesAtom);
  const isLoading = useAtomValue(isQuizzesLoadingAtom);

  const filteredQuizzes = filterQuizzes(quizzes, filter);

  if (isLoading) {
    return renderSkeletons();
  }

  if (!isLoading && quizzes.size === 0) {
    // No quizzes yet
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant='icon'>
            <ListXIcon />
          </EmptyMedia>
          <EmptyTitle>You have no quizzes yet</EmptyTitle>
          <EmptyDescription>Create a new one to get started!</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link to='/quiz/new'>
              <PlusIcon className='w-4 h-4 mr-1' />
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
            <SearchXIcon />
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
};
