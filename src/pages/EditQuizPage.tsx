import { OctagonAlertIcon, SearchXIcon } from 'lucide-react';
import type { QuizId } from '@/entities/quiz';
import { EditQuizForm, useQuizQuery } from '@/features/quiz';
import { Empty, EmptyMedia, EmptyTitle, LoadingState } from '@/shared/ui';

type Props = {
  readonly quizId: QuizId;
};

export const EditQuizPage = (props: Props) => {
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
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Quiz not found</EmptyTitle>
      </Empty>
    );
  }

  return <EditQuizForm quizId={props.quizId} quiz={quizQuery.data} />;
};
