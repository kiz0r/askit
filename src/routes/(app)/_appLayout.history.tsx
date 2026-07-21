import { createFileRoute } from '@tanstack/react-router';
import { GameHistoryList } from '@/features/user';

const HistoryPage = () => {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-2xl font-bold'>Game History</h1>
        <p className='text-muted-foreground'>Your past games as host and player.</p>
      </div>

      <GameHistoryList />
    </div>
  );
};

export const Route = createFileRoute('/(app)/_appLayout/history')({
  head: () => ({
    meta: [{ title: 'AskIt ⋅ Game history' }],
  }),
  component: HistoryPage,
});
