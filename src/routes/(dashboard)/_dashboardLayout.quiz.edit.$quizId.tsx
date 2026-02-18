import { createFileRoute } from '@tanstack/react-router';
import { QuizForm } from '../../quiz/QuizForm';
import { QuizId } from '../../quiz/QuizId';
import { useEditQuiz } from '../../quiz/useEditQuiz';
import { useQuizQuery } from '../../quiz/useQuizQuery';

type Params = {
  readonly quizId: QuizId;
};

export const Route = createFileRoute('/(dashboard)/_dashboardLayout/quiz/edit/$quizId')({
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

  const editQuiz = useEditQuiz(quizId);

  if (quizQuery.isLoading) {
    return <div>Loading quiz...</div>;
  }

  if (quizQuery.quiz == null) {
    return <div>Quiz not found</div>;
  }

  return (
    <QuizForm
      heading='Edit Quiz'
      submitText='Save Changes'
      onSubmit={editQuiz.execute}
      loading={editQuiz.isLoading}
      quiz={quizQuery.quiz}
    />
  );
}
