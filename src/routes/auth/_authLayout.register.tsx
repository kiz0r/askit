import { createFileRoute } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/auth/_authLayout/register')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Sign up' }],
  }),
  component: RegisterForm,
});
