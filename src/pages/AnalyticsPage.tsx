import { useQuery } from '@tanstack/react-query';
import { DateTime, Effect } from 'effect';
import { useAtomValue } from 'jotai';
import * as React from 'react';
import { type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import {
  ActivityChart,
  type ActivityPoint,
  AnalyticsSummary,
  type QuizStats,
  QuizStatsExportButton,
  QuizStatsTable,
  type TagPlays,
  TagsPlaysChart,
  useBulkQuizStatsQuery,
  useQuizzesQuery,
} from '@/features/quiz';
import { getGameHistory } from '@/features/user';
import { runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui';

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

function buildStatsMap(stats: readonly QuizStats[]): ReadonlyMap<string, QuizStats> {
  const map = new Map<string, QuizStats>();
  for (const item of stats) {
    map.set(item.quizId, item);
  }
  return map;
}

function buildTagPlays(
  quizzes: ReadonlyMap<QuizId, Quiz>,
  statsMap: ReadonlyMap<string, QuizStats>
): readonly TagPlays[] {
  const totals = new Map<string, number>();
  for (const quiz of quizzes.values()) {
    const plays = statsMap.get(quiz.quizId)?.timesPlayed ?? 0;
    for (const tag of quiz.tags) {
      totals.set(tag, (totals.get(tag) ?? 0) + plays);
    }
  }

  const result: /* mutable */ TagPlays[] = [];
  for (const [tag, plays] of totals) {
    result.push({ tag, plays });
  }
  result.sort((entryA, entryB) => entryB.plays - entryA.plays);
  return result;
}

export const AnalyticsPage = () => {
  useQuizzesQuery();
  const quizzes = useAtomValue(quizzesAtom);
  const [activityRangeDays, setActivityRangeDays] = React.useState<ActivityRangeDays>(14);

  const allQuizIds = React.useMemo(() => [...quizzes.keys()] as readonly QuizId[], [quizzes]);
  const statsQuery = useBulkQuizStatsQuery(allQuizIds);

  const activityQuery = useQuery({
    queryKey: ['game-history', 'host', 'activity-chart'] as const,
    queryFn: ({ signal }) =>
      runProgram(
        getGameHistory({ limit: ACTIVITY_HISTORY_LIMIT, offset: 0, role: 'host' }).pipe(
          Effect.provide(applicationLayer)
        ),
        { signal }
      ),
  });

  const statsMap = React.useMemo(() => buildStatsMap(statsQuery.data ?? []), [statsQuery.data]);

  const tagPlays = React.useMemo(() => buildTagPlays(quizzes, statsMap), [quizzes, statsMap]);

  const activityPoints = React.useMemo(() => {
    const startedAtDates: /* mutable */ DateTime.Utc[] = [];
    for (const item of activityQuery.data?.items ?? []) {
      if (item.startedAt !== null) {
        startedAtDates.push(item.startedAt);
      }
    }
    return buildActivityPoints(startedAtDates, activityRangeDays);
  }, [activityQuery.data, activityRangeDays]);

  const summary = React.useMemo(() => {
    let totalGamesPlayed = 0;
    let totalPlayers = 0;
    let scoreSum = 0;
    let playedCount = 0;
    for (const stats of statsMap.values()) {
      totalGamesPlayed += stats.timesPlayed;
      totalPlayers += stats.totalPlayers;
      if (stats.timesPlayed > 0) {
        scoreSum += stats.averageScore;
        playedCount += 1;
      }
    }

    return {
      totalQuizzes: quizzes.size,
      totalGamesPlayed,
      totalPlayers,
      averageScore: playedCount === 0 ? null : scoreSum / playedCount,
    };
  }, [quizzes, statsMap]);

  const activityHistoryTotal = activityQuery.data?.total ?? 0;
  const activityDataMayBeIncomplete = activityHistoryTotal > ACTIVITY_HISTORY_LIMIT;
  const isLoading = statsQuery.isFetching && !statsQuery.data;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>Analytics</h1>
          <p className='text-muted-foreground mt-1'>Performance stats for your quizzes</p>
        </div>

        <QuizStatsExportButton
          quizzes={quizzes}
          statsMap={statsMap}
          disabled={quizzes.size === 0 || isLoading}
        />
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

      <QuizStatsTable quizzes={quizzes} statsMap={statsMap} isLoading={isLoading} />
    </div>
  );
};
