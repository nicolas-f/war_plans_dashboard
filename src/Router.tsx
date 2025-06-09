import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HomePage } from './pages/Home.page';

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    // Add other routes here...
  ],
  {
    basename: '/war_plans_dashboard', // Add basename here
  });

export function Router() {
  return <RouterProvider router={router} />;
}
