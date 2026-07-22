import { Duration } from 'effect';
import { ChevronDownIcon, ChevronRightIcon, TrophyIcon } from 'lucide-react';
import * as React from 'react';
import type { Quiz, QuizId } from '@/entities/quiz';
import { Badge, Skeleton, TagList } from '@/shared/ui';
import { cn, formatDuration } from '@/shared/utils';
import type { QuizStats } from './api/getQuizStats';

type Props = {
  readonly quizzes: ReadonlyMap<QuizId, Quiz>;
  readonly statsMap: ReadonlyMap<string, QuizStats>;
  readonly isLoading: boolean;
};

type StatCellProps = {
  readonly isLoading: boolean;
  readonly value: string | number | null;
  readonly skeletonWidth: string;
};

const StatCell = (props: StatCellProps) => {
  if (props.isLoading) {
    return (
      <td className='px-4 py-3 text-right tabular-nums'>
        <Skeleton className={cn('h-4 ml-auto', props.skeletonWidth)} />
      </td>
    );
  }

  if (props.value === null) {
    return (
      <td className='px-4 py-3 text-right tabular-nums'>
        <span className='text-muted-foreground'>—</span>
      </td>
    );
  }

  return <td className='px-4 py-3 text-right tabular-nums'>{props.value}</td>;
};

type TopPlayersProps = {
  readonly players: QuizStats['topPlayers'];
};

const TopPlayers = (props: TopPlayersProps) => {
  if (props.players.length === 0) {
    return <p className='text-sm text-muted-foreground'>No player data.</p>;
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
      {props.players.slice(0, 6).map((player, index) => (
        <div
          key={`${player.nickname}-${index}`}
          className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
        >
          <div className='flex items-center gap-2 min-w-0'>
            <span className='text-muted-foreground w-5 shrink-0'>{index + 1}.</span>
            <span className='font-medium truncate'>{player.nickname}</span>
          </div>
          <span className='font-bold tabular-nums ml-2'>{player.score}</span>
        </div>
      ))}
    </div>
  );
};

function collectTags(quizzes: ReadonlyMap<QuizId, Quiz>): readonly string[] {
  const tags: /* mutable */ Set<string> = new Set();

  for (const [_quizId, quiz] of quizzes) {
    for (const tag of quiz.tags) {
      tags.add(tag);
    }
  }

  return [...tags].sort((tagA, tagB) => tagA.localeCompare(tagB));
}

function filterByTag(quizzes: ReadonlyMap<QuizId, Quiz>, tag: string | null): readonly Quiz[] {
  const filtered: /* mutable */ Quiz[] = [];

  for (const quiz of quizzes.values()) {
    if (tag !== null && !quiz.tags.includes(tag)) {
      continue;
    }

    filtered.push(quiz);
  }

  return filtered;
}

export const QuizStatsTable = (props: Props) => {
  const [expandedId, setExpandedId] = React.useState<QuizId | null>(null);
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);

  const allTags = React.useMemo(() => collectTags(props.quizzes), [props.quizzes]);
  const visibleQuizzes = React.useMemo(
    () => filterByTag(props.quizzes, tagFilter),
    [props.quizzes, tagFilter]
  );

  if (props.quizzes.size === 0) {
    return (
      <div className='flex items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground'>
        No quizzes yet
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {allTags.length > 0 ? (
        <div className='flex flex-wrap gap-1'>
          <Badge
            variant={tagFilter === null ? 'default' : 'outline'}
            className='cursor-pointer'
            onClick={() => setTagFilter(null)}
          >
            All
          </Badge>
          {allTags.map((tag) => (
            <Badge
              key={tag}
              variant={tagFilter === tag ? 'default' : 'outline'}
              className='cursor-pointer'
              onClick={() => setTagFilter(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className='rounded-xl border overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-muted/50 border-b'>
            <tr>
              <th className='text-left px-4 py-3 font-medium text-muted-foreground'>Quiz</th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground w-32'>
                Times Played
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground w-28'>
                Avg Score
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground w-24'>
                Players
              </th>
              <th className='text-right px-4 py-3 font-medium text-muted-foreground w-32'>
                Avg Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleQuizzes.map((quiz) => {
              const stats = props.statsMap.get(quiz.quizId);
              const hasStats = stats != null && stats.timesPlayed > 0;
              const isExpanded = expandedId === quiz.quizId;

              return (
                <React.Fragment key={quiz.quizId}>
                  <tr
                    className={cn(
                      'border-b last:border-b-0 hover:bg-muted/30 cursor-pointer transition-colors',
                      { 'bg-muted/20': isExpanded }
                    )}
                    onClick={() => setExpandedId(isExpanded ? null : quiz.quizId)}
                  >
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        {isExpanded ? (
                          <ChevronDownIcon className='size-4 text-muted-foreground shrink-0' />
                        ) : (
                          <ChevronRightIcon className='size-4 text-muted-foreground shrink-0' />
                        )}
                        <div className='min-w-0'>
                          <div className='font-medium truncate'>{quiz.title}</div>
                          {quiz.tags.length > 0 ? (
                            <TagList items={quiz.tags} maxVisible={3} className='mt-1' />
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <StatCell
                      isLoading={props.isLoading}
                      value={hasStats ? stats.timesPlayed : null}
                      skeletonWidth='w-8'
                    />
                    <StatCell
                      isLoading={props.isLoading}
                      value={hasStats ? Math.round(stats.averageScore) : null}
                      skeletonWidth='w-12'
                    />
                    <StatCell
                      isLoading={props.isLoading}
                      value={hasStats ? stats.totalPlayers : null}
                      skeletonWidth='w-8'
                    />
                    <StatCell
                      isLoading={props.isLoading}
                      value={
                        hasStats
                          ? formatDuration(Duration.seconds(stats.averageDurationSeconds))
                          : null
                      }
                      skeletonWidth='w-12'
                    />
                  </tr>

                  {isExpanded ? (
                    <tr className='border-b last:border-b-0 bg-muted/10'>
                      <td colSpan={5} className='px-8 py-4'>
                        {hasStats ? (
                          <div>
                            <div className='flex items-center gap-2 mb-3'>
                              <TrophyIcon className='size-4 text-amber-500' />
                              <span className='text-sm font-medium'>Top Players</span>
                            </div>
                            <TopPlayers players={stats.topPlayers} />
                          </div>
                        ) : (
                          <p className='text-sm text-muted-foreground'>
                            No game sessions recorded yet.
                          </p>
                        )}
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
