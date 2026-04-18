import * as React from 'react';
import { Github } from '@/shared/icons';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/ui';
import { makeGithubIssueUrl } from './makeGithubIssueUrl';

type Props = {
  readonly error: Error;
  readonly onReset: () => void;
};

export const ErrorBoundaryView = React.memo((props: Props) => {
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <Card className='w-full max-w-3xl'>
        <CardHeader>
          <CardTitle>Oops! Something went wrong.</CardTitle>
          <CardDescription>
            We're very sorry about this. Our team is working hard to prevent errors like this.
            Please bear with us. 😔
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col gap-2 border-t pt-4'>
          <p className='text-sm text-gray-500'>
            An unexpected error occurred while loading this page. This is not something you did
            wrong. It's a bug on our side.
          </p>
          <p className='text-sm text-gray-500'>Here's what you can try:</p>
          <ul className='text-sm text-gray-500 list-disc list-inside space-y-1'>
            <li>
              Click "<strong>Close</strong>" button or refresh the page
            </li>
            <li>Clear your browser cache if the problem persists</li>
            <li>Try again in a few moments</li>
          </ul>
          <p className='text-sm text-gray-600'>
            If the problem continues, please help us improve by reporting this issue on GitHub. Your
            feedback helps us fix bugs faster! 🙏
          </p>
        </CardContent>
        <CardFooter className='flex gap-2'>
          <Button onClick={props.onReset} className='grow'>
            Close
          </Button>
          <Button variant='outline' className='grow' asChild>
            <a href={makeGithubIssueUrl(props.error)} target='_blank' rel='noopener noreferrer'>
              <Github className='fill-current' />
              Report issue
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
});
