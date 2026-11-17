
import { Link, Outlet, useNavigate } from "react-router-dom";

export default function AppLayout() {
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link to="/quizzes" className="text-xl font-bold">
            Quiz Credit
          </Link>

          <div className="flex items-center gap-5">
            <Link to="/quizzes">Quizzes</Link>
            <Link to="/wallet">Wallet</Link>
            <Link to="/attempts">History</Link>

            {role === "ADMIN" && (
              <Link to="/admin">Admin</Link>
            )}

            <button
              onClick={logout}
              className="rounded bg-slate-900 px-4 py-2 text-white"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
