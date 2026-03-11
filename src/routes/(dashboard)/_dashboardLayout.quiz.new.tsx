import { ChevronLeftIcon } from '@radix-ui/react-icons';
import { Button } from '@radix-ui/themes';
import { createFileRoute, Link as RouterLink } from '@tanstack/react-router';
import { QuizForm } from '../../quiz/QuizForm';
import { useCreateQuiz } from '../../quiz/useCreateQuiz';
import styles from './CreateQuizPage.module.scss';

const CreateQuizPage = () => {
  const createQuiz = useCreateQuiz();

  return (
    <div className={styles.CreateQuizPage__Container}>
      <div>
        <Button asChild variant='outline' size='1'>
          <RouterLink to='/quizzes'>
            <ChevronLeftIcon />
            Back
          </RouterLink>
        </Button>
      </div>

      <QuizForm
        heading='Create a new Quiz'
        submitText='Create Quiz'
        quiz={null}
        onSubmit={createQuiz.execute}
        loading={createQuiz.isLoading}
      />
    </div>
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
