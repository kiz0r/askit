import { createFileRoute } from '@tanstack/react-router';
import { QuizzesPage } from '@/pages/QuizzesPage';

export const Route = createFileRoute('/(app)/_appLayout/quizzes')({
  head: () => ({
    meta: [
      { title: 'AskIt ⋅ Quizzes' },
      { name: 'description', content: 'View and manage your quizzes on the AskIt dashboard' },
    ],
  }),
  component: QuizzesPage,
});
