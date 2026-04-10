import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Home from '../pages/home/Home';
import { AuthWrapper } from '../components';
import KanbanPage from '../pages/kanban/Kanban';
import DashboardPage from '../pages/dashboard/Dashboard';
import ProfilePage from '../pages/profile/Profile';
import MyTasksPage from '../pages/tasks/MyTasks';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AuthWrapper>
        <Home />
      </AuthWrapper>
    ),
    children: [
      {
        index: true,
        element: <MyTasksPage />,
      },
      {
        path: 'kanban',
        element: <KanbanPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
]);
