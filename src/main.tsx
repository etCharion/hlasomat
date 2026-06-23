import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { AuthProvider } from './lib/auth';
import RequireAuth from './components/RequireAuth';
import JoinPage from './pages/JoinPage';
import StudentPage from './pages/StudentPage';
import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherConsole from './pages/TeacherConsole';
import ProjectorPage from './pages/ProjectorPage';
import NotFoundPage from './pages/NotFoundPage';

const router = createBrowserRouter([
  { path: '/', element: <JoinPage /> },
  { path: '/s/:pin', element: <StudentPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/teacher',
    element: (
      <RequireAuth>
        <TeacherDashboard />
      </RequireAuth>
    ),
  },
  {
    path: '/teacher/:sessionId',
    element: (
      <RequireAuth>
        <TeacherConsole />
      </RequireAuth>
    ),
  },
  { path: '/projector/:pin', element: <ProjectorPage /> },
  { path: '*', element: <NotFoundPage /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
