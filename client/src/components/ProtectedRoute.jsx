import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { token, user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="panel max-w-xl p-8 text-center">
          <p className="eyebrow">Restoring session</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Loading your workspace</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Reconnecting your projects, team permissions, and assigned tasks.
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
