import { createFileRoute } from '@tanstack/react-router';
import { RegisterPage } from '@/pages/RegisterPage';

export const Route = createFileRoute('/auth/_authLayout/register')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Sign up' }],
  }),
  component: RegisterPage,
});
