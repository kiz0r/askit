import { ArrowDownAZ, Eye, Heart, Search, X } from 'lucide-react';
import * as React from 'react';
import type { QuizVisibility } from '@/entities/quiz';
import {
  Button,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';
import { cn } from '@/shared/utils';

const sortByOptions = [
  { value: 'updatedAt', label: 'Last Updated' },
  { value: 'createdAt', label: 'Date Created' },
  { value: 'title', label: 'Title' },
] as const;

const quizVisibilityOptions = [
  { value: 'all', label: 'All' },
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
] as const;

export type SortRule = (typeof sortByOptions)[number]['value'];
export type FilterQuizVisibility = 'all' | QuizVisibility;

export type QuizFilterState = {
  readonly visibility: FilterQuizVisibility;
  readonly searchQuery: string;
  readonly sortBy: SortRule;
  readonly favoritesOnly: boolean;
};

export const defaultQuizFilter: QuizFilterState = {
  visibility: 'all',
  searchQuery: '',
  sortBy: 'updatedAt',
  favoritesOnly: false,
};

type Props = {
  readonly filter: QuizFilterState;
  readonly onFilterChange: (filter: QuizFilterState) => void;
};

export const QuizFilter = React.memo((props: Props) => {
  const { filter, onFilterChange } = props;

  return (
    <div className='flex justify-between items-center gap-4'>
      <InputGroup className='max-w-md'>
        <InputGroupAddon align='inline-start'>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          placeholder='Search quizzes…'
          autoComplete='off'
          type='text'
          value={filter.searchQuery}
          onChange={(event) => onFilterChange({ ...filter, searchQuery: event.target.value })}
        />
        <InputGroupAddon align='inline-end'>
          {filter.searchQuery.length > 0 ? (
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              onClick={() => onFilterChange({ ...filter, searchQuery: '' })}
            >
              <X />
            </Button>
          ) : null}
        </InputGroupAddon>
      </InputGroup>

      <div className='flex gap-2 items-center'>
        <Button
          variant={filter.favoritesOnly ? 'secondary' : 'outline'}
          size='default'
          onClick={() => onFilterChange({ ...filter, favoritesOnly: !filter.favoritesOnly })}
        >
          <Heart className={cn('size-4', filter.favoritesOnly && 'fill-rose-500 text-rose-500')} />
          Favorites
        </Button>
        <Select
          value={filter.visibility}
          onValueChange={(value: FilterQuizVisibility) =>
            onFilterChange({ ...filter, visibility: value })
          }
        >
          <SelectTrigger className='w-35'>
            <Eye className='size-4 text-muted-foreground' />
            <SelectValue placeholder='Visibility' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {quizVisibilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={filter.sortBy}
          onValueChange={(value: SortRule) => onFilterChange({ ...filter, sortBy: value })}
        >
          <SelectTrigger className='w-40'>
            <ArrowDownAZ className='size-4 text-muted-foreground' />
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortByOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
