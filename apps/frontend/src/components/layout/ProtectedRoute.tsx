
import { Navigate, Outlet, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  adminOnly?: boolean;
};

export default function ProtectedRoute({
  adminOnly = false,
}: ProtectedRouteProps) {
  const location = useLocation();

  const token = localStorage.getItem("accessToken");
  const role = localStorage.getItem("role");

  if (!token) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  if (adminOnly && role !== "ADMIN") {
    return <Navigate to="/quizzes" replace />;
  }

  return <Outlet />;
}
