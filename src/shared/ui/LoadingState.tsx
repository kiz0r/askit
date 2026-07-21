import { Empty, EmptyMedia, EmptyTitle } from './Empty';
import { Spinner } from './Spinner';

type Props = {
  readonly message: string;
};

export function LoadingState(props: Props) {
  return (
    <Empty>
      <EmptyMedia variant='icon'>
        <Spinner />
      </EmptyMedia>
      <EmptyTitle>{props.message}</EmptyTitle>
    </Empty>
  );
}
