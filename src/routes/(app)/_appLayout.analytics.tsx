import { createFileRoute } from '@tanstack/react-router';
import { AnalyticsPage } from '@/pages/AnalyticsPage';

export const Route = createFileRoute('/(app)/_appLayout/analytics')({
  head: () => ({
    meta: [
      { title: 'AskIt ⋅ Analytics' },
      { name: 'description', content: 'Quiz performance stats' },
    ],
  }),
  component: AnalyticsPage,
});
