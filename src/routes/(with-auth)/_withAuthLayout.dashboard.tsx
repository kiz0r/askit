import { createFileRoute } from '@tanstack/react-router';
import { Dashboard } from '../../dashboard/Dashboard';

export const Route = createFileRoute('/(with-auth)/_withAuthLayout/dashboard')({
  component: Dashboard,
});
