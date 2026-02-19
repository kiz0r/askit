import { createFileRoute } from '@tanstack/react-router';
import { QuizList } from '../../quiz/QuizList';
import { useQuizzesQuery } from '../../quiz/useQuizzesQuery';

export const Route = createFileRoute('/(dashboard)/_dashboardLayout/quizzes')({
  head: () => ({
    title: 'AskIt | Quizzes',
    meta: [
      {
        name: 'description',
        content: 'View and manage your quizzes on the AskIt dashboard',
      },
    ],
  }),
  component: () => {
    // Load quizzes
    useQuizzesQuery();

    return <QuizList />;
  },
});
