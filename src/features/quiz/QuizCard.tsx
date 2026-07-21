import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Effect, Schedule } from 'effect';
import { Fetch } from 'fx-fetch';
import {
  ClockIcon,
  DownloadIcon,
  EditIcon,
  GlobeIcon,
  HeartIcon,
  HelpCircleIcon,
  LockIcon,
  PlayIcon,
  Trash2Icon,
  UsersIcon,
} from 'lucide-react';
import type { Quiz, QuizId, QuizSettings } from '@/entities/quiz';
import { SessionExpiredError } from '@/entities/user';
import { getDescriptiveErrorMessage } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { Toast } from '@/shared/toasts';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  TagList,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui';
import { cn, downloadJson, formatDurationEstimate, stringFilter } from '@/shared/utils';
import { deleteQuiz } from './api/deleteQuiz';
import { exportQuiz } from './api/exportQuiz';
import { isQuizErrorRecoverable } from './api/isQuizErrorRecoverable';
import { toggleFavorite } from './api/toggleFavorite';

const toggleFavoriteProgram = (quizId: QuizId) =>
  toggleFavorite(quizId).pipe(
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to update favorites',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

const deleteQuizProgram = (quizId: QuizId) =>
  deleteQuiz(quizId).pipe(
    Effect.retry({
      while: isQuizErrorRecoverable,
      schedule: Schedule.exponential('250 millis').pipe(
        Schedule.union(Schedule.spaced('20 seconds')),
        Schedule.jittered
      ),
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Failed to delete quiz',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

const FILENAME_SANITISE_PATTERN = /[^a-z0-9]/gi;

type Props = {
  readonly quiz: Quiz;
  readonly searchQuery?: string;
};

function renderQuizVisibilityBadge(visibility: QuizSettings['visibility']) {
  const baseBadgeStyle =
    'shrink-0 flex items-center gap-1.5 select-none rounded-sm text-sm tracking-wide py-2.5';

  switch (visibility) {
    case 'public': {
      return (
        <Badge
          className={cn(
            baseBadgeStyle,
            'text-green-500 border-green-300 bg-green-300/30 dark:border-green-900 dark:bg-green-900/30'
          )}
        >
          <GlobeIcon /> Public
        </Badge>
      );
    }

    case 'private': {
      return (
        <Badge
          className={cn(
            baseBadgeStyle,
            'text-gray-500 border-gray-300 bg-gray-300/30 dark:border-gray-600 dark:bg-gray-600/10'
          )}
        >
          <LockIcon /> Private
        </Badge>
      );
    }

    default: {
      const _exhaustiveCheck: never = visibility;
      return null;
    }
  }
}

const exportQuizProgram = (quizId: QuizId, filename: string) =>
  exportQuiz(quizId).pipe(
    Effect.tap((data) => {
      if (data === null) {
        return Effect.void;
      }

      return downloadJson(filename, data).pipe(Effect.orDie);
    }),
    Effect.tapError((error) =>
      Effect.sync(() => {
        if (error instanceof Fetch.AbortError) {
          return;
        }

        if (error instanceof SessionExpiredError) {
          return;
        }

        Toast.danger({
          title: 'Export failed',
          description: getDescriptiveErrorMessage(error),
        });
      })
    )
  );

export const QuizCard = (props: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const quiz = props.quiz;
  const quizSettings = quiz.settings;
  const hasDescription = quiz.description !== null && quiz.description.length > 0;
  const searchQuery = props.searchQuery ?? '';
  const isDraft = quiz.status === 'draft';

  const estimatedTime = formatDurationEstimate(quiz.estimatedTime);

  const toggleFavorite = useMutation({
    mutationKey: ['toggleFavorite', quiz.quizId] as const,
    mutationFn: () =>
      toggleFavoriteProgram(quiz.quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] as const });
    },
  });

  const exportMutation = useMutation({
    mutationKey: ['exportQuiz', quiz.quizId] as const,
    mutationFn: () => {
      const filename = `${quiz.title.replace(FILENAME_SANITISE_PATTERN, '_').toLowerCase()}.json`;
      return exportQuizProgram(quiz.quizId, filename).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      );
    },
  });

  const deleteQuiz = useMutation({
    mutationKey: ['deleteQuiz'] as const,
    mutationFn: (quizId: QuizId) =>
      deleteQuizProgram(quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.runPromise
      ),
    onSuccess: () => {
      Toast.success({
        title: 'Quiz deleted',
        description: 'The quiz has been deleted successfully.',
      });

      queryClient.invalidateQueries({
        queryKey: ['quizzes'] as const,
      });
    },
  });

  return (
    <Card className='gap-0 hover:shadow-md transition-shadow duration-200'>
      <CardHeader>
        <div className='flex justify-between items-start gap-2'>
          <CardTitle className='line-clamp-2 leading-tight'>
            {stringFilter.highlight(quiz.title, searchQuery)}
          </CardTitle>

          {renderQuizVisibilityBadge(quizSettings.visibility)}
        </div>

        {hasDescription ? (
          <CardDescription className='line-clamp-2 text-muted-foreground'>
            {stringFilter.highlight(quiz.description, searchQuery)}
          </CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className='flex flex-col grow justify-end gap-4 py-4'>
        <TagList items={quiz.tags} maxVisible={4} />

        <div className='flex items-center gap-4 select-none text-muted-foreground font-medium'>
          <div className='flex items-center gap-1'>
            <HelpCircleIcon className='size-4' />
            <span>
              {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>

          <div className='flex items-center gap-1'>
            <ClockIcon className='size-4' />
            <span>{estimatedTime}</span>
          </div>

          <div className='flex items-center gap-1'>
            <UsersIcon className='size-4' />
            <span>Max {quizSettings.maxParticipants}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className='flex items-center justify-between bg-transparent border-t'>
        <div className='flex items-center gap-2'>
          <Button size='icon-sm' variant='outline' asChild>
            <Link
              to='/quiz/edit/$quizId'
              params={{ quizId: quiz.quizId }}
              aria-label='Edit quiz'
              title='Edit quiz'
            >
              <EditIcon className='size-4' />
            </Link>
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size='icon-sm'
                variant='outline'
                disabled={exportMutation.isPending}
                loading={exportMutation.isPending}
                onClick={() => exportMutation.mutate()}
              >
                <DownloadIcon className='size-4' />
              </Button>
            </TooltipTrigger>
            <TooltipContent side='top'>Export as JSON</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                size='icon-sm'
                variant='outline'
                disabled={deleteQuiz.isPending}
                aria-label='Delete quiz'
                title='Delete quiz'
              >
                <Trash2Icon className='size-4' />
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>Delete Quiz</PopoverTitle>
                <PopoverDescription>This action cannot be undone.</PopoverDescription>
              </PopoverHeader>

              <Button
                variant='destructive'
                size='sm'
                loading={deleteQuiz.isPending}
                disabled={deleteQuiz.isPending}
                onClick={() => {
                  deleteQuiz.mutate(quiz.quizId);
                }}
              >
                Delete Quiz
              </Button>
            </PopoverContent>
          </Popover>

          <Button
            variant='outline'
            size='icon-sm'
            disabled={toggleFavorite.isPending}
            onClick={() => toggleFavorite.mutate()}
            aria-label={quiz.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            title={quiz.isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon
              className={cn('size-4 transition-colors', {
                'fill-red-500 text-red-500': quiz.isFavorited,
              })}
            />
          </Button>
        </div>

        <div className='flex items-center gap-2'>
          {isDraft ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button disabled>
                    Play
                    <PlayIcon className='size-4' />
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent side='top'>Publish this quiz to play it</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              onClick={() =>
                navigate({ to: '/quiz/setup/$quizId', params: { quizId: quiz.quizId } })
              }
            >
              Play
              <PlayIcon className='size-4' />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
