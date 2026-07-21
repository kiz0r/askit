import type { QuizAnswerId, QuizQuestionId } from '@/entities/quiz';

export type StartGameMessage = {
  readonly type: 'start_game';
};

export type NextQuestionMessage = {
  readonly type: 'next_question';
};

export type AnswerMessage = {
  readonly type: 'answer';
  readonly payload: {
    readonly questionId: QuizQuestionId;
    readonly answerIds: readonly QuizAnswerId[];
  };
};

export type ClientMessage = StartGameMessage | NextQuestionMessage | AnswerMessage;
