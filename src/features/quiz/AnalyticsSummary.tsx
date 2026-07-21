import { GamepadIcon, ListChecksIcon, TrophyIcon, UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui';

type TileProps = {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value: string;
};

const Tile = (props: TileProps) => (
  <Card>
    <CardContent className='flex items-center gap-3'>
      <div className='flex items-center justify-center size-10 rounded-lg bg-primary/10 text-primary shrink-0'>
        {props.icon}
      </div>
      <div className='min-w-0'>
        <p className='text-2xl font-bold tabular-nums leading-tight'>{props.value}</p>
        <p className='text-sm text-muted-foreground truncate'>{props.label}</p>
      </div>
    </CardContent>
  </Card>
);

type Props = {
  readonly totalQuizzes: number;
  readonly totalGamesPlayed: number;
  readonly totalPlayers: number;
  readonly averageScore: number | null;
};

export const AnalyticsSummary = (props: Props) => {
  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      <Tile
        icon={<ListChecksIcon className='size-5' />}
        label='Quizzes'
        value={`${props.totalQuizzes}`}
      />
      <Tile
        icon={<GamepadIcon className='size-5' />}
        label='Games Played'
        value={`${props.totalGamesPlayed}`}
      />
      <Tile
        icon={<UsersIcon className='size-5' />}
        label='Total Players'
        value={`${props.totalPlayers}`}
      />
      <Tile
        icon={<TrophyIcon className='size-5' />}
        label='Avg Score'
        value={props.averageScore === null ? '—' : `${Math.round(props.averageScore)}`}
      />
    </div>
  );
};
