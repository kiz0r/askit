import { createRouter, RouterProvider } from '@tanstack/react-router';
import ReactDOM from 'react-dom/client';
import { routeTree } from './routeTree.gen';
import './main.scss';

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    readonly router: typeof router;
  }
}

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(<RouterProvider router={router} />);
