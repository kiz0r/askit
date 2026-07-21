import { cn } from '@/shared/utils';

type Props = {
  readonly className?: string;
};

export const Skeleton = (props: Props) => (
  <div className={cn('animate-pulse rounded-md bg-muted', props.className)} />
);
