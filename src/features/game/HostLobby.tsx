import { QRCodeSVG } from 'qrcode.react';
import type { WsPlayer } from '@/entities/game';
import { Toast } from '@/shared/toasts';
import { Badge, Button } from '@/shared/ui';

type Props = {
  readonly roomCode: string;
  readonly quizTitle: string;
  readonly players: readonly WsPlayer[];
  readonly onStartGame: () => void;
  readonly isStarting: boolean;
};

function getJoinGameUrl(roomCode: string): string {
  return `${window.location.origin}/join?roomCode=${roomCode}`;
}

export const HostLobby = (props: Props) => {
  const joinUrl = getJoinGameUrl(props.roomCode);

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl).then(() => {
      Toast.success({ title: 'Link copied!' });
    });
  };

  return (
    <div className='flex flex-col items-center justify-center grow gap-8 p-6 max-w-2xl mx-auto w-full'>
      <div className='flex flex-col sm:flex-row items-center gap-8 w-full'>
        <div className='shrink-0 p-3 rounded-2xl border bg-white shadow-sm'>
          <QRCodeSVG value={joinUrl} size={148} />
        </div>

        <div className='flex flex-col items-center sm:items-start gap-3'>
          <div>
            <p className='text-xs text-muted-foreground uppercase tracking-widest mb-1 text-center sm:text-left'>
              Room code
            </p>
            <p className='text-5xl font-black tracking-widest font-mono'>{props.roomCode}</p>
          </div>
          <Button variant='outline' size='sm' onClick={copyLink}>
            Copy invite link
          </Button>
          <p className='text-sm text-muted-foreground'>{props.quizTitle}</p>
        </div>
      </div>

      <div className='w-full'>
        <p className='text-sm text-muted-foreground mb-3 text-center'>
          {props.players.length} {props.players.length === 1 ? 'player' : 'players'} waiting
        </p>
        <div className='flex flex-wrap gap-2 justify-center min-h-8'>
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

      <Button
        size='lg'
        className='w-full max-w-xs'
        onClick={props.onStartGame}
        disabled={props.players.length === 0}
        loading={props.isStarting}
      >
        Start Game
      </Button>
    </div>
  );
};
