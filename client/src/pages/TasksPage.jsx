import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client.js";
import LoadingPanel from "../components/LoadingPanel.jsx";
import StatCard from "../components/StatCard.jsx";
import TaskTable from "../components/TaskTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.projectId !== "all") params.set("projectId", filters.projectId);
  if (filters.status !== "all") params.set("status", filters.status);
  if (filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.overdue !== "all") params.set("overdue", filters.overdue === "overdue" ? "true" : "false");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function TasksPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ projectId: "all", status: "all", priority: "all", overdue: "all" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTasksPage() {
      setLoading(true);
      setError("");
      try {
        const [projectsResponse, tasksResponse] = await Promise.all([
          apiRequest("/projects", { token }),
          apiRequest(`/tasks${buildQuery(filters)}`, { token })
        ]);
        setProjects(projectsResponse.projects);
        setTasks(tasksResponse.tasks);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }
    loadTasksPage();
  }, [filters, token]);

  async function handleStatusChange(task, nextStatus) {
    try {
      await apiRequest(`/tasks/${task._id}`, {
        method: "PATCH",
        token,
        body: { status: nextStatus }
      });
      const tasksResponse = await apiRequest(`/tasks${buildQuery(filters)}`, { token });
      setTasks(tasksResponse.tasks);
      showToast({ title: "Task status updated", description: `${task.title} is now ${nextStatus.replace("_", " ")}.` });
    } catch (requestError) {
      setError(requestError.message);
      showToast({ tone: "error", title: "Could not update task", description: requestError.message });
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const overdue = tasks.filter((task) => task.isOverdue).length;
    return { total, completed, inProgress, overdue };
  }, [tasks]);

  if (loading) return <LoadingPanel title="Loading tasks" message="Applying project, priority, and overdue filters." />;

  return (
    <div className="space-y-6">
      {error ? <div className="rounded-[1.7rem] border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Tasks" value={stats.total} accent="gold" subtitle="Matching current filters" />
        <StatCard title="Completed" value={stats.completed} accent="teal" subtitle="Finished work" />
        <StatCard title="In Progress" value={stats.inProgress} accent="violet" subtitle="Active tasks" />
        <StatCard title="Overdue" value={stats.overdue} accent="rose" subtitle="Past due date" />
      </section>

      <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Task Filters</p>
            <h3 className="mt-2 text-[1.35rem] font-semibold tracking-[-0.03em] text-[#1f2230]">Find assigned work</h3>
          </div>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-4">
          <label className="text-sm font-medium text-slate-600">
            Project
            <select className="input-field mt-2" value={filters.projectId} onChange={(event) => setFilters((c) => ({ ...c, projectId: event.target.value }))}>
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>{project.name}</option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-600">
            Status
            <select className="input-field mt-2" value={filters.status} onChange={(event) => setFilters((c) => ({ ...c, status: event.target.value }))}>
              <option value="all">All statuses</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="review">In review</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-600">
            Priority
            <select className="input-field mt-2" value={filters.priority} onChange={(event) => setFilters((c) => ({ ...c, priority: event.target.value }))}>
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-600">
            Overdue
            <select className="input-field mt-2" value={filters.overdue} onChange={(event) => setFilters((c) => ({ ...c, overdue: event.target.value }))}>
              <option value="all">All tasks</option>
              <option value="overdue">Only overdue</option>
              <option value="not_overdue">Not overdue</option>
            </select>
          </label>
        </div>

        <div className="mt-8">
          <TaskTable tasks={tasks} user={user} isAdmin={user.role === "admin"} showProjectColumn onStatusChange={handleStatusChange} />
        </div>
      </section>
    </div>
  );
}
