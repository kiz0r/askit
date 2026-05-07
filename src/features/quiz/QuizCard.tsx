import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { DateTime, Duration, Effect } from 'effect';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  Calendar,
  ChevronLeft,
  Clock,
  Heart,
  HelpCircle,
  Pencil,
  Play,
  Trash2,
  Users,
} from 'lucide-react';
import * as React from 'react';
import { queryClient } from '@/app/providers/QueryClientProvider';
import { favoriteQuizIdsAtom, type Quiz, type QuizId } from '@/entities/quiz';
import { SessionExpiredError, withStandardErrors } from '@/shared/api';
import { applicationLayer } from '@/shared/settings';
import { toast } from '@/shared/toasts';
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
import { cn, formatDateHumanFriendly, stringFilter } from '@/shared/utils';
import { addFavorite } from './api/addFavorite';
import { deleteQuiz } from './api/deleteQuiz';
import { removeFavorite } from './api/removeFavorite';

const deleteQuizProgram = (quizId: QuizId) =>
  deleteQuiz(quizId).pipe(
    withStandardErrors({ action: 'delete a quiz', fallback: null }),
    Effect.catchTags({
      QuizAccessDeniedError: toast.handle('error', {
        title: 'Access denied',
        description: 'You do not have permission to delete this quiz.',
        fallback: null,
      }),
      QuizNotFoundError: toast.handle('error', {
        title: 'Quiz not found',
        description: 'The quiz you are trying to delete does not exist.',
        fallback: null,
      }),
    }),
    Effect.tap((result) => {
      if (result == null) {
        return;
      }

      toast.success({
        title: 'Quiz deleted',
        description: 'The quiz has been deleted successfully.',
      });
    }),
    Effect.ensureErrorType<SessionExpiredError>()
  );

function renderRelativeDateLabel(
  updatedAt: DateTime.DateTime,
  createdAt: DateTime.DateTime
): {
  readonly label: string;
  readonly isUpdated: boolean;
} {
  const isEqual = DateTime.Equivalence(updatedAt, createdAt);
  if (isEqual) {
    return {
      label: formatDateHumanFriendly(createdAt, { excludeSeconds: true }),
      isUpdated: false,
    };
  }

  return {
    label: formatDateHumanFriendly(updatedAt, { excludeSeconds: true }),
    isUpdated: true,
  };
}

