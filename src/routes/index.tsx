import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: () => (
    <div>
      <h1>Ask IT! Home Page</h1>
      <br />
      <br />
      <ul>
        <li>
          <Link to='/auth/login'>Login</Link>
        </li>
        <li>
          <Link to='/auth/register'>Register</Link>
        </li>
        <li>
          <Link to='/quizzes'>Dashboard</Link>
        </li>
      </ul>
    </div>
  ),
});
