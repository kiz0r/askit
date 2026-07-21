import { createFileRoute } from '@tanstack/react-router';
import { ProfileView } from '@/features/user';

const ProfilePage = () => {
  return (
    <div className='flex flex-col gap-6 w-full max-w-2xl mx-auto'>
      <div>
        <h1 className='text-2xl font-bold'>Profile</h1>
        <p className='text-muted-foreground'>Manage your account details.</p>
      </div>
      <ProfileView />
    </div>
  );
};

export const Route = createFileRoute('/(app)/_appLayout/profile')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Profile' }],
  }),
  component: ProfilePage,
});
