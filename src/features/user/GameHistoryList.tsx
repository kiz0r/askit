import { useInfiniteQuery } from '@tanstack/react-query';
import { DateTime, Duration, Effect } from 'effect';
import { TrophyIcon } from 'lucide-react';
import * as React from 'react';
import { runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import {
  Button,
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/shared/ui';
import { cn, formatDate, formatDuration, generateArrayFromLength } from '@/shared/utils';
import { type GameHistoryItem, getGameHistory } from './api/getGameHistory';

const PAGE_SIZE = 20;

const RANK_COLORS = [
  'text-amber-500 bg-amber-500/10',
  'text-slate-400 bg-slate-400/10',
  'text-orange-700 bg-orange-700/10 dark:text-orange-500 dark:bg-orange-500/10',
] as const;

function RankBadge(props: { readonly rank: number }) {
  const rank = props.rank;
  const isPodium = rank <= 3;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-md text-xs font-bold tabular-nums',
        isPodium ? RANK_COLORS[rank - 1] : 'text-muted-foreground'
      )}
    >
      #{rank}
    </span>
  );
}

type RoleFilter = 'all' | 'host' | 'player';

const roleFilterOptions = [
  { value: 'all', label: 'All games' },
  { value: 'host', label: 'Hosted' },
  { value: 'player', label: 'Played' },
] as const satisfies readonly {
  readonly value: RoleFilter;
  readonly label: string;
}[];

const GRID_COLUMNS_CLASS = 'grid-cols-[1fr_7rem_9rem_7rem_5rem_5rem_4rem]';

function getSessionDuration(item: GameHistoryItem): string | null {
  if (item.startedAt === null || item.endedAt === null) {
    return null;
  }

  return formatDuration(
    Duration.millis(
      DateTime.toDate(item.endedAt).getTime() - DateTime.toDate(item.startedAt).getTime()
    )
  );
}

type RowProps = {
  readonly historyItem: GameHistoryItem;
};

const HistoryRow = (props: RowProps) => {
  const historyItem = props.historyItem;
  const isHost = historyItem.role === 'host';
  const duration = getSessionDuration(historyItem);

  return (
    <div
      className={cn(
        'grid items-center gap-2 px-4 py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors',
        GRID_COLUMNS_CLASS
      )}
    >
      <span className='font-medium truncate'>{historyItem.quizTitle}</span>

      <span
        className={cn(
          'text-sm font-medium',
          isHost ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
        )}
      >
        {isHost ? 'Host' : 'Player'}
      </span>

      <span className='text-sm text-muted-foreground truncate'>
        {formatDate(historyItem.startedAt, { excludeSeconds: true })}
      </span>

      <span className='text-sm text-muted-foreground'>
        {duration ?? <span className='text-muted-foreground'>—</span>}
      </span>

      <span className='text-right tabular-nums'>{historyItem.totalPlayers}</span>

      <span className='text-right tabular-nums'>
        {!isHost && historyItem.score !== null ? (
          historyItem.score
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </span>

      <span className='flex justify-end'>
        {!isHost && historyItem.rank !== null ? (
          <RankBadge rank={historyItem.rank} />
        ) : (
          <span className='text-muted-foreground'>—</span>
        )}
      </span>
    </div>
  );
};

export const GameHistoryList = () => {
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>(() => 'all');

  const query = useInfiniteQuery({
    queryKey: ['game-history', roleFilter] as const,
    queryFn: ({ pageParam, signal }) => {
      const program = getGameHistory({
        limit: PAGE_SIZE,
        offset: pageParam,
        role: roleFilter,
      }).pipe(Effect.provide(applicationLayer));

      return runProgram(program, { signal });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
  });

  const items = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex justify-end'>
        <Select value={roleFilter} onValueChange={(value: RoleFilter) => setRoleFilter(value)}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Filter' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {roleFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {query.isLoading ? (
        <div className='rounded-xl border overflow-clip'>
          <div className='flex flex-col'>
            {generateArrayFromLength(8, (_, index) => (
              <div
                key={index}
                className='flex items-center gap-4 px-4 py-3 border-b last:border-b-0'
              >
                <Skeleton className='h-4 w-2/5' />
                <Skeleton className='h-4 w-16 ml-auto' />
                <Skeleton className='h-4 w-16' />
                <Skeleton className='h-4 w-12' />
              </div>
            ))}
          </div>
        </div>
      ) : items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <TrophyIcon />
            </EmptyMedia>
            <EmptyTitle>No games played yet</EmptyTitle>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <div className='rounded-xl border overflow-clip'>
            <div
              className={cn(
                'sticky top-16 z-10 grid gap-2 px-4 py-3 border-b bg-muted text-xs font-medium text-muted-foreground',
                GRID_COLUMNS_CLASS
              )}
            >
              <span>Quiz Name</span>
              <span>Role</span>
              <span>Date</span>
              <span>Duration</span>
              <span className='text-right'>Players</span>
              <span className='text-right'>Score</span>
              <span className='text-right'>Rank</span>
            </div>

            {items.map((item) => (
              <HistoryRow key={`${item.sessionId}-${item.role}`} historyItem={item} />
            ))}
          </div>

          <p className='text-xs text-muted-foreground text-right'>
            Showing {items.length} of {total}
          </p>

          <div className='flex justify-center items-center gap-2'>
            {query.hasNextPage ? (
              <Button
                variant='outline'
                loading={query.isFetchingNextPage}
                disabled={query.isFetchingNextPage}
                onClick={() => query.fetchNextPage()}
              >
                Load more
              </Button>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};
