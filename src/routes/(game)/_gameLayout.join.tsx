import { createFileRoute } from '@tanstack/react-router';
import { JoinGameForm } from '@/features/game';
import { Logo } from '@/shared/ui';

type SearchParams = {
  readonly roomCode?: string;
};

const JoinGamePage = () => {
  const searchParams = Route.useSearch();

  return (
    <div className='flex flex-col items-center justify-center grow p-6'>
      <div className='mb-8'>
        <Logo />
      </div>
      <div className='w-full max-w-sm'>
        <h1 className='text-2xl font-bold text-center mb-1'>Join a game</h1>
        <p className='text-muted-foreground text-center text-sm mb-8'>
          Enter the room code and pick a nickname
        </p>

        <JoinGameForm initialRoomCode={searchParams.roomCode ?? null} />
      </div>
    </div>
  );
};

export const Route = createFileRoute('/(game)/_gameLayout/join')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Join game' }],
  }),
  validateSearch: (searchParams: Readonly<Record<string, unknown>>): SearchParams => ({
    roomCode: typeof searchParams.roomCode === 'string' ? searchParams.roomCode : undefined,
  }),
  component: JoinGamePage,
});
