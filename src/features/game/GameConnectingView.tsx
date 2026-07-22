import { Spinner } from '@/shared/ui';

export const GameConnectingView = () => (
  <div className='flex items-center justify-center grow gap-3'>
    <Spinner />
    <span className='text-muted-foreground text-sm'>Connecting…</span>
  </div>
);
