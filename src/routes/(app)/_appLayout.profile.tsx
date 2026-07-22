import { createFileRoute } from '@tanstack/react-router';
import { ProfilePage } from '@/pages/ProfilePage';

export const Route = createFileRoute('/(app)/_appLayout/profile')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Profile' }],
  }),
  component: ProfilePage,
});
