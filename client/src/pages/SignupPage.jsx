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
    <div className="grid min-h-screen bg-shell lg:grid-cols-[1.15fr_0.85fr]">
      <section className="hidden bg-[linear-gradient(145deg,rgba(67,51,77,0.98),rgba(15,118,110,0.92))] px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-300">Admin and member roles</p>
          <h1 className="mt-6 max-w-2xl font-display text-6xl leading-tight">
            Launch a task workspace that keeps delivery visible and accountable.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-200">
            The first account becomes the initial admin. After that, admins can invite existing users to projects by
            email and manage delivery from one place.
          </p>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm leading-7 text-slate-100">
            Create your account to access JWT auth, member-scoped task views, overdue tracking, and responsive project
            management tools.
          </p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form className="panel w-full max-w-lg p-8 sm:p-10" onSubmit={handleSubmit}>
          <p className="eyebrow">Create account</p>
          <h2 className="mt-3 font-display text-4xl text-ink">Sign up</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Start your team workspace in a few steps.</p>

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
            <Link to="/login" className="font-semibold text-teal-700 hover:text-teal-800">
              Log in
            </Link>
          </p>
        </form>
      </section>
    </div>
  );
}
