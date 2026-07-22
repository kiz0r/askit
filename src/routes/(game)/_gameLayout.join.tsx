import { createFileRoute } from '@tanstack/react-router';
import { JoinGamePage } from '@/pages/JoinGamePage';

type SearchParams = {
  readonly roomCode?: string;
};

export const Route = createFileRoute('/(game)/_gameLayout/join')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Join game' }],
  }),
  validateSearch: (searchParams: Readonly<Record<string, unknown>>): SearchParams => ({
    roomCode: typeof searchParams.roomCode === 'string' ? searchParams.roomCode : undefined,
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  return <JoinGamePage initialRoomCode={search.roomCode ?? null} />;
}
