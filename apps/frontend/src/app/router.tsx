
import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";
import QuizListPage from "../features/quizzes/pages/QuizListPage";
import QuizDetailPage from "../features/quizzes/pages/QuizDetailPage";
import AttemptPage from "../features/attempts/pages/AttemptPage";
import AttemptHistoryPage from "../features/attempts/pages/AttemptHistoryPage";
import WalletPage from "../features/wallet/pages/WalletPage";
import AdminDashboardPage from "../features/admin/pages/AdminDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/quizzes", element: <QuizListPage /> },
          { path: "/quizzes/:quizId", element: <QuizDetailPage /> },
          { path: "/attempts", element: <AttemptHistoryPage /> },
          { path: "/attempts/:attemptId", element: <AttemptPage /> },
          { path: "/wallet", element: <WalletPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: "/admin", element: <AdminDashboardPage /> },
        ],
      },
    ],
  },
  {
    path: "/",
    element: <Navigate to="/quizzes" replace />,
  },
  {
    path: "*",
    element: <Navigate to="/quizzes" replace />,
  },
]);
