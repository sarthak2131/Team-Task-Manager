import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRequest } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import LoadingPanel from "../components/LoadingPanel.jsx";
import ProjectFormModal from "../components/ProjectFormModal.jsx";
import StatusPill from "../components/StatusPill.jsx";
import TaskFormModal from "../components/TaskFormModal.jsx";
import TaskTable from "../components/TaskTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    priority: "all"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  useEffect(() => {
    async function loadProjectData() {
      setLoading(true);
      setError("");

      try {
        const requests = [
          apiRequest(`/projects/${projectId}`, { token }),
          apiRequest(`/tasks?projectId=${projectId}`, { token })
        ];

        if (user.role === "admin") {
          requests.push(apiRequest("/users", { token }));
        }

        const [projectResponse, tasksResponse, usersResponse] = await Promise.all(requests);
        setProject(projectResponse.project);
        setSummary(projectResponse.summary);
        setTasks(tasksResponse.tasks);
        setUsers(usersResponse?.users || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProjectData();
  }, [projectId, token, user.role]);

  async function reloadProjectData() {
    const [projectResponse, tasksResponse] = await Promise.all([
      apiRequest(`/projects/${projectId}`, { token }),
      apiRequest(`/tasks?projectId=${projectId}`, { token })
    ]);

    setProject(projectResponse.project);
    setSummary(projectResponse.summary);
    setTasks(tasksResponse.tasks);
  }

  async function handleSaveTask(values) {
    setSavingTask(true);
    setError("");

    try {
      const path = editingTask ? `/tasks/${editingTask._id}` : "/tasks";
      const method = editingTask ? "PATCH" : "POST";

      await apiRequest(path, {
        method,
        token,
        body: values
      });

      await reloadProjectData();
      setTaskModalOpen(false);
      setEditingTask(null);
      showToast({
        title: editingTask ? "Task updated" : "Task created",
        description: editingTask ? "The task details were saved." : "The task is now assigned to a project member."
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not save task",
        description: requestError.message
      });
    } finally {
      setSavingTask(false);
    }
  }

  async function handleDeleteTask(task) {
    const confirmed = window.confirm(`Delete task "${task.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/tasks/${task._id}`, {
        method: "DELETE",
        token
      });

      await reloadProjectData();
      showToast({
        tone: "info",
        title: "Task deleted",
        description: `${task.title} was removed from the project.`
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not delete task",
        description: requestError.message
      });
    }
  }

  async function handleStatusChange(task, nextStatus) {
    try {
      await apiRequest(`/tasks/${task._id}`, {
        method: "PATCH",
        token,
        body: { status: nextStatus }
      });

      await reloadProjectData();
      showToast({
        title: "Task status updated",
        description: `${task.title} is now marked as ${nextStatus.replace("_", " ")}.`
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not update status",
        description: requestError.message
      });
    }
  }

  async function handleSaveProject(values) {
    setSavingProject(true);
    setError("");

    try {
      await apiRequest(`/projects/${projectId}`, {
        method: "PATCH",
        token,
        body: values
      });

      await reloadProjectData();
      setProjectModalOpen(false);
      showToast({
        title: "Project updated",
        description: "Project details and member emails were saved."
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not update project",
        description: requestError.message
      });
    } finally {
      setSavingProject(false);
    }
  }

  async function handleDeleteProject() {
    const confirmed = window.confirm(`Delete project "${project?.name}" and all of its tasks?`);

    if (!confirmed) {
      return;
    }

    setDeletingProject(true);

    try {
      await apiRequest(`/projects/${projectId}`, {
        method: "DELETE",
        token
      });

      showToast({
        tone: "info",
        title: "Project deleted",
        description: "The project and all related tasks were removed."
      });
      navigate("/projects");
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not delete project",
        description: requestError.message
      });
    } finally {
      setDeletingProject(false);
    }
  }

  if (loading) {
    return <LoadingPanel title="Loading project" message="Fetching tasks, project members, and delivery metrics." />;
  }

  if (!project || !summary) {
    return (
      <EmptyState
        eyebrow="Project unavailable"
        title="We couldn't find this project."
        message="It may have been removed or you may no longer have access to it."
        action={
          <Link to="/projects" className="button-primary">
            Back to projects
          </Link>
        }
      />
    );
  }

  const visibleTasks = tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) {
      return false;
    }

    if (filters.priority !== "all" && task.priority !== filters.priority) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[1.6rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{project.name}</p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {project.description || "No description added for this project yet."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {user.role === "admin" ? (
              <>
                <button type="button" className="button-secondary" onClick={() => setProjectModalOpen(true)}>
                  Edit project
                </button>
                <button
                  type="button"
                  className="button-primary"
                  onClick={() => {
                    setEditingTask(null);
                    setTaskModalOpen(true);
                  }}
                >
                  New task
                </button>
                <button type="button" className="button-danger" onClick={handleDeleteProject} disabled={deletingProject}>
                  {deletingProject ? "Deleting..." : "Delete project"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {error ? <div className="rounded-[1.7rem] border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#fff8ea] p-5 shadow-sm">
          <p className="text-sm text-slate-500">Progress</p>
          <strong className="mt-3 block text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.progress}%</strong>
          <span className="mt-3 block text-sm text-slate-600">
            {summary.completedTasks} of {summary.totalTasks} tasks completed
          </span>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#edf8f6] p-5 shadow-sm">
          <p className="text-sm text-slate-500">Open tasks</p>
          <strong className="mt-3 block text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">
            {summary.byStatus.todo + summary.byStatus.in_progress + summary.byStatus.review}
          </strong>
          <span className="mt-3 block text-sm text-slate-600">Still in flight</span>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#fff0f4] p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overdue</p>
          <strong className="mt-3 block text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.overdueTasks}</strong>
          <span className="mt-3 block text-sm text-slate-600">Past due and incomplete</span>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-[#f3ecff] p-5 shadow-sm">
          <p className="text-sm text-slate-500">Deadline</p>
          <strong className="mt-3 block text-[2rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{formatDate(project.dueDate)}</strong>
          <span className="mt-3 block text-sm text-slate-600">Owner: {project.owner?.name}</span>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Team</p>
            <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#1f2230]">Assigned members</h3>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {project.members.map((member) => (
              <div key={member._id} className="rounded-[1.5rem] bg-[#f8f8fb] p-4">
                <strong className="text-[#1f2230]">{member.name}</strong>
                <p className="mt-1 text-sm text-slate-500">{member.email}</p>
                <div className="mt-3">
                  <StatusPill value={member.role} />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Breakdown</p>
            <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#1f2230]">Tasks by status</h3>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[#f8f8fb] p-4">
              <StatusPill value="todo" />
              <p className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.byStatus.todo}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#f8f8fb] p-4">
              <StatusPill value="in_progress" />
              <p className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.byStatus.in_progress}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#f8f8fb] p-4">
              <StatusPill value="review" />
              <p className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.byStatus.review}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[#f8f8fb] p-4">
              <StatusPill value="completed" />
              <p className="mt-4 text-[1.8rem] font-semibold tracking-[-0.04em] text-[#1f2230]">{summary.byStatus.completed}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Tasks</p>
            <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#1f2230]">
              {user.role === "admin" ? "Work items in this project" : "Your assigned tasks in this project"}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="text-sm font-medium text-slate-600">
              Status
              <select
                className="input-field mt-2 w-44"
                value={filters.status}
                onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="all">All</option>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="review">In review</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="text-sm font-medium text-slate-600">
              Priority
              <select
                className="input-field mt-2 w-44"
                value={filters.priority}
                onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <TaskTable
            tasks={visibleTasks}
            user={user}
            isAdmin={user.role === "admin"}
            canManageTasks={user.role === "admin"}
            onEdit={(task) => {
              setEditingTask(task);
              setTaskModalOpen(true);
            }}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
          />
        </div>
      </section>

      <TaskFormModal
        open={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        members={project.members}
        projectId={projectId}
        initialValues={editingTask}
        isSubmitting={savingTask}
      />

      <ProjectFormModal
        open={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSubmit={handleSaveProject}
        users={users}
        initialValues={project}
        isSubmitting={savingProject}
      />
    </div>
  );
}
