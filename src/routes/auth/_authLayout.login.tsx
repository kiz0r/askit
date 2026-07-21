import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '@/features/auth';

export const Route = createFileRoute('/auth/_authLayout/login')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Log in' }],
  }),
  component: LoginForm,
});
