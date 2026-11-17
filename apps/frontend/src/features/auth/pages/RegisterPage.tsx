
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { register, saveSession } from "../auth.api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { token, user } = await register(name, email, password);

      saveSession(token, user);

      navigate("/quizzes", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Registration failed");
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
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-2 text-slate-500">
            Get 500 free credits when you register
          </p>
        </div>

        {error && (
          <p className="rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full name"
          aria-label="Full name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="email"
          placeholder="Email"
          aria-label="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <input
          type="password"
          placeholder="Password"
          aria-label="Password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border p-3"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 p-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-600">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
