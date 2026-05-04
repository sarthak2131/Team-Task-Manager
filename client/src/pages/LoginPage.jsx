import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const featurePoints = [
  "JWT-based authentication with role-aware access",
  "Admin control over projects, tasks, and team membership",
  "Member-focused task tracking with overdue visibility"
];

export default function LoginPage() {
  const location = useLocation();
  const { token, user, saveSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token && user) {
    return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: form
      });

      saveSession(response.token, response.user);
      showToast({
        title: "Logged in",
        description: `Welcome back, ${response.user.name}.`
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Login failed",
        description: requestError.message
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-shell lg:grid-cols-[1.15fr_0.85fr]">
      <section className="hidden bg-[linear-gradient(145deg,rgba(15,118,110,0.95),rgba(20,20,35,0.98))] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Full-stack workspace</p>
          <h1 className="mt-6 max-w-2xl font-display text-6xl leading-tight">
            Run projects with clear ownership and visible task momentum.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
            Sign in to manage projects, assign work, track overdue items, and keep the team aligned from one place.
          </p>
        </div>

        <div className="space-y-4">
          {featurePoints.map((point) => (
            <div key={point} className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-4 text-sm text-slate-100">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form className="panel w-full max-w-lg p-8 sm:p-10" onSubmit={handleSubmit}>
          <p className="eyebrow">Welcome back</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Log in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Pick up where your team left off.</p>

          <div className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                required
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                className="input-field"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p> : null}

          <button type="submit" className="button-primary mt-8 w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-teal-700 hover:text-teal-800">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
