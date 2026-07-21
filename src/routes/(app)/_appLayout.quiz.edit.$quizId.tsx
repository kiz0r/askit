import { createFileRoute } from '@tanstack/react-router';
import { OctagonAlertIcon, SearchXIcon } from 'lucide-react';
import { QuizId } from '@/entities/quiz';
import { EditQuizForm, useQuizQuery } from '@/features/quiz';
import { Empty, EmptyMedia, EmptyTitle, LoadingState } from '@/shared/ui';

type Params = {
  readonly quizId: QuizId;
};

export const Route = createFileRoute('/(app)/_appLayout/quiz/edit/$quizId')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Edit quiz' }],
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
  const params = Route.useParams();
  const quizId = params.quizId;
  const quizQuery = useQuizQuery(quizId);

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
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Quiz not found</EmptyTitle>
      </Empty>
    );
  }

  return <EditQuizForm quizId={quizId} quiz={quizQuery.data} />;
}
