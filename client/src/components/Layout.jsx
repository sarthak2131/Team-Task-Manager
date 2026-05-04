import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/projects", label: "Projects" },
  { to: "/tasks", label: "Tasks" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    showToast({
      tone: "info",
      title: "Signed out",
      description: "Your local session has been cleared from this browser."
    });
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[290px_minmax(0,1fr)]">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-900/45 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[290px] border-r border-white/10 bg-[#1b1420] px-5 py-6 text-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">Team Task Manager</p>
          <h1 className="mt-3 font-display text-4xl leading-tight">Keep every project moving.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            A shared control room for planning, assigning, tracking, and closing work across your team.
          </p>
        </div>

        <nav className="mt-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-amber-400 to-emerald-500 text-slate-950"
                    : "bg-white/5 text-slate-200 hover:bg-white/10"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 rounded-[2rem] border border-white/10 bg-white/5 p-5">
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
            {user.role}
          </span>
          <p className="mt-4 text-lg font-semibold">{user.name}</p>
          <p className="mt-1 text-sm text-slate-300">{user.email}</p>
          <button type="button" className="button-secondary mt-5 w-full border-white/10 bg-white/10 text-white" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" className="button-secondary lg:hidden" onClick={() => setMenuOpen(true)}>
              Menu
            </button>
            <div>
              <p className="eyebrow">Workspace</p>
              <h2 className="mt-2 font-display text-3xl text-ink">Welcome back, {user.name.split(" ")[0]}</h2>
            </div>
          </div>

          <div className="panel inline-flex items-center gap-2 px-4 py-3 text-sm text-slate-600">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            {user.role === "admin" ? "Admin controls active" : "Assigned task view"}
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  );
}
