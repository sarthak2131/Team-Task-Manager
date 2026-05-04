import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import LoadingPanel from "../components/LoadingPanel.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

export default function DashboardPage() {
  const { token, user, setUser } = useAuth();
  const { showToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingRoleFor, setSavingRoleFor] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const requests = [apiRequest("/dashboard/summary", { token })];

        if (user.role === "admin") {
          requests.push(apiRequest("/users", { token }));
        }

        const [dashboardResponse, usersResponse] = await Promise.all(requests);
        setSummary(dashboardResponse);
        setTeam(usersResponse?.users || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [token, user.role]);

  async function handleRoleChange(userId, role) {
    setSavingRoleFor(userId);

    try {
      const response = await apiRequest(`/users/${userId}/role`, {
        method: "PATCH",
        token,
        body: { role }
      });

      setTeam((current) => current.map((member) => (member._id === userId ? response.user : member)));

      if (user._id === userId) {
        setUser(response.user);
      }

      showToast({
        title: "Role updated",
        description: `${response.user.name} is now an ${response.user.role}.`
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not update role",
        description: requestError.message
      });
    } finally {
      setSavingRoleFor("");
    }
  }

  if (loading) {
    return <LoadingPanel title="Loading dashboard" message="Fetching task summaries, overdue items, and team access." />;
  }

  if (error) {
    return <div className="panel p-6 text-sm font-semibold text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden bg-gradient-to-br from-white/90 via-white/75 to-amber-50/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Overview</p>
            <h2 className="mt-3 max-w-3xl font-display text-4xl text-ink sm:text-5xl">
              {user.role === "admin"
                ? "See the whole workspace at a glance."
                : "Stay focused on the work assigned to you."}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {user.role === "admin"
                ? "Track team progress, shift responsibilities, and catch overdue work before delivery slips."
                : "Track progress, update task status, and keep your assigned work moving without noise from the rest of the board."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/projects" className="button-primary">
              Open projects
            </Link>
            <Link to="/tasks" className="button-secondary">
              View tasks
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total tasks" value={summary.stats.totalTasks} accent="gold" subtitle="All visible work items" />
        <StatCard title="Completed" value={summary.stats.completedTasks} accent="teal" subtitle="Closed tasks" />
        <StatCard title="In progress" value={summary.stats.inProgressTasks} accent="ember" subtitle="Actively moving" />
        <StatCard title="Overdue" value={summary.stats.overdueTasks} accent="rose" subtitle="Needs attention" />
        <StatCard
          title={user.role === "admin" ? "Projects" : "Completion"}
          value={user.role === "admin" ? summary.stats.projectCount : `${summary.stats.completionRate}%`}
          accent="violet"
          subtitle={user.role === "admin" ? "Workspaces under management" : "Assigned task completion rate"}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="panel p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Status mix</p>
              <h3 className="mt-2 font-display text-3xl text-ink">Task distribution</h3>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <StatusPill value="todo" />
              <p className="mt-4 font-display text-3xl text-ink">{summary.stats.statuses.todo}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <StatusPill value="in_progress" />
              <p className="mt-4 font-display text-3xl text-ink">{summary.stats.statuses.in_progress}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <StatusPill value="review" />
              <p className="mt-4 font-display text-3xl text-ink">{summary.stats.statuses.review}</p>
            </div>
            <div className="rounded-[1.5rem] bg-slate-50 p-4">
              <StatusPill value="completed" />
              <p className="mt-4 font-display text-3xl text-ink">{summary.stats.statuses.completed}</p>
            </div>
          </div>
        </article>

        <article className="panel p-6">
          <div>
            <p className="eyebrow">Overdue</p>
            <h3 className="mt-2 font-display text-3xl text-ink">Closest deadlines</h3>
          </div>

          <div className="mt-6 space-y-4">
            {summary.overdueItems.length ? (
              summary.overdueItems.map((task) => (
                <div key={task._id} className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <strong className="text-base text-ink">{task.title}</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {task.project?.name} · due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill value={task.status} />
                    {task.isOverdue ? <StatusPill value="overdue" /> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">Nothing overdue right now.</p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="panel p-6">
          <div>
            <p className="eyebrow">Recent movement</p>
            <h3 className="mt-2 font-display text-3xl text-ink">Latest task updates</h3>
          </div>

          <div className="mt-6 space-y-4">
            {summary.recentTasks.length ? (
              summary.recentTasks.map((task) => (
                <div key={task._id} className="flex flex-wrap items-start justify-between gap-3 border-b border-amber-100 pb-4 last:border-b-0 last:pb-0">
                  <div>
                    <strong className="text-base text-ink">{task.title}</strong>
                    <p className="mt-1 text-sm text-slate-600">
                      {task.project?.name} · {task.assignee?.name || "Unassigned"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill value={task.status} />
                    {task.isOverdue ? <StatusPill value="overdue" /> : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600">No task activity yet.</p>
            )}
          </div>
        </article>

        {user.role === "admin" ? (
          <article className="panel p-6">
            <div>
              <p className="eyebrow">Team management</p>
              <h3 className="mt-2 font-display text-3xl text-ink">Update member access</h3>
            </div>

            <div className="mt-6 space-y-4">
              {team.map((member) => (
                <div key={member._id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] bg-slate-50 p-4">
                  <div>
                    <strong className="text-ink">{member.name}</strong>
                    <p className="mt-1 text-sm text-slate-600">{member.email}</p>
                  </div>

                  <select
                    className="rounded-full border border-amber-100 bg-white px-4 py-3 text-sm"
                    value={member.role}
                    onChange={(event) => handleRoleChange(member._id, event.target.value)}
                    disabled={savingRoleFor === member._id}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </div>
  );
}
