import { createFileRoute } from '@tanstack/react-router';
import { HostGamePage } from '@/pages/HostGamePage';

export const Route = createFileRoute('/(game)/_gameLayout/host/$roomCode')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Hosting game' }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  return <HostGamePage roomCode={params.roomCode} />;
}
