import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const featurePoints = ["Create projects", "Assign tasks", "Track delivery", "Manage overdue work"];

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
    <div className="grid min-h-screen bg-[#eed7f6] p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
      <section className="hidden rounded-[2rem] bg-white/70 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="font-display text-[2.5rem] text-[#171717]">Team Task Manager</p>
          <h1 className="mt-10 max-w-2xl text-[3.4rem] font-semibold leading-tight tracking-[-0.05em] text-[#1f2230]">
            Sign in to manage projects, tasks, and progress in one calm workspace.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-500">
            Sign in to manage projects, assign work, track overdue items, and keep the team aligned from one place.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {featurePoints.map((point) => (
            <div key={point} className="rounded-[1.5rem] border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-sm">
              {point}
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-8 shadow-[0_24px_70px_rgba(99,72,123,0.18)] sm:p-10" onSubmit={handleSubmit}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Welcome back</p>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">Log in</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Pick up where your team left off.</p>

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

          <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-[#f8f8fb] p-4 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Demo Accounts</p>
            <p className="mt-1 text-xs text-slate-500">Use these sample accounts to explore admin and member views.</p>
            <p className="mt-3">
              <span className="font-semibold text-slate-800">Admin Email:</span> admin.5c2b5fcf@example.com
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-800">Admin Password:</span> Password123
            </p>
            <p className="mt-3">
              <span className="font-semibold text-slate-800">Member Email:</span> member.5c2b5fcf@example.com
            </p>
            <p className="mt-1">
              <span className="font-semibold text-slate-800">Member Password:</span> Password123
            </p>
          </div>

          <p className="mt-5 text-center text-sm text-slate-600">
            Need an account?{" "}
            <Link to="/signup" className="font-semibold text-slate-900 hover:text-black">
              Create one
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
