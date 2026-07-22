import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import { InfoIcon } from 'lucide-react';
import * as React from 'react';
import type { Quiz } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage, runProgram } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import {
  Button,
  Card,
  CardContent,
  Label,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import { type CreateRoomInput, createRoom } from './api/createRoom';
import { isGameErrorRecoverable } from './api/isGameErrorRecoverable';

const createRoomProgram = (input: CreateRoomInput) =>
  createRoom(input).pipe(
    Effect.retry({
      while: isGameErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.intersect(Schedule.recurs(3)),
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
          title: 'Failed to start game',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

type SettingRowProps = {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly checked: boolean;
  readonly onCheckedChange: (checked: boolean) => void;
};

const SettingRow = (props: SettingRowProps) => (
  <div className='grid grid-cols-[auto_1fr_auto] items-center gap-2 py-4 px-4 not-last:border-b'>
    <Tooltip>
      <TooltipTrigger asChild>
        <InfoIcon className='size-4' />
      </TooltipTrigger>
      <TooltipContent>
        <p>{props.description}</p>
      </TooltipContent>
    </Tooltip>
    <Label htmlFor={props.id} className='font-medium cursor-pointer'>
      {props.label}
    </Label>

    <Switch id={props.id} checked={props.checked} onCheckedChange={props.onCheckedChange} />
  </div>
);

type Props = {
  readonly quiz: Quiz;
};

type FormState = {
  readonly randomizeQuestions: boolean;
  readonly randomizeAnswers: boolean;
  readonly showImmediateFeedback: boolean;
  readonly publicResults: boolean;
};

export const GameSetupForm = (props: Props) => {
  const quiz = props.quiz;
  const navigate = useNavigate();

  const [formState, setFormState] = React.useState<FormState>(() => ({
    randomizeQuestions: false,
    randomizeAnswers: false,
    showImmediateFeedback: true,
    publicResults: true,
  }));

  const startGame = useMutation({
    mutationFn: () => {
      const input: CreateRoomInput = {
        quizId: quiz.quizId,
        randomizeQuestions: formState.randomizeQuestions,
        randomizeAnswers: formState.randomizeAnswers,
        showImmediateFeedback: formState.showImmediateFeedback,
        publicResults: formState.publicResults,
      };

      return createRoomProgram(input).pipe(Effect.provide(applicationLayer), runProgram);
    },
    onSuccess: (room) => {
      navigate({ to: '/host/$roomCode', params: { roomCode: room.roomCode } });
    },
  });

  return (
    <div className='flex flex-col gap-6 max-w-lg w-full mx-auto'>
      <div>
        <h1 className='text-3xl font-bold'>
          Start the
          <span className='text-primary ml-[0.25ch]'>{quiz.title}</span>
        </h1>
        <p className='text-muted-foreground mt-1'>
          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
        </p>
      </div>

      <Card className='gap-0 p-0'>
        <CardContent className='p-0'>
          <SettingRow
            id='randomize-questions'
            label='Shuffle Questions'
            description='Present questions in a random order for each game'
            checked={formState.randomizeQuestions}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, randomizeQuestions: checked }))
            }
          />

          <SettingRow
            id='randomize-answers'
            label='Shuffle Answers'
            description='Randomize the order of answer choices for each question'
            checked={formState.randomizeAnswers}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, randomizeAnswers: checked }))
            }
          />

          <SettingRow
            id='immediate-feedback'
            label='Immediate Feedback'
            description='Show players whether their answer was correct right after they submit'
            checked={formState.showImmediateFeedback}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, showImmediateFeedback: checked }))
            }
          />

          <SettingRow
            id='public-results'
            label='Public Results'
            description='Show the full final leaderboard to every player; when off, each player sees only their own result'
            checked={formState.publicResults}
            onCheckedChange={(checked) =>
              setFormState((prev) => ({ ...prev, publicResults: checked }))
            }
          />
        </CardContent>
      </Card>

      <Button
        size='lg'
        loading={startGame.isPending}
        onClick={() => startGame.mutate()}
        className='w-full'
      >
        Start Game
      </Button>
    </div>
  );
};
