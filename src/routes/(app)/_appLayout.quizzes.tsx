import { createFileRoute } from '@tanstack/react-router';
import * as React from 'react';
import { QuizList, useQuizzesQuery } from '@/features/quiz';

const QuizzesPage = React.memo(() => {
  useQuizzesQuery();
  return <QuizList />;
});

export const Route = createFileRoute('/(app)/_appLayout/quizzes')({
  head: () => ({
    title: 'AskIt | Quizzes',
    meta: [
      {
        name: 'description',
        content: 'View and manage your quizzes on the AskIt dashboard',
      },
    ],
  }),
  component: QuizzesPage,
});
