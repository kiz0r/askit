import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { DateTime, Duration, Effect } from 'effect';
import { useAtomValue } from 'jotai';
import { ChevronDownIcon, ChevronRightIcon, DownloadIcon, TrophyIcon } from 'lucide-react';
import * as React from 'react';
import { type QuizId, quizzesAtom } from '@/entities/quiz';
import {
  ActivityChart,
  type ActivityPoint,
  AnalyticsSummary,
  type QuizStats,
  TagsPlaysChart,
  useBulkQuizStatsQuery,
  useQuizzesQuery,
} from '@/features/quiz';
import { getGameHistory } from '@/features/user';
import { applicationLayer } from '@/shared/settings';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  TagList,
} from '@/shared/ui';
import { cn, downloadCsv, downloadJson, formatDuration } from '@/shared/utils';

const ACTIVITY_HISTORY_LIMIT = 100;

const activityRangeOptions = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 14 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
] as const;

type ActivityRangeDays = (typeof activityRangeOptions)[number]['value'];

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

function buildActivityPoints(
  startedAtDates: readonly DateTime.Utc[],
  days: ActivityRangeDays
): readonly ActivityPoint[] {
  const now = DateTime.unsafeNow();
  const counts = new Map<string, number>();

  for (const startedAt of startedAtDates) {
    const dayKey = DateTime.formatIso(DateTime.startOf(startedAt, 'day')).slice(0, 10);
    counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
  }

  const points: /* mutable */ ActivityPoint[] = [];
  for (let offset = days - 1; offset >= 0; offset--) {
    const day = DateTime.subtract(now, { days: offset });
    const dayKey = DateTime.formatIso(DateTime.startOf(day, 'day')).slice(0, 10);
    points.push({
      date: dayKey,
      label: dayLabelFormatter.format(DateTime.toDate(day)),
      count: counts.get(dayKey) ?? 0,
    });
  }

  return points;
}