function formatDuration(duration: Duration.Duration): string {
  const minutes = Duration.toMinutes(duration);
  if (minutes < 1) {
    return '<1 min';
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

type Props = {
  readonly quiz: Quiz;
  readonly searchQuery?: string;
};

export const QuizCard = React.memo((props: Props) => {
  const [isActionsExpanded, setIsActionsExpanded] = React.useState(false);

  const quiz = props.quiz;
  const favoritedIds = useAtomValue(favoriteQuizIdsAtom);
  const setFavoritedIds = useSetAtom(favoriteQuizIdsAtom);
  const isFavorited = favoritedIds.has(quiz.quizId);
  const quizSettings = quiz.settings;
  const searchQuery = props.searchQuery ?? '';
  const dateInfo = renderRelativeDateLabel(quiz.updatedAt, quiz.createdAt);
  const estimatedTime = formatDuration(quiz.estimatedTime);

  const toggleFavorite = useMutation({
    mutationKey: ['toggleFavorite', quiz.quizId] as const,
    mutationFn: (quizId: QuizId) => {
      const action = isFavorited ? removeFavorite : addFavorite;
      return action(quizId).pipe(Effect.provide(applicationLayer), Effect.runPromise);
    },
    onMutate: (quizId) => {
      setFavoritedIds((prev: ReadonlySet<QuizId>) => {
        const next = new Set<QuizId>(prev);
        if (isFavorited) {
          next.delete(quizId);
        } else {
          next.add(quizId);
        }
        return next;
      });
    },
    onError: () => {
      setFavoritedIds((prev: ReadonlySet<QuizId>) => {
        const next = new Set<QuizId>(prev);
        if (isFavorited) {
          next.add(quiz.quizId);
        } else {
          next.delete(quiz.quizId);
        }
        return next;
      });
      toast.error({ title: 'Failed to update favorites' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] as const });
    },
  });

  const deleteQuiz = useMutation({
    mutationKey: ['deleteQuiz'] as const,
    mutationFn: (quizId: QuizId) =>
      deleteQuizProgram(quizId).pipe(
        Effect.provide(applicationLayer),
        Effect.ensureRequirementsType<never>(),
        Effect.ensureErrorType<SessionExpiredError>(),
        Effect.runPromise
      ),
    onSettled: (result) => {
      if (result == null) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ['quizzes'] as const,
      });
    },
  });

  return (
    <Card className='group flex flex-col h-full hover:shadow-md transition-shadow duration-200'>
      <CardHeader className='pb-3'>
        <div className='flex justify-between items-start gap-2'>
          <CardTitle className='line-clamp-2 leading-tight'>
            {stringFilter.highlight(quiz.title, searchQuery)}
          </CardTitle>
          <Badge
            className='shrink-0 select-none rounded-md font-medium text-xs uppercase tracking-wide'
            variant={quizSettings.visibility === 'public' ? 'default' : 'secondary'}
          >
            {quizSettings.visibility}
          </Badge>
        </div>

        {quiz.description !== null && quiz.description.length > 0 ? (
          <CardDescription className='line-clamp-2 text-sm text-muted-foreground mt-1.5'>
            {stringFilter.highlight(quiz.description, searchQuery)}
          </CardDescription>
        ) : null}

        <TagList tags={quiz.tags} maxVisible={4} className='mt-3' />
      </CardHeader>

      <CardContent className='flex-1 pt-0 pb-3'>
        <div className='grid grid-cols-2 gap-3 text-sm text-muted-foreground'>
          <div className='flex items-center gap-1.5'>
            <HelpCircle className='size-4 shrink-0' />
            <span>
              {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
            </span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Clock className='size-4 shrink-0' />
            <span>{estimatedTime}</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <Users className='size-4 shrink-0' />
            <span>Max {quizSettings.maxParticipants}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className='flex items-center gap-1.5 cursor-default'>
                <Calendar className='size-4 shrink-0' />
                <span className='truncate'>{dateInfo.label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>{dateInfo.isUpdated ? 'Last updated' : 'Created'}</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>

      <CardFooter className='flex items-center justify-between gap-2 pt-3 border-t'>
        <div className='flex items-center p-px bg-muted/30 border rounded-lg'>
          <Button
            size='icon-sm'
            variant='ghost'
            className='rounded-md'
            onClick={() => setIsActionsExpanded((prev) => !prev)}
          >
            <ChevronLeft
              className={cn('size-4 transition-transform duration-200', {
                'rotate-180': isActionsExpanded,
              })}
            />
          </Button>

          <div
            className={cn('flex items-center gap-1 overflow-hidden transition-all duration-200', {
              'max-w-32 opacity-100 ml-1': isActionsExpanded,
              'max-w-0 opacity-0': !isActionsExpanded,
            })}
          >
            <Button size='icon-sm' variant='ghost' className='rounded-md' asChild>
              <Link to='/quiz/edit/$quizId' params={{ quizId: quiz.quizId }}>
                <Pencil className='size-4' />
              </Link>
            </Button>

            <Button
              size='icon-sm'
              variant='ghost'
              className='rounded-md'
              disabled={toggleFavorite.isPending}
              onClick={() => toggleFavorite.mutate(quiz.quizId)}
            >
              <Heart className={cn('size-4', isFavorited && 'fill-rose-500 text-rose-500')} />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant='ghost'
                  size='icon-sm'
                  className='rounded-md text-destructive hover:text-destructive hover:bg-destructive/10'
                  disabled={deleteQuiz.isPending}
                >
                  <Trash2 className='size-4' />
                </Button>
              </PopoverTrigger>

              <PopoverContent className='w-72'>
                <PopoverHeader>
                  <PopoverTitle>Delete Quiz</PopoverTitle>
                  <PopoverDescription>
                    Are you sure you want to delete this quiz? This action cannot be undone.
                  </PopoverDescription>
                </PopoverHeader>

                <Button
                  className='w-full mt-3'
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
          </div>
        </div>

        <Button disabled>
          <Play className='size-4' />
          Play
        </Button>
      </CardFooter>
    </Card>
  );
});
