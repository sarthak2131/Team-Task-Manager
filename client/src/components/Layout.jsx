import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function Icon({ name }) {
  const common = "h-5 w-5 stroke-current";

  if (name === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="4" rx="2" />
        <rect x="14" y="10" width="7" height="11" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    );
  }

  if (name === "projects") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={common} strokeWidth="1.8">
        <path d="M4 7a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={common} strokeWidth="1.8">
      <path d="M8 6h12" />
      <path d="M8 12h12" />
      <path d="M8 18h12" />
      <rect x="3" y="4" width="3" height="3" rx="1" />
      <rect x="3" y="10" width="3" height="3" rx="1" />
      <rect x="3" y="16" width="3" height="3" rx="1" />
    </svg>
  );
}

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/projects", label: "Projects", icon: "projects" },
  { to: "/tasks", label: "Tasks", icon: "tasks" }
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  function handleLogout() {
    logout();
    showToast({
      tone: "info",
      title: "Signed out",
      description: "Your local session has been cleared from this browser."
    });
  }

  const pageTitle =
    location.pathname === "/dashboard" ? "Dashboard" : location.pathname === "/tasks" ? "Tasks" : "Projects";

  function isNavActive(path) {
    return location.pathname === path;
  }

  return (
    <div className="h-screen overflow-hidden">
      <div className="relative h-screen w-full overflow-hidden bg-white/70 shadow-[0_24px_70px_rgba(99,72,123,0.12)] backdrop-blur lg:grid lg:grid-cols-[230px_minmax(0,1fr)]">
        {menuOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden"
            aria-label="Close navigation"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[290px] overflow-y-auto border-r border-slate-100 bg-white px-5 py-6 transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-auto lg:max-w-none lg:translate-x-0 lg:border-0 lg:border-r lg:border-slate-100 ${
            menuOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-[115%] pointer-events-none lg:pointer-events-auto"
          }`}
        >
          <div className="pb-7">
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.04em] text-[#171717]">
              Team Task
              <span className="block">Manager</span>
            </h1>
          </div>

          <div className="mb-4 text-xs font-medium text-slate-400">Menu</div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className={`relative z-10 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                  isNavActive(item.to) ? "bg-[#e7d8ff] text-[#18181b]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-slate-400">
                  <Icon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-10 rounded-[1.7rem] bg-gradient-to-br from-[#ffe8dc] via-[#f8e8ff] to-[#dbc7ff] p-5">
            <p className="font-display text-2xl leading-tight text-[#1d1d1f]">Workspace summary</p>
            <p className="mt-3 text-xs leading-6 text-slate-600">
              Manage team projects, track delivery, and keep assigned tasks moving from one board.
            </p>
            <div className="mt-5 rounded-2xl bg-white/70 px-4 py-3 text-sm font-medium text-slate-700">
              Signed in as {user.role}
            </div>
          </div>

          <button type="button" className="button-secondary mt-8 w-full" onClick={handleLogout}>
            Log out
          </button>
        </aside>

        <main className="min-w-0 h-screen overflow-y-auto bg-[#fbfafc] px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
          <header className="mb-7 flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-amber-100 bg-white/80 text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white lg:hidden"
                aria-label="Open navigation menu"
                onClick={() => setMenuOpen(true)}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16" strokeLinecap="round" />
                  <path d="M4 12h16" strokeLinecap="round" />
                  <path d="M4 17h16" strokeLinecap="round" />
                </svg>
              </button>
              <h2 className="text-[1.65rem] font-semibold tracking-[-0.03em] text-[#232336] sm:text-[1.9rem]">{pageTitle}</h2>
            </div>

            <div className="hidden flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm md:block">
              Manage projects, assigned work, and delivery progress from one place.
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <div className="relative" ref={notificationsRef}>
                <button
                  type="button"
                  className="relative rounded-full bg-white p-3 shadow-sm"
                  onClick={() => {
                    setNotificationsOpen((current) => !current);
                    setProfileOpen(false);
                  }}
                >
                  <svg className="h-5 w-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                    <path d="M10 17a2 2 0 0 0 4 0" />
                  </svg>
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-black" />
                </button>
                {notificationsOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-xl">
                    <p className="text-sm font-semibold text-[#1f2230]">Notifications</p>
                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-[#f8f8fb] px-3 py-3">
                        Check overdue tasks from the dashboard and update any blocked work.
                      </div>
                      <div className="rounded-2xl bg-[#f8f8fb] px-3 py-3">
                        Open projects to review assignees, due dates, and current status changes.
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#a4d4ff] via-[#f2d3f8] to-[#ffd1b8] text-sm font-semibold text-slate-800 shadow-sm"
                  onClick={() => {
                    setProfileOpen((current) => !current);
                    setNotificationsOpen(false);
                  }}
                >
                  {user.name[0]}
                </button>
                {profileOpen ? (
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-xl">
                    <div className="border-b border-slate-100 pb-3">
                      <p className="text-sm font-semibold text-[#1f2230]">{user.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="mt-3 rounded-2xl bg-[#f8f8fb] px-3 py-3 text-sm text-slate-600">
                      Signed in as <span className="font-semibold text-slate-800">{user.role}</span>
                    </div>
                    <button type="button" className="button-secondary mt-4 w-full" onClick={handleLogout}>
                      Log out
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </div>
  );
}
