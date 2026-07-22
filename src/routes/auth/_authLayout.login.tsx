import { createFileRoute } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';

export const Route = createFileRoute('/auth/_authLayout/login')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Log in' }],
  }),
  component: LoginPage,
});
