
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { login, saveSession } from "../auth.api";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await login(email, password);

      saveSession(token, user);

      navigate(user.role === "ADMIN" ? "/admin" : "/quizzes", {
        replace: true,
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Login failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-500">
            Sign in to Quiz Credit Platform
          </p>
        </div>

        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600">
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}
