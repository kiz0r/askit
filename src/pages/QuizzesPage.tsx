import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { PlusIcon, UploadIcon } from 'lucide-react';
import { type Quiz, type QuizId, quizzesAtom } from '@/entities/quiz';
import { userAtom } from '@/entities/user';
import { QuizList, useImportQuiz, useQuizzesQuery } from '@/features/quiz';
import { Button } from '@/shared/ui';

const greetingMessages = [
  '👋',
  '👋🏻',
  'Ahoy',
  'Good to see you',
  'Greetings',
  'Greetings',
  'Hello',
  'Hey',
  'Hi there',
  'Howdy',
  'Salutations',
  'Welcome back',
  'Yo',
  "What's up",
] as const;

const sessionGreeting = greetingMessages[Math.floor(Math.random() * greetingMessages.length)];

function getPublishedQuizzesCount(quizzes: ReadonlyMap<QuizId, Quiz>): number {
  let count = 0;

  for (const [_quizId, quiz] of quizzes) {
    const isPublished = quiz.status === 'published';
    if (!isPublished) {
      continue;
    }

    count++;
  }

  return count;
}

export const QuizzesPage = () => {
  // Fetch quizzes
  useQuizzesQuery();

  const user = useAtomValue(userAtom);
  const quizzes = useAtomValue(quizzesAtom);
  const importQuiz = useImportQuiz();

  const publishedCount = getPublishedQuizzesCount(quizzes);

  return (
    <div className='flex flex-col gap-8 grow'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold'>
            {user !== null ? `${sessionGreeting}, ${user.username}` : 'My Quizzes'}
          </h1>

          <p className='text-muted-foreground mt-1'>
            {quizzes.size === 0
              ? 'Create your first quiz to get started.'
              : `${quizzes.size} ${quizzes.size === 1 ? 'quiz' : 'quizzes'} · ${publishedCount} published`}
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <input
            ref={importQuiz.fileInputRef}
            type='file'
            accept='.json'
            className='hidden'
            onChange={importQuiz.handleFileChange}
          />
          <Button
            variant='outline'
            disabled={importQuiz.isImporting}
            loading={importQuiz.isImporting}
            onClick={importQuiz.openFilePicker}
          >
            <UploadIcon className='size-4' />
            Import
          </Button>
          <Button asChild>
            <Link to='/quiz/new'>
              <PlusIcon className='size-4' />
              Create Quiz
            </Link>
          </Button>
        </div>
      </div>

      <QuizList />
    </div>
  );
};
