import { useEffect, useMemo, useState } from "react";

import { apiRequest } from "../api/client.js";
import LoadingPanel from "../components/LoadingPanel.jsx";
import StatCard from "../components/StatCard.jsx";
import TaskTable from "../components/TaskTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function buildQuery(filters) {
  const params = new URLSearchParams();

  if (filters.projectId !== "all") {
    params.set("projectId", filters.projectId);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.priority !== "all") {
    params.set("priority", filters.priority);
  }

  if (filters.overdue !== "all") {
    params.set("overdue", filters.overdue === "overdue" ? "true" : "false");
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function TasksPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    projectId: "all",
    status: "all",
    priority: "all",
    overdue: "all"
  });
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
      showToast({
        title: "Task status updated",
        description: `${task.title} is now marked as ${nextStatus.replace("_", " ")}.`
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not update task",
        description: requestError.message
      });
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const inProgress = tasks.filter((task) => task.status === "in_progress").length;
    const overdue = tasks.filter((task) => task.isOverdue).length;

    return { total, completed, inProgress, overdue };
  }, [tasks]);

  if (loading) {
    return <LoadingPanel title="Loading tasks" message="Applying project, priority, and overdue filters." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel bg-gradient-to-br from-white/90 via-white/75 to-amber-50/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Tasks</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {user.role === "admin" ? "Filter work across every project." : "Focus on your assigned task list."}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Filter tasks by project, status, priority, and overdue state. Members only see tasks assigned to them.
            </p>
          </div>
        </div>
      </section>

      {error ? <div className="panel p-6 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total tasks" value={stats.total} accent="gold" subtitle="Matching current filters" />
        <StatCard title="Completed" value={stats.completed} accent="teal" subtitle="Finished work" />
        <StatCard title="In progress" value={stats.inProgress} accent="ember" subtitle="Active tasks" />
        <StatCard title="Overdue" value={stats.overdue} accent="rose" subtitle="Past the due date" />
      </section>

      <section className="panel p-6">
        <div className="flex flex-wrap gap-4">
          <label className="text-sm font-medium text-slate-700">
            Project
            <select
              className="input-field mt-2 w-52"
              value={filters.projectId}
              onChange={(event) => setFilters((current) => ({ ...current, projectId: event.target.value }))}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Status
            <select
              className="input-field mt-2 w-44"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="all">All statuses</option>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="review">In review</option>
              <option value="completed">Completed</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Priority
            <select
              className="input-field mt-2 w-44"
              value={filters.priority}
              onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Overdue
            <select
              className="input-field mt-2 w-44"
              value={filters.overdue}
              onChange={(event) => setFilters((current) => ({ ...current, overdue: event.target.value }))}
            >
              <option value="all">All tasks</option>
              <option value="overdue">Only overdue</option>
              <option value="not_overdue">Not overdue</option>
            </select>
          </label>
        </div>

        <div className="mt-6">
          <TaskTable
            tasks={tasks}
            user={user}
            isAdmin={user.role === "admin"}
            showProjectColumn
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>
    </div>
  );
}
