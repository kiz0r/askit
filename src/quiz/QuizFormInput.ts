import type { QuizVisibility } from './Quiz';

/**
 * Input type for quiz creation and editing forms.
 * It represents the structure of the form data used to create or edit a quiz.
 */
export type QuizFormInput = {
  readonly title: string;
  readonly description: string;
  readonly settings: {
    readonly randomizeQuestions: boolean;
    readonly randomizeAnswers: boolean;
    readonly showImmediateFeedback: boolean;
    readonly timePerQuestion: number;
    readonly visibility: QuizVisibility;
    readonly maxParticipants: number;
  };
  readonly questions: readonly {
    readonly text: string;
    readonly answers: readonly {
      readonly text: string;
      readonly isCorrect: boolean;
    }[];
  }[];
};
