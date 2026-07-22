type Props = {
  readonly message: string | null;
};

export const GameErrorView = (props: Props) => (
  <div className='flex flex-col items-center justify-center grow gap-3 p-6 text-center'>
    <p className='text-destructive font-semibold text-lg'>Something went wrong</p>
    <p className='text-muted-foreground text-sm'>{props.message ?? 'Unknown error'}</p>
  </div>
);
