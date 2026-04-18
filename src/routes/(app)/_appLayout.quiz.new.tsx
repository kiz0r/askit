import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft } from 'lucide-react';
import { CreateQuizForm } from '@/features/quiz';
import { Button } from '@/shared/ui';

const CreateQuizPage = () => {
  return (
    <div className='grow flex flex-col gap-6'>
      <Button asChild variant='outline' className='w-fit' size='sm'>
        <Link to='/quizzes'>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      <CreateQuizForm />
    </div>
  );
};

export const Route = createFileRoute('/(app)/_appLayout/quiz/new')({
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
