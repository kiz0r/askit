import type { WsQuestion } from '@/entities/game';
import { CircularTimer } from './CircularTimer';

type Props = {
  readonly question: WsQuestion;
  readonly timeLeft: number;
  readonly totalSeconds: number;
  readonly isAnswered: boolean;
};

export const QuestionCard = (props: Props) => {
  const question = props.question;
  const timeLeft = props.timeLeft;
  const totalSeconds = props.totalSeconds;

  return (
    <div
      key={question.questionId}
      className='animate-pop-in w-full max-w-2xl flex items-center gap-6 rounded-2xl p-7 bg-white/3 border border-white/8'
    >
      <CircularTimer
        timeLeft={timeLeft}
        totalSeconds={totalSeconds}
        isAnswered={props.isAnswered}
      />
      <div className='flex flex-col gap-1 min-w-0'>
        <p className='text-xs font-medium uppercase tracking-widest text-white/40'>
          Question {question.questionIndex}
        </p>
        <h2 className='text-xl font-bold leading-snug tracking-tight text-white'>
          {question.text}
        </h2>
        {question.allowMultipleAnswers ? (
          <p className='text-xs mt-0.5 text-white/40'>Select all that apply</p>
        ) : null}
      </div>
    </div>
  );
};
