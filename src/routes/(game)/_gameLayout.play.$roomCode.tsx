import { createFileRoute } from '@tanstack/react-router';
import { PlayGamePage } from '@/pages/PlayGamePage';

export const Route = createFileRoute('/(game)/_gameLayout/play/$roomCode')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Playing' }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <PlayGamePage roomCode={params.roomCode} />;
}
