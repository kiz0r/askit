import { createFileRoute } from '@tanstack/react-router';
import { QuizForm } from '../../quiz/QuizForm';
import { useCreateQuiz } from '../../quiz/useCreateQuiz';

const CreateQuizPage = () => {
  const createQuiz = useCreateQuiz();

  return (
    <QuizForm
      heading='Create a new Quiz'
      submitText='Create Quiz'
      onSubmit={createQuiz.execute}
      loading={createQuiz.isLoading}
    />
  );
};

export const Route = createFileRoute('/(dashboard)/_dashboardLayout/quiz/new')({
  head: () => ({
    title: 'AskIt | Create Quiz',
    meta: [
      {
        name: 'description',
        content: 'Create a new quiz on the AskIt dashboard',
      },
    ],
  }),
  component: CreateQuizPage,
});
