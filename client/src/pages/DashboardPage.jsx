import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import LoadingPanel from "../components/LoadingPanel.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusPill from "../components/StatusPill.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function progressFromStatus(status) {
  if (status === "completed") return 100;
  if (status === "review") return 80;
  if (status === "in_progress") return 55;
  return 15;
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
        if (user.role === "admin") requests.push(apiRequest("/users", { token }));
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
      if (user._id === userId) setUser(response.user);
      showToast({ title: "Role updated", description: `${response.user.name} is now ${response.user.role}.` });
    } catch (requestError) {
      setError(requestError.message);
      showToast({ tone: "error", title: "Could not update role", description: requestError.message });
    } finally {
      setSavingRoleFor("");
    }
  }

  if (loading) return <LoadingPanel title="Loading dashboard" message="Fetching task summaries and team access." />;
  if (error) return <div className="rounded-[1.7rem] border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">{error}</div>;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Tasks" value={summary.stats.totalTasks} accent="gold" subtitle="Visible work items" />
        <StatCard title="Completed" value={summary.stats.completedTasks} accent="teal" subtitle="Finished tasks" />
        <StatCard title="In Progress" value={summary.stats.inProgressTasks} accent="violet" subtitle="Active tasks" />
        <StatCard title="Overdue" value={summary.stats.overdueTasks} accent="rose" subtitle="Need attention" />
      </section>

      <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent Tasks</p>
            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#1f2230]">Latest activity</h3>
          </div>
          <Link to="/projects" className="button-primary w-full sm:w-auto">+ New Project</Link>
        </div>

        <div className="mt-7 space-y-3">
          {summary.recentTasks.length ? (
            summary.recentTasks.map((task) => (
              (() => {
                const progress = progressFromStatus(task.status);

                return (
                  <article key={task._id} className="rounded-[1.6rem] border border-slate-200 bg-white px-5 py-5 shadow-sm">
                    <div className="min-w-0">
                      <strong className="block truncate text-[1.05rem] font-semibold text-[#1f2230]">{task.title}</strong>
                      <p className="mt-1 text-sm text-slate-500">{task.description || "Task item"}</p>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3 text-sm text-slate-500">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Project</span>
                        <p className="mt-2 break-words text-slate-700">{task.project?.name || "Task item"}</p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3 text-sm text-slate-500">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Assignee</span>
                        <p className="mt-2 break-words text-slate-700">{task.assignee?.name || "Unassigned"}</p>
                      </div>

                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3 text-sm text-slate-500">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Status</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusPill value={task.status} />
                          {task.isOverdue ? <StatusPill value="overdue" /> : null}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3 text-sm text-slate-500">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Priority</span>
                        <div className="mt-2">
                          <StatusPill value={task.priority || "medium"} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center gap-3 xl:max-w-[460px]">
                      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-slate-500">{progress}%</span>
                    </div>
                  </article>
                );
              })()
            ))
          ) : (
            <div className="rounded-[1.6rem] border border-dashed border-slate-200 px-6 py-7 text-sm text-slate-500">
              No task activity yet.
            </div>
          )}
        </div>
      </section>

      {user.role === "admin" ? (
        <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Team Management</p>
            <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#1f2230]">Update member roles</h3>
          </div>
          <div className="mt-5 grid gap-3 xl:grid-cols-2">
            {team.map((member) => (
              <div key={member._id} className="flex flex-col gap-3 rounded-[1.25rem] bg-[#f8f8fb] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <strong className="text-sm text-[#1f2230]">{member.name}</strong>
                  <p className="mt-1 break-all text-xs text-slate-500">{member.email}</p>
                </div>
                {user._id === member._id ? (
                  <div className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-center text-xs font-semibold text-slate-500 sm:w-auto">
                    {member.role === "admin" ? "Admin (You)" : "Member (You)"}
                  </div>
                ) : (
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 sm:w-auto"
                    value={member.role}
                    onChange={(event) => handleRoleChange(member._id, event.target.value)}
                    disabled={savingRoleFor === member._id}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                )}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