const StatsPage = () => {
  useQuizzesQuery();
  const quizzes = useAtomValue(quizzesAtom);
  const [expandedId, setExpandedId] = React.useState<QuizId | null>(null);
  const [tagFilter, setTagFilter] = React.useState<string | null>(null);
  const [activityRangeDays, setActivityRangeDays] = React.useState<ActivityRangeDays>(14);

  const allQuizIds = React.useMemo(() => [...quizzes.keys()] as readonly QuizId[], [quizzes]);

  const statsQuery = useBulkQuizStatsQuery(allQuizIds);

  const activityQuery = useQuery({
    queryKey: ['game-history', 'host', 'activity-chart'] as const,
    queryFn: ({ signal }) =>
      Effect.runPromise(
        getGameHistory({ limit: ACTIVITY_HISTORY_LIMIT, offset: 0, role: 'host' }).pipe(
          Effect.provide(applicationLayer)
        ),
        { signal }
      ),
  });

  const statsMap = React.useMemo(() => {
    const map = new Map<string, QuizStats>();
    for (const item of statsQuery.data ?? []) {
      map.set(item.quizId, item);
    }
    return map;
  }, [statsQuery.data]);

  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    for (const quiz of quizzes.values()) {
      for (const tag of quiz.tags) {
        tags.add(tag);
      }
    }
    return [...tags].sort();
  }, [quizzes]);

  const tagPlays = React.useMemo(() => {
    const totals = new Map<string, number>();
    for (const quiz of quizzes.values()) {
      const plays = statsMap.get(quiz.quizId)?.timesPlayed ?? 0;
      for (const tag of quiz.tags) {
        totals.set(tag, (totals.get(tag) ?? 0) + plays);
      }
    }
    return [...totals.entries()]
      .map(([tag, plays]) => ({ tag, plays }))
      .sort((entryA, entryB) => entryB.plays - entryA.plays);
  }, [quizzes, statsMap]);

  const activityPoints = React.useMemo(() => {
    const startedAtDates = (activityQuery.data?.items ?? [])
      .map((item) => item.startedAt)
      .filter((startedAt): startedAt is DateTime.Utc => startedAt !== null);
    return buildActivityPoints(startedAtDates, activityRangeDays);
  }, [activityQuery.data, activityRangeDays]);

  const activityHistoryTotal = activityQuery.data?.total ?? 0;
  const activityDataMayBeIncomplete = activityHistoryTotal > ACTIVITY_HISTORY_LIMIT;

  const summary = React.useMemo(() => {
    const statsList = [...statsMap.values()];
    const totalGamesPlayed = statsList.reduce((sum, s) => sum + s.timesPlayed, 0);
    const totalPlayers = statsList.reduce((sum, s) => sum + s.totalPlayers, 0);
    const playedQuizzes = statsList.filter((stat) => stat.timesPlayed > 0);
    const averageScore =
      playedQuizzes.length === 0
        ? null
        : playedQuizzes.reduce((sum, s) => sum + s.averageScore, 0) / playedQuizzes.length;

    return {
      totalQuizzes: quizzes.size,
      totalGamesPlayed,
      totalPlayers,
      averageScore,
    };
  }, [quizzes, statsMap]);

  const filteredQuizzes = React.useMemo(() => {
    const list = [...quizzes.values()];
    if (tagFilter === null) {
      return list;
    }
    return list.filter((quiz) => quiz.tags.includes(tagFilter));
  }, [quizzes, tagFilter]);

  const handleExportCsv = () => {
    const headers = [
      'Quiz',
      'Tags',
      'Times Played',
      'Average Score',
      'Players',
      'Average Duration (s)',
    ] as const;
    const rows = [...quizzes.values()].map((quiz) => {
      const stats = statsMap.get(quiz.quizId);
      const hasStats = stats != null && stats.timesPlayed > 0;
      return [
        quiz.title,
        quiz.tags.join('; '),
        String(stats?.timesPlayed ?? 0),
        hasStats ? String(Math.round(stats.averageScore)) : '',
        String(stats?.totalPlayers ?? 0),
        hasStats ? String(Math.round(stats.averageDurationSeconds)) : '',
      ];
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`Askit-Statistics-${date}.csv`, headers, rows).pipe(Effect.runSync);
  };

  const handleExportJson = () => {
    const data = [...quizzes.values()].map((quiz) => {
      const stats = statsMap.get(quiz.quizId);
      return {
        quiz: quiz.title,
        tags: quiz.tags,
        timesPlayed: stats?.timesPlayed ?? 0,
        totalPlayers: stats?.totalPlayers ?? 0,
        averageScore: stats?.averageScore ?? 0,
        averageDurationSeconds: stats?.averageDurationSeconds ?? 0,
        topPlayers: (stats?.topPlayers ?? []).map((player) => ({
          nickname: player.nickname,
          score: player.score,
          playedAt: DateTime.formatIso(player.playedAt),
        })),
      };
    });
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(`Askit-Statistics-${date}.json`, data).pipe(Effect.orDie, Effect.runSync);
  };

  const isLoading = statsQuery.isFetching && !statsQuery.data;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Analytics</h1>
          <p className='text-muted-foreground mt-1'>Performance stats for your quizzes</p>
        </div>

        <div className='inline-flex'>
          <Button
            variant='outline'
            className='rounded-r-none'
            disabled={quizzes.size === 0 || isLoading}
            onClick={handleExportCsv}
          >
            <DownloadIcon className='size-4' />
            Export CSV
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='icon'
                className='rounded-l-none border-l-0'
                disabled={quizzes.size === 0 || isLoading}
                aria-label='More export options'
              >
                <ChevronDownIcon className='size-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={handleExportCsv}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJson}>Export as JSON</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AnalyticsSummary
        totalQuizzes={summary.totalQuizzes}
        totalGamesPlayed={summary.totalGamesPlayed}
        totalPlayers={summary.totalPlayers}
        averageScore={summary.averageScore}
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <ActivityChart
          data={activityPoints}
          headerAction={
            <Select
              value={String(activityRangeDays)}
              onValueChange={(value) => setActivityRangeDays(Number(value) as ActivityRangeDays)}
            >
              <SelectTrigger size='sm' className='w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {activityRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          }
          note={
            activityDataMayBeIncomplete
              ? `Showing your ${ACTIVITY_HISTORY_LIMIT} most recent hosted games — older games in this range may not be included.`
              : undefined
          }
        />
        <TagsPlaysChart data={tagPlays} />
      </div>

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

      {quizzes.size === 0 ? (
        <div className='flex items-center justify-center rounded-xl border border-dashed py-16 text-muted-foreground'>
          No quizzes yet
        </div>
      ) : (
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
              {filteredQuizzes.map((quiz) => {
                const stats = statsMap.get(quiz.quizId);
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
                      <td className='px-4 py-3 text-right tabular-nums'>
                        {isLoading ? (
                          <Skeleton className='h-4 w-8 ml-auto' />
                        ) : hasStats ? (
                          stats.timesPlayed
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums'>
                        {isLoading ? (
                          <Skeleton className='h-4 w-12 ml-auto' />
                        ) : hasStats ? (
                          Math.round(stats.averageScore)
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums'>
                        {isLoading ? (
                          <Skeleton className='h-4 w-8 ml-auto' />
                        ) : hasStats ? (
                          stats.totalPlayers
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </td>
                      <td className='px-4 py-3 text-right tabular-nums'>
                        {isLoading ? (
                          <Skeleton className='h-4 w-12 ml-auto' />
                        ) : hasStats ? (
                          formatDuration(Duration.seconds(stats.averageDurationSeconds))
                        ) : (
                          <span className='text-muted-foreground'>—</span>
                        )}
                      </td>
                    </tr>

                    {isExpanded ? (
                      <tr className='border-b last:border-b-0 bg-muted/10'>
                        <td colSpan={5} className='px-8 py-4'>
                          {!hasStats ? (
                            <p className='text-sm text-muted-foreground'>
                              No game sessions recorded yet.
                            </p>
                          ) : (
                            <div>
                              <div className='flex items-center gap-2 mb-3'>
                                <TrophyIcon className='size-4 text-amber-500' />
                                <span className='text-sm font-medium'>Top Players</span>
                              </div>
                              {stats.topPlayers.length === 0 ? (
                                <p className='text-sm text-muted-foreground'>No player data.</p>
                              ) : (
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'>
                                  {stats.topPlayers.slice(0, 6).map((player, index) => (
                                    <div
                                      key={`${player.nickname}-${player.playedAt}-${index}`}
                                      className='flex items-center justify-between rounded-lg border px-3 py-2 text-sm'
                                    >
                                      <div className='flex items-center gap-2 min-w-0'>
                                        <span className='text-muted-foreground w-5 shrink-0'>
                                          {index + 1}.
                                        </span>
                                        <span className='font-medium truncate'>
                                          {player.nickname}
                                        </span>
                                      </div>
                                      <span className='font-bold tabular-nums ml-2'>
                                        {player.score}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
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
      )}
    </div>
  );
};

export const Route = createFileRoute('/(app)/_appLayout/stats')({
  head: () => ({
    meta: [
      { title: 'AskIt ⋅ Analytics' },
      { name: 'description', content: 'Quiz performance stats' },
    ],
  }),
  component: StatsPage,
});
