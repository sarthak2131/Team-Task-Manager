import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function SignupPage() {
  const { token, user, saveSession } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const response = await apiRequest("/auth/signup", {
        method: "POST",
        body: form
      });

      saveSession(response.token, response.user);
      showToast({
        title: "Account created",
        description: response.message
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Signup failed",
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
            Create your workspace and start tracking projects with clear ownership.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-500">
            The first account becomes the initial admin. After that, admins can invite existing users to projects by
            email and manage delivery from one place.
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm leading-7 text-slate-600">
            Create your account to access JWT auth, member-scoped task views, overdue tracking, and responsive project
            management tools.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form className="w-full max-w-lg rounded-[2rem] border border-white/80 bg-white p-8 shadow-[0_24px_70px_rgba(99,72,123,0.18)] sm:p-10" onSubmit={handleSubmit}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Create account</p>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">Sign up</h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">Start your team workspace in a few steps.</p>

          <div className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-slate-700">
              Full name
              <input
                type="text"
                className="input-field"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                required
              />
            </label>

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
                minLength={8}
              />
            </label>
          </div>

          {error ? <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p> : null}

          <button type="submit" className="button-primary mt-8 w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-5 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-slate-900 hover:text-black">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
