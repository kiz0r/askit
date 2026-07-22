import { createFileRoute } from '@tanstack/react-router';
import { HistoryPage } from '@/pages/HistoryPage';

export const Route = createFileRoute('/(app)/_appLayout/history')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Game history' }],
  }),
  component: HistoryPage,
});
