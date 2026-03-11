import { Cross2Icon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import {
  Button,
  Heading,
  IconButton,
  Select,
  Spinner,
  Strong,
  Text,
  TextField,
} from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import { DateTime, Equal } from 'effect';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { isQuizzesLoadingAtom, quizzesAtom } from '../store';
import { stringFilter } from '../utils/stringFilter';
import type { Quiz, QuizVisibility } from './Quiz';
import { QuizCard } from './QuizCard';
import type { QuizId } from './QuizId';
import styles from './QuizList.module.scss';

type SortRule = 'updatedAt' | 'createdAt' | 'title';

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

function filterQuizzes(quizzes: ReadonlyMap<QuizId, Quiz>, filter: QuizFilter): readonly Quiz[] {
  const filteredItems: /* mutable */ Quiz[] = [];

  for (const quiz of quizzes.values()) {
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

type FilterQuizVisibility = 'all' | QuizVisibility;

type QuizFilter = {
  readonly visibility: FilterQuizVisibility;
  readonly searchQuery: string;
  readonly sortBy: SortRule;
};

const defaultFilterValues: QuizFilter = {
  visibility: 'all',
  searchQuery: '',
  sortBy: 'updatedAt',
};

const quizVisibilityOptions = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
] as const;

const sortByOptions = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
] as const;

export const QuizList = React.memo(() => {
  const [filter, setFilter] = React.useState<QuizFilter>(() => defaultFilterValues);

  const filterInputId = React.useId();

  const quizzes = useAtomValue(quizzesAtom);
  const isLoading = useAtomValue(isQuizzesLoadingAtom);

  const filteredQuizzes = React.useMemo(() => filterQuizzes(quizzes, filter), [quizzes, filter]);

  if (isLoading) {
    return (
      <div className={styles.QuizList__LoadingState}>
        <Spinner size='3' />
        <Text weight='bold'>Loading your quizzes...</Text>
      </div>
    );
  }

  if (!isLoading && quizzes.size === 0) {
    // No quizzes yet
    return (
      <div className={styles.QuizList__NoResults}>
        <Heading as='h2'>You have no quizzes yet</Heading>
        <Text weight='medium'>Create a new one to get started!</Text>
        <Button asChild>
          <RouterLink to='/quiz/new'>
            Create
            <PlusIcon />
          </RouterLink>
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.QuizList}>
      <div className={styles.QuizList__FilterBar}>
        <TextField.Root
          className={styles.QuizList__FilterInput}
          id={filterInputId}
          type='text'
          autoComplete='off'
          placeholder='Search a quiz'
          value={filter.searchQuery}
          onChange={(event) => {
            setFilter((prev) => ({ ...prev, searchQuery: event.currentTarget.value }));
          }}
        >
          <TextField.Slot side='left'>
            <MagnifyingGlassIcon />
          </TextField.Slot>
          {filter.searchQuery.length !== 0 ? (
            <TextField.Slot side='right'>
              <IconButton
                size='1'
                variant='ghost'
                onClick={() => setFilter((prev) => ({ ...prev, searchQuery: '' }))}
              >
                <Cross2Icon />
              </IconButton>
            </TextField.Slot>
          ) : null}
        </TextField.Root>

        <div className={styles.QuizList__Selects}>
          <Select.Root
            size='1'
            value={filter.visibility}
            onValueChange={(nextValue: FilterQuizVisibility) => {
              setFilter((prev) => ({
                ...prev,
                visibility: nextValue,
              }));
            }}
          >
            <Select.Trigger>
              <Strong>Visibility: </Strong>
              {quizVisibilityOptions.find((option) => option.value === filter.visibility)?.label}
            </Select.Trigger>
            <Select.Content side='bottom' align='center'>
              {quizVisibilityOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>

          <Select.Root
            size='1'
            value={filter.sortBy}
            onValueChange={(nextValue: SortRule) => {
              setFilter((prev) => ({
                ...prev,
                sortBy: nextValue,
              }));
            }}
          >
            <Select.Trigger>
              <Strong>Sort by: </Strong>
              {sortByOptions.find((option) => option.value === filter.sortBy)?.label}
            </Select.Trigger>
            <Select.Content side='bottom' align='center'>
              {sortByOptions.map((option) => (
                <Select.Item key={option.value} value={option.value}>
                  {option.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div className={styles.QuizList__List}>
        {filteredQuizzes.length === 0 ? (
          <div className={styles.QuizList__NoResults}>
            <Heading as='h2'>No quizzes match the current filter 😭</Heading>
            <Text weight='medium'>Try adjusting your filter criteria 🥺</Text>
            <Button onClick={() => setFilter(defaultFilterValues)}>Reset All</Button>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <QuizCard key={quiz.quizId} quiz={quiz} searchQuery={filter.searchQuery} />
          ))
        )}
      </div>
    </div>
  );
});
