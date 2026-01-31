import { createFileRoute } from '@tanstack/react-router';
import { RegisterForm } from '../../auth/RegisterForm';

export const Route = createFileRoute('/auth/_authLayout/register')({
  component: RegisterForm,
});
