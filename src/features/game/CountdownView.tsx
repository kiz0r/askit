import { Duration } from 'effect';

type Props = {
  readonly duration: Duration.Duration;
  readonly quizTitle: string;
};

export const CountdownView = (props: Props) => {
  const seconds = Math.ceil(Duration.toSeconds(props.duration));

  return (
    <div className='flex flex-col items-center justify-center grow gap-6 p-6'>
      <p className='text-muted-foreground text-sm uppercase tracking-widest'>Get ready</p>
      <p className='text-lg font-semibold text-center'>{props.quizTitle}</p>
      <div
        key={seconds}
        className='text-8xl font-black tabular-nums animate-in zoom-in-75 duration-300'
      >
        {seconds}
      </div>
      <p className='text-muted-foreground'>Starting in {seconds}s…</p>
    </div>
  );
};
