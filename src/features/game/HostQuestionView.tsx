import { CheckCircle2Icon, XCircleIcon } from 'lucide-react';
import type {
  HostAnswerDetail,
  PlayerId,
  WsPlayer,
  WsQuestion,
  WsQuestionEnded,
} from '@/entities/game';
import { cn } from '@/shared/utils';
import { getAnswerLabel } from './getAnswerLabel';
import { QuestionCard } from './QuestionCard';
import { QUESTION_ANSWER_STYLES } from './questionAnswerStyles';
import { useQuestionTimer } from './useQuestionTimer';

function answerDetailsToMap(
  details: readonly HostAnswerDetail[]
): ReadonlyMap<PlayerId, HostAnswerDetail> {
  return new Map(details.map((detail) => [detail.playerId, detail] as const));
}

type Props = {
  readonly question: WsQuestion;
  readonly players: readonly WsPlayer[];
  readonly answeredPlayerIds: readonly PlayerId[];
  readonly hostAnswerDetails: readonly HostAnswerDetail[];
  readonly questionEnded: WsQuestionEnded | null;
  readonly onNextQuestion: (() => void) | null;
};

export const HostQuestionView = (props: Props) => {
  const question = props.question;
  const players = props.players;
  const answeredPlayerIds = props.answeredPlayerIds;
  const hostAnswerDetails = props.hostAnswerDetails;
  const questionEnded = props.questionEnded;
  const onNextQuestion = props.onNextQuestion;

  const questionTimer = useQuestionTimer(question);
  const answerDetails = answerDetailsToMap(hostAnswerDetails);
  const answeredCount = answeredPlayerIds.length;
  const playersCount = players.length;

  const correctIds = questionEnded ? new Set(questionEnded.correctAnswerIds) : null;
  const totalVotes = questionEnded
    ? Object.values(questionEnded.answerDistribution).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className='flex flex-col grow'>
      <div className='flex-1 flex flex-col items-center gap-3 px-4 py-6'>
        <QuestionCard
          question={question}
          timeLeft={questionTimer.timeLeft}
          totalSeconds={questionTimer.totalSeconds}
          isAnswered={false}
        />

        <p className='text-xs text-white/40 -mt-1'>
          100–1000 pts per correct answer · faster = more points
        </p>

        <div
          key={`${question.questionId}-options`}
          className='w-full max-w-2xl grid grid-cols-2 gap-2.5'
        >
          {question.answers.map((answer, index) => {
            const styles = QUESTION_ANSWER_STYLES[index % QUESTION_ANSWER_STYLES.length];
            const isCorrect = correctIds?.has(answer.answerId) ?? false;
            const voteCount = questionEnded?.answerDistribution[answer.answerId] ?? 0;
            const votePct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

            return (
              <div
                key={answer.answerId}
                className={cn(
                  'animate-pop-in flex flex-col gap-1 rounded-xl border-2 p-[14px_20px]',
                  questionEnded
                    ? isCorrect
                      ? 'bg-green-500/13 border-green-500'
                      : 'bg-white/1 border-white/5 opacity-60'
                    : styles.idle
                )}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className='flex items-center gap-3.5'>
                  <span
                    className={cn(
                      'shrink-0 size-8 rounded-lg flex items-center justify-center text-sm font-bold',
                      questionEnded && isCorrect ? 'bg-green-500 text-white' : styles.badge
                    )}
                  >
                    {questionEnded && isCorrect ? '✓' : getAnswerLabel(index)}
                  </span>
                  <span className='font-medium text-sm text-white'>{answer.text}</span>
                </div>
                {questionEnded ? (
                  <div className='flex items-center gap-2 mt-1'>
                    <div className='flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden'>
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          isCorrect ? 'bg-green-500' : 'bg-white/30'
                        )}
                        style={{ width: `${votePct}%` }}
                      />
                    </div>
                    <span className='text-xs text-white/50 tabular-nums'>
                      {voteCount} ({votePct}%)
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {!questionEnded ? (
          <div className='w-full max-w-2xl flex flex-col gap-2 mt-2'>
            <div className='flex items-center justify-between text-xs text-white/40'>
              <span>Players answered</span>
              <span className='tabular-nums font-medium text-white'>
                {answeredCount} / {playersCount}
              </span>
            </div>
            <div className='h-2 rounded-full bg-white/8 overflow-hidden'>
              <div
                className='h-full bg-violet-700 rounded-full transition-all duration-300'
                style={{
                  width: playersCount > 0 ? `${(answeredCount / playersCount) * 100}%` : '0%',
                }}
              />
            </div>
          </div>
        ) : null}

        {players.length > 0 ? (
          <div className='w-full max-w-2xl grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2'>
            {players.map((player) => {
              const detail = answerDetails.get(player.playerId);
              const isCorrect = detail?.isCorrect === true;
              const isWrong = detail?.isCorrect === false;

              return (
                <div
                  key={player.playerId}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs font-medium truncate',
                    detail === undefined && 'bg-white/3 border-white/8 text-white/40',
                    isCorrect && 'bg-green-500/10 border-green-500/30 text-green-400',
                    isWrong && 'bg-red-500/10 border-red-500/30 text-red-400'
                  )}
                >
                  {isCorrect ? <CheckCircle2Icon className='size-3 shrink-0' /> : null}
                  {isWrong ? <XCircleIcon className='size-3 shrink-0' /> : null}
                  <span className='truncate'>{player.nickname}</span>
                  {detail?.totalScore !== undefined ? (
                    <span className='ml-auto tabular-nums text-white/50 shrink-0'>
                      {detail.totalScore}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        {questionEnded && questionEnded.leaderboard.length > 0 ? (
          <div className='w-full max-w-2xl mt-2'>
            <p className='text-xs text-white/40 mb-2'>Leaderboard</p>
            <div className='flex flex-col gap-1'>
              {questionEnded.leaderboard.map((entry) => (
                <div
                  key={entry.playerId}
                  className='flex items-center gap-3 px-3 py-2 rounded-lg bg-white/3 border border-white/8'
                >
                  <span className='text-xs font-bold text-white/40 w-5 text-center'>
                    {entry.rank}
                  </span>
                  <span className='flex-1 text-sm font-medium text-white truncate'>
                    {entry.nickname}
                  </span>
                  <span className='text-sm font-bold tabular-nums text-violet-400'>
                    {entry.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {onNextQuestion !== null ? (
          <button
            type='button'
            onClick={onNextQuestion}
            className='mt-4 px-8 py-3 rounded-xl font-semibold text-sm text-white bg-violet-700 hover:bg-violet-800 transition-colors'
          >
            {questionEnded ? 'Next Question' : 'End Question'}
          </button>
        ) : null}
      </div>
    </div>
  );
};
