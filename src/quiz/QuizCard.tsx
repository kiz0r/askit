import {
  DotsVerticalIcon,
  LockClosedIcon,
  Pencil1Icon,
  PlayIcon,
  Share2Icon,
  TrashIcon,
} from '@radix-ui/react-icons';
import {
  Badge,
  Button,
  Card,
  Heading,
  IconButton,
  Popover,
  Separator,
  Text,
} from '@radix-ui/themes';
import { Link as RouterLink } from '@tanstack/react-router';
import { DateTime, Duration } from 'effect';
import React from 'react';
import { formatDateHumanFriendly } from '../utils/formatDateHumanFriendly';
import { stringFilter } from '../utils/stringFilter';
import type { Quiz } from './Quiz';
import styles from './QuizCard.module.scss';
import { useDeleteQuiz } from './useDeleteQuiz';

function renderRelativeDateLabel(
  updatedAt: DateTime.DateTime,
  createdAt: DateTime.DateTime
): string {
  const isEqual = DateTime.Equivalence(updatedAt, createdAt);

  if (isEqual) {
    return `Created: ${formatDateHumanFriendly(createdAt, { excludeSeconds: true })}`;
  }

  return `Updated: ${formatDateHumanFriendly(updatedAt, { excludeSeconds: true })}`;
}

function renderQuestionsCount(count: number): string {
  if (count === 1) {
    return '1 question';
  }

  return `${count} questions`;
}

type Props = {
  readonly quiz: Quiz;
  readonly searchQuery?: string;
};

export const QuizCard = React.memo((props: Props) => {
  const quiz = props.quiz;
  const searchQuery = props.searchQuery ?? '';

  const estimatedQuizTime = Duration.toMinutes(quiz.estimatedTime).toFixed(2);

  const quizSettings = quiz.settings;

  const deleteQuiz = useDeleteQuiz();

  return (
    <Card className={styles.QuizCard}>
      <div className={styles.QuizCard__TopBar}>
        <div className={styles.QuizCard__Header}>
          <Heading as='h4' size='3'>
            {stringFilter.highlight(quiz.title, searchQuery)}
          </Heading>

          <Badge
            className={styles.QuizCard__VisibilityTag}
            variant={quizSettings.visibility === 'public' ? 'surface' : 'soft'}
          >
            {quizSettings.visibility === 'private' ? <LockClosedIcon /> : null}
            {quizSettings.visibility}
          </Badge>
        </div>

        {quiz.description !== null ? (
          <Text size='2'>{stringFilter.highlight(quiz.description, searchQuery)}</Text>
        ) : null}
      </div>

      <div className={styles.QuizCard__Content}>
        <div className={styles.QuizCard__Info}>
          <Text size='1' color='gray'>
            {renderQuestionsCount(quiz.questions.length)}
          </Text>

          <Separator orientation='vertical' size='1' />

          <Text size='1' color='gray'>
            {renderRelativeDateLabel(quiz.updatedAt, quiz.createdAt)}
          </Text>

          <Text size='1' color='gray'>
            ~{estimatedQuizTime}mins
          </Text>
        </div>

        <div className={styles.QuizCard__Actions}>
          <Button variant='surface' color='green' size='1' disabled>
            Play <PlayIcon />
          </Button>

          <Popover.Root>
            <Popover.Trigger>
              <IconButton variant='surface' size='1'>
                <DotsVerticalIcon />
              </IconButton>
            </Popover.Trigger>

            <Popover.Content side='bottom' className={styles.QuizCard__ActionsPopover}>
              <Button
                variant='surface'
                size='1'
                className={styles.QuizCard__ActionsPopoverButton}
                disabled
              >
                <Share2Icon />
                Share
              </Button>

              <Button
                variant='surface'
                size='1'
                asChild
                className={styles.QuizCard__ActionsPopoverButton}
              >
                <RouterLink to='/quiz/edit/$quizId' params={{ quizId: quiz.quizId }}>
                  <Pencil1Icon />
                  Edit
                </RouterLink>
              </Button>

              <Popover.Root>
                <Popover.Trigger>
                  <Button
                    className={styles.QuizCard__ActionsPopoverButton}
                    variant='surface'
                    size='1'
                    color='red'
                    loading={deleteQuiz.isLoading}
                  >
                    <TrashIcon />
                    Delete
                  </Button>
                </Popover.Trigger>

                <Popover.Content
                  side='bottom'
                  align='end'
                  className={styles.QuizCard__DeletePopover}
                >
                  <div className={styles.QuizCard__DeletePopoverText}>
                    <Text weight='bold' size='2'>
                      Are you sure you want to delete this quiz?
                    </Text>
                    <Text size='1'>This action cannot be undone.</Text>
                  </div>
                  <div className={styles.QuizCard__DeletePopoverActions}>
                    <Popover.Close>
                      <Button variant='soft' color='gray' size='1'>
                        Cancel
                      </Button>
                    </Popover.Close>
                    <Button
                      size='1'
                      color='red'
                      loading={deleteQuiz.isLoading}
                      onClick={() => {
                        deleteQuiz.execute(quiz.quizId);
                      }}
                    >
                      Delete Quiz
                    </Button>
                  </div>
                </Popover.Content>
              </Popover.Root>
            </Popover.Content>
          </Popover.Root>
        </div>
      </div>
    </Card>
  );
});
