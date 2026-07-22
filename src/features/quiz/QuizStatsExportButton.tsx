import { DateTime, Effect } from 'effect';
import { ChevronDownIcon, DownloadIcon } from 'lucide-react';
import type { Quiz, QuizId } from '@/entities/quiz';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui';
import { downloadCsv, downloadJson } from '@/shared/utils';
import type { QuizStats } from './api/getQuizStats';

type Props = {
  readonly quizzes: ReadonlyMap<QuizId, Quiz>;
  readonly statsMap: ReadonlyMap<string, QuizStats>;
  readonly disabled: boolean;
};

const CSV_HEADERS = [
  'Quiz',
  'Tags',
  'Times Played',
  'Average Score',
  'Players',
  'Average Duration (s)',
] as const;

function buildCsvRows(
  quizzes: ReadonlyMap<QuizId, Quiz>,
  statsMap: ReadonlyMap<string, QuizStats>
): readonly (readonly string[])[] {
  const rows: /* mutable */ string[][] = [];

  for (const [_quizId, quiz] of quizzes) {
    const stats = statsMap.get(quiz.quizId);
    const hasStats = stats !== undefined && stats.timesPlayed > 0;

    const timesPlayed = stats?.timesPlayed ?? 0;
    const averageScore = Math.round(stats?.averageScore ?? 0);
    const totalPlayers = stats?.totalPlayers ?? 0;

    rows.push([
      quiz.title,
      quiz.tags.join('; '),
      `${timesPlayed}`,
      hasStats ? `${averageScore}` : '',
      `${totalPlayers}`,
      hasStats ? `${Math.round(stats.averageDurationSeconds)}` : '',
    ]);
  }
  return rows;
}

function buildJsonData(
  quizzes: ReadonlyMap<QuizId, Quiz>,
  statsMap: ReadonlyMap<string, QuizStats>
) {
  const data: /* mutable */ unknown[] = [];
  for (const [_quizId, quiz] of quizzes) {
    const stats = statsMap.get(quiz.quizId);

    data.push({
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
    });
  }

  return data;
}

export const QuizStatsExportButton = (props: Props) => {
  const exportCsv = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(
      `Askit-Statistics-${date}.csv`,
      CSV_HEADERS,
      buildCsvRows(props.quizzes, props.statsMap)
    ).pipe(Effect.runSync);
  };

  const exportJson = () => {
    const date = new Date().toISOString().slice(0, 10);
    downloadJson(
      `Askit-Statistics-${date}.json`,
      buildJsonData(props.quizzes, props.statsMap)
    ).pipe(Effect.orDie, Effect.runSync);
  };

  return (
    <div className='inline-flex'>
      <Button
        variant='outline'
        className='rounded-r-none'
        disabled={props.disabled}
        onClick={exportCsv}
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
            disabled={props.disabled}
            aria-label='More export options'
          >
            <ChevronDownIcon className='size-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={exportCsv}>Export as CSV</DropdownMenuItem>
          <DropdownMenuItem onClick={exportJson}>Export as JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
