import { createFileRoute } from '@tanstack/react-router';
import { QuizId } from '@/entities/quiz';
import { EditQuizPage } from '@/pages/EditQuizPage';

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
  return <EditQuizPage quizId={params.quizId} />;
}
