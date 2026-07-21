import * as React from 'react';
import type { WsAnswerResult, WsQuestion, WsQuestionEnded } from '@/entities/game';
import type { QuizAnswerId, QuizQuestionId } from '@/entities/quiz';
import { cn } from '@/shared/utils';
import { getAnswerLabel } from './getAnswerLabel';
import { QuestionCard } from './QuestionCard';
import { QUESTION_ANSWER_STYLES } from './questionAnswerStyles';
import { useQuestionTimer } from './useQuestionTimer';

type Props = {
  readonly question: WsQuestion;
  readonly hasAnswered: boolean;
  readonly answerResult: WsAnswerResult | null;
  readonly questionEnded: WsQuestionEnded | null;
  readonly onAnswer: (questionId: QuizQuestionId, answerIds: readonly QuizAnswerId[]) => void;
};

type AnswerVisualState = {
  readonly isRevealed: boolean;
  readonly isCorrect: boolean;
  readonly isWrong: boolean;
  readonly isSelected: boolean;
  readonly styles: (typeof QUESTION_ANSWER_STYLES)[number];
};

function getAnswerCardClass(state: AnswerVisualState): string {
  if (!state.isRevealed) {
    return state.isSelected ? state.styles.selected : state.styles.idle;
  }

  if (state.isCorrect) {
    return 'bg-green-500/13 border-green-500';
  }

  if (state.isWrong) {
    return 'bg-red-500/9 border-red-500/55';
  }

  return 'bg-white/1 border-white/5 opacity-35';
}

function getAnswerBadgeClass(state: AnswerVisualState): string {
  if (state.isRevealed && state.isCorrect) {
    return 'bg-green-500 text-white';
  }

  if (state.isRevealed && state.isWrong) {
    return 'bg-red-500 text-white';
  }

  return state.styles.badge;
}

function getAnswerSymbol(state: AnswerVisualState, index: number): string {
  if (state.isRevealed && state.isCorrect) {
    return '✓';
  }

  if (state.isRevealed && state.isWrong) {
    return '✕';
  }

  return getAnswerLabel(index);
}

export const QuestionView = (props: Props) => {
  const question = props.question;
  const hasAnswered = props.hasAnswered;
  const answerResult = props.answerResult;
  const questionEnded = props.questionEnded;
  const onAnswer = props.onAnswer;
  const { timeLeft, totalSeconds } = useQuestionTimer(question);
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<QuizAnswerId>>(new Set());

  const correctIds = answerResult?.correctAnswerIds
    ? new Set(answerResult.correctAnswerIds)
    : questionEnded?.correctAnswerIds
      ? new Set(questionEnded.correctAnswerIds)
      : null;

  const handleToggle = (answerId: QuizAnswerId) => {
    if (hasAnswered || questionEnded !== null) {
      return;
    }

    if (!question.allowMultipleAnswers) {
      onAnswer(question.questionId, [answerId]);
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(answerId)) {
        next.delete(answerId);
      } else {
        next.add(answerId);
      }
      return next;
    });
  };

  return (
    <div className='flex flex-col grow'>
      <div className='flex-1 flex flex-col items-center gap-3 px-4 py-6'>
        <QuestionCard
          question={question}
          timeLeft={timeLeft}
          totalSeconds={totalSeconds}
          isAnswered={hasAnswered}
        />

        <div
          key={`${question.questionId}-opts`}
          className='w-full max-w-2xl grid grid-cols-2 gap-2.5'
        >
          {question.answers.map((answer, index) => {
            const styles = QUESTION_ANSWER_STYLES[index % QUESTION_ANSWER_STYLES.length];
            const isSelected = selectedIds.has(answer.answerId);
            const isRevealed = (hasAnswered && correctIds !== null) || questionEnded !== null;
            const isCorrect = correctIds?.has(answer.answerId) ?? false;
            const isWrong = isRevealed && isSelected && !isCorrect;
            const isDimmed = isRevealed && !isSelected && !isCorrect;

            const visualState = { isRevealed, isCorrect, isWrong, isSelected, styles };
            const stateClass = getAnswerCardClass(visualState);

            return (
              <button
                key={answer.answerId}
                type='button'
                disabled={hasAnswered || questionEnded !== null}
                onClick={() => handleToggle(answer.answerId)}
                className={cn(
                  'animate-pop-in flex items-center gap-3.5 rounded-xl text-left border-2 p-[14px_20px] transition-all duration-200',
                  stateClass,
                  isWrong && 'animate-[shake_0.4s_ease]'
                )}
                style={{ animationDelay: !isWrong ? `${index * 60}ms` : undefined }}
              >
                <span
                  className={cn(
                    'shrink-0 size-8 rounded-lg flex items-center justify-center text-sm font-bold',
                    getAnswerBadgeClass(visualState)
                  )}
                >
                  {getAnswerSymbol(visualState, index)}
                </span>
                <span
                  className={cn('font-medium text-sm', isDimmed ? 'text-white/20' : 'text-white')}
                >
                  {answer.text}
                </span>
              </button>
            );
          })}
        </div>

        {question.allowMultipleAnswers && !hasAnswered && selectedIds.size > 0 ? (
          <button
            type='button'
            onClick={() => onAnswer(question.questionId, [...selectedIds])}
            className='mt-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white bg-violet-800 hover:bg-violet-900 transition-colors'
          >
            Submit {selectedIds.size > 1 ? 'answers' : 'answer'}
          </button>
        ) : null}

        {hasAnswered && answerResult === null ? (
          <p className='text-sm mt-2 text-white/35'>Answer submitted — waiting for others…</p>
        ) : null}
      </div>

      {hasAnswered && answerResult !== null && questionEnded === null ? (
        <div className='animate-fade-overlay fixed inset-0 z-20 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md'>
          <div className='animate-pop-in flex flex-col items-center gap-5 text-center'>
            <div
              className={cn(
                'size-20 rounded-full flex items-center justify-center text-3xl border-[3px]',
                answerResult.isCorrect
                  ? 'bg-green-500/13 border-green-500 text-green-500'
                  : 'bg-red-500/13 border-red-500 text-red-500'
              )}
            >
              {answerResult.isCorrect ? '✓' : '✕'}
            </div>
            <div className='flex flex-col gap-2'>
              <p
                className={cn(
                  'text-3xl font-black',
                  answerResult.isCorrect ? 'text-green-500' : 'text-red-500'
                )}
              >
                {answerResult.isCorrect ? 'Correct!' : 'Not quite'}
              </p>
              {answerResult.isCorrect ? (
                <div className='px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-center'>
                  <p className='text-xs text-white/40 mb-0.5'>Points earned</p>
                  <p className='text-2xl font-black text-violet-400'>
                    +{answerResult.pointsEarned}
                  </p>
                </div>
              ) : null}
            </div>
            <p className='text-xs text-white/25'>Waiting for question to end…</p>
          </div>
        </div>
      ) : null}
    </div>
  );
};
