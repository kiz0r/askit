import type { WsPlayer } from '@/entities/game';
import { Badge } from '@/shared/ui';

type Props = {
  readonly roomCode: string;
  readonly quizTitle: string;
  readonly players: readonly WsPlayer[];
};

export const PlayerLobby = (props: Props) => {
  return (
    <div className='flex flex-col items-center justify-center grow gap-8 p-6 max-w-lg mx-auto w-full'>
      <div className='text-center'>
        <p className='text-xs text-muted-foreground uppercase tracking-widest mb-1'>Room code</p>
        <p className='text-4xl font-black tracking-widest font-mono'>{props.roomCode}</p>
      </div>

      <div className='text-center'>
        <p className='text-lg font-semibold'>{props.quizTitle}</p>
        <p className='text-sm text-muted-foreground mt-1'>Waiting for the host to start…</p>
      </div>

      <div className='w-full'>
        <p className='text-sm text-muted-foreground mb-3 text-center'>
          {props.players.length} {props.players.length === 1 ? 'player' : 'players'} joined
        </p>
        <div className='flex flex-wrap gap-2 justify-center'>
          {props.players.map((player) => (
            <Badge
              key={player.playerId}
              variant={player.isConnected ? 'default' : 'secondary'}
              className='text-sm px-3 py-1'
            >
              {player.nickname}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
