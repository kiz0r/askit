import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeftIcon, OctagonAlertIcon, SearchAlertIcon } from 'lucide-react';
import { QuizId } from '@/entities/quiz';
import { GameSetupForm } from '@/features/game';
import { useQuizQuery } from '@/features/quiz';
import { Button, Empty, EmptyMedia, EmptyTitle, LoadingState } from '@/shared/ui';

type Params = {
  readonly quizId: QuizId;
};

export const Route = createFileRoute('/(app)/_appLayout/quiz/setup/$quizId')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Quiz setup' }],
  }),
  params: {
    parse: (params: Readonly<Record<string, string>>): Params => ({
      quizId: QuizId(params.quizId),
    }),
    stringify: (params: Params) => ({
      quizId: params.quizId,
    }),
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { quizId } = Route.useParams();
  const quizQuery = useQuizQuery(quizId);

  if (quizQuery.isLoading) {
    return <LoadingState message='Loading quiz…' />;
  }

  if (quizQuery.isError || quizQuery.data == null) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          {quizQuery.isError ? <OctagonAlertIcon /> : <SearchAlertIcon />}
        </EmptyMedia>
        <EmptyTitle>{quizQuery.isError ? 'Failed to load quiz' : 'Quiz not found'}</EmptyTitle>
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
}
