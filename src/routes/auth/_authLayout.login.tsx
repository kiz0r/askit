import { createFileRoute } from '@tanstack/react-router';
import { LoginForm } from '../../auth/LoginForm';

export const Route = createFileRoute('/auth/_authLayout/login')({
  component: LoginForm,
});
