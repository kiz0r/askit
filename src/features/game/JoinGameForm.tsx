import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { useSetAtom } from 'jotai';
import { ArrowRightIcon, HashIcon, UserIcon } from 'lucide-react';
import * as React from 'react';
import { sessionPlayerIdAtom } from '@/entities/game';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import { Button, Field, Input, Label } from '@/shared/ui';
import { isGameErrorRecoverable } from './api/isGameErrorRecoverable';
import { joinRoom } from './api/joinRoom';

type JoinRoomInput = {
  readonly roomCode: string;
  readonly nickname: string;
};

function normalizeFormState(formState: FormState): JoinRoomInput {
  const normalizedRoomCode = formState.roomCode.trim().toUpperCase();
  const normalizedNickname = formState.nickname.trim();

  return {
    roomCode: normalizedRoomCode,
    nickname: normalizedNickname,
  };
}

const joinRoomProgram = (input: JoinRoomInput) =>
  joinRoom(input.roomCode, input.nickname).pipe(
    Effect.retry({
      while: isGameErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        // User navigated away / cancelled — not a failure to report.
        if (error instanceof Fetch.AbortError) {
          return;
        }

        // Session expiry is handled globally — never toast here.
        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to join game',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

type FormState = JoinRoomInput;

function validateForm(formState: FormState) {
  const roomCode = formState.roomCode.trim();
  const nickname = formState.nickname.trim();

  if (roomCode.length === 0) {
    return false;
  }

  if (nickname.length === 0) {
    return false;
  }

  return true;
}

type Props = {
  readonly initialRoomCode: string | null;
};

export const JoinGameForm = (props: Props) => {
  const [formState, setFormState] = React.useState<FormState>(() => ({
    roomCode: props.initialRoomCode ?? '',
    nickname: '',
  }));

  const navigate = useNavigate();
  const setSessionPlayerId = useSetAtom(sessionPlayerIdAtom);

  const mutation = useMutation({
    mutationFn: (input: JoinRoomInput) =>
      joinRoomProgram(input).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSuccess: (player, joinRoomInput) => {
      const roomCode = joinRoomInput.roomCode.trim().toUpperCase();
      sessionStorage.setItem(`game:${roomCode}`, player.playerId);
      setSessionPlayerId(player.playerId);

      navigate({
        to: '/play/$roomCode',
        params: { roomCode },
      });
    },
  });

  const isFormValid = validateForm(formState);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!isFormValid) {
          return;
        }

        const normalizedState = normalizeFormState(formState);

        mutation.mutate(normalizedState);
      }}
      className='flex flex-col gap-4 w-full max-w-sm'
    >
      <Field>
        <Label htmlFor='room-code'>Room code</Label>
        <div className='relative'>
          <HashIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
          <Input
            id='room-code'
            placeholder='ABCD12'
            value={formState.roomCode}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, roomCode: event.target.value.toUpperCase() }))
            }
            maxLength={8}
            className='pl-8 uppercase tracking-widest font-mono text-base'
            autoFocus={props.initialRoomCode === null}
            autoComplete='off'
          />
        </div>
      </Field>

      <Field>
        <Label htmlFor='nickname'>Nickname</Label>
        <div className='relative'>
          <UserIcon className='absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none' />
          <Input
            id='nickname'
            placeholder='Player123'
            value={formState.nickname}
            onChange={(event) =>
              setFormState((prev) => ({ ...prev, nickname: event.target.value }))
            }
            maxLength={30}
            className='pl-8'
            autoFocus={props.initialRoomCode !== null}
            autoComplete='off'
          />
        </div>
      </Field>

      <Button
        type='submit'
        size='lg'
        className='w-full mt-2'
        loading={mutation.isPending}
        disabled={!isFormValid}
      >
        Join Game
        <ArrowRightIcon />
      </Button>
    </form>
  );
};
