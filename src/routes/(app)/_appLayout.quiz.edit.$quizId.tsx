import { createFileRoute, Link } from '@tanstack/react-router';
import { ChevronLeft, OctagonAlert, SearchAlert } from 'lucide-react';
import { QuizId } from '@/entities/quiz';
import { EditQuizForm, useQuizQuery } from '@/features/quiz';
import { Button, Empty, EmptyMedia, EmptyTitle, Spinner } from '@/shared/ui';

type Params = {
  readonly quizId: QuizId;
};

export const Route = createFileRoute('/(app)/_appLayout/quiz/edit/$quizId')({
  params: {
    parse: (params: Record<string, string>): Params => ({
      quizId: QuizId(params.quizId),
    }),
    stringify: (params: Params) => ({
      quizId: params.quizId,
    }),
  },
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const quizId = params.quizId;
  const quizQuery = useQuizQuery(quizId);

  if (quizQuery.isLoading) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          <Spinner />
        </EmptyMedia>
        <EmptyTitle>Loading quiz…</EmptyTitle>
      </Empty>
    );
  }

  if (quizQuery.data == null) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          <SearchAlert />
        </EmptyMedia>
        <EmptyTitle>Quiz not found</EmptyTitle>
      </Empty>
    );
  }

  if (quizQuery.isError) {
    return (
      <Empty>
        <EmptyMedia variant='icon'>
          <OctagonAlert />
        </EmptyMedia>
        <EmptyTitle>Failed to load quiz</EmptyTitle>
      </Empty>
    );
  }

  return (
    <div className='grow flex flex-col gap-6'>
      <Button asChild variant='outline' className='w-fit' size='sm'>
        <Link to='/quizzes'>
          <ChevronLeft />
          Back
        </Link>
      </Button>

      <EditQuizForm quizId={quizId} quiz={quizQuery.data} />
    </div>
  );
}
