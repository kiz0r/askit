import { createFileRoute } from '@tanstack/react-router';
import { CreateQuizForm } from '@/features/quiz';

export const Route = createFileRoute('/(app)/_appLayout/quiz/new')({
  head: () => ({
    meta: [
      { title: 'AskIt ⋅ Create Quiz' },
      { name: 'description', content: 'Create a new quiz on the AskIt dashboard' },
    ],
  }),
  component: CreateQuizForm,
});
