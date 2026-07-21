import { Link } from '@tanstack/react-router';
import { Button } from '@/shared/ui';

export const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen gap-6 px-4'>
      <h1 className='text-4xl font-bold'>The page you are looking for does not exist.</h1>
      <div className='flex gap-4'>
        <Button asChild>
          <Link to='/quizzes'>Dashboard</Link>
        </Button>
        <Button variant='outline' asChild>
          <Link to='/'>Home</Link>
        </Button>
      </div>
    </div>
  );
};
