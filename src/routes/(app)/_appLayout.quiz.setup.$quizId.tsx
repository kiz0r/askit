import { createFileRoute } from '@tanstack/react-router';
import { QuizId } from '@/entities/quiz';
import { QuizSetupPage } from '@/pages/QuizSetupPage';

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
  const params = Route.useParams();
  return <QuizSetupPage quizId={params.quizId} />;
}
