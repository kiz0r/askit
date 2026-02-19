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
import { DateTime } from 'effect';
import { useAtomValue } from 'jotai';
import React from 'react';
import { isQuizzesLoadingAtom, quizzesAtom } from '../store';
import { stringFilter } from '../utils/stringFilter';
import { Quiz, QuizVisibility } from './Quiz';
import { QuizCard } from './QuizCard';
import { QuizId } from './QuizId';
import styles from './QuizList.module.scss';

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

  return filteredItems.toSorted((quizA, quizB) => {
    // Sort by creation date descending
    return DateTime.lessThan(quizB.createdAt, quizA.createdAt) ? -1 : 1;
  });
}

type FilterQuizVisibility = 'all' | QuizVisibility;

type QuizFilter = {
  readonly visibility: FilterQuizVisibility;
  readonly searchQuery: string;
};

const defaultFilterValues: QuizFilter = {
  visibility: 'all',
  searchQuery: '',
};

const quizVisibilityOptions = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
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

        <Select.Root
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
            {quizVisibilityOptions.find((o) => o.value === filter.visibility)?.label}
          </Select.Trigger>
          <Select.Content side='bottom' align='center'>
            {quizVisibilityOptions.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
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
