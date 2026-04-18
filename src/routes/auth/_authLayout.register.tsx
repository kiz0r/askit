import { createFileRoute } from '@tanstack/react-router';
import { RegisterForm } from '@/features/auth';

export const Route = createFileRoute('/auth/_authLayout/register')({
  component: RegisterForm,
});
