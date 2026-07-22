import { Link } from '@tanstack/react-router';
import { ChevronLeftIcon, OctagonAlertIcon, SearchAlertIcon } from 'lucide-react';
import type { QuizId } from '@/entities/quiz';
import { GameSetupForm } from '@/features/game';
import { useQuizQuery } from '@/features/quiz';
import { Button, Empty, EmptyMedia, EmptyTitle, LoadingState } from '@/shared/ui';

type Props = {
  readonly quizId: QuizId;
};

export const QuizSetupPage = (props: Props) => {
  const quizQuery = useQuizQuery(props.quizId);

  if (quizQuery.isLoading) {
    return <LoadingState message='Loading quiz…' />;
  }

  if (quizQuery.isError) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          <OctagonAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Failed to load quiz</EmptyTitle>
      </Empty>
    );
  }

  if (quizQuery.data == null) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          <SearchAlertIcon />
        </EmptyMedia>
        <EmptyTitle>Quiz not found</EmptyTitle>
      </Empty>
    );
  }

  return (
    <div className='grow flex flex-col gap-6'>
      <Button asChild variant='outline' className='w-fit' size='sm'>
        <Link to='/quizzes'>
          <ChevronLeftIcon />
          Back
        </Link>
      </Button>

      <GameSetupForm quiz={quizQuery.data} />
    </div>
  );
};
