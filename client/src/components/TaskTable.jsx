import { Link } from "react-router-dom";

import EmptyState from "./EmptyState.jsx";
import StatusPill from "./StatusPill.jsx";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

export default function TaskTable({
  tasks,
  user,
  isAdmin,
  canManageTasks = false,
  showProjectColumn = false,
  onEdit,
  onDelete,
  onStatusChange
}) {
  if (!tasks.length) {
    return (
      <EmptyState
        eyebrow="No tasks found"
        title="Nothing matches the current view."
        message="Try a different filter, create a new task, or switch to another project."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-[2rem] border border-amber-100 bg-white/85 shadow-panel lg:block">
        <div
          className={`grid gap-4 border-b border-amber-100 bg-amber-50/70 px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500 ${
            showProjectColumn
              ? "grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_1fr]"
              : "grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr]"
          }`}
        >
          <span>Task</span>
          {showProjectColumn ? <span>Project</span> : null}
          <span>Status</span>
          <span>Priority</span>
          <span>Due</span>
          <span>Actions</span>
        </div>

        {tasks.map((task) => {
          const canUpdateStatus = isAdmin || task.assignee?._id === user._id;

          return (
            <div
              key={task._id}
              className={`grid gap-4 border-b border-amber-100 px-6 py-5 last:border-b-0 ${
                showProjectColumn
                  ? "grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr_1fr]"
                  : "grid-cols-[2.2fr_1.1fr_1fr_1fr_1fr]"
              }`}
            >
              <div>
                <strong className="text-base text-ink">{task.title}</strong>
                <p className="mt-2 text-sm leading-6 text-slate-600">{task.description || "No description provided."}</p>
                <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {task.assignee?.name || "Unassigned"}
                </p>
              </div>

              {showProjectColumn ? (
                <div className="self-center text-sm text-slate-600">
                  <Link className="font-semibold text-teal-700 hover:text-teal-800" to={`/projects/${task.project?._id}`}>
                    {task.project?.name}
                  </Link>
                </div>
              ) : null}

              <div className="self-center">
                <div className="flex flex-wrap gap-2">
                  {canUpdateStatus ? (
                    <select
                      className="rounded-full border border-amber-100 bg-white px-3 py-2 text-sm"
                      value={task.status}
                      onChange={(event) => onStatusChange(task, event.target.value)}
                    >
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="review">In review</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <StatusPill value={task.status} />
                  )}
                  {task.isOverdue ? <StatusPill value="overdue" /> : null}
                </div>
              </div>

              <div className="self-center">
                <StatusPill value={task.priority} />
              </div>

              <span className="self-center text-sm text-slate-600">{formatDate(task.dueDate)}</span>

              <div className="self-center">
                {canManageTasks ? (
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="button-secondary px-4 py-2 text-xs" onClick={() => onEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="button-danger px-4 py-2 text-xs" onClick={() => onDelete(task)}>
                      Delete
                    </button>
                  </div>
                ) : (
                  <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to={`/projects/${task.project?._id}`}>
                    Open project
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 lg:hidden">
        {tasks.map((task) => {
          const canUpdateStatus = isAdmin || task.assignee?._id === user._id;

          return (
            <article key={task._id} className="panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-2xl text-ink">{task.title}</h4>
                  <p className="mt-2 text-sm text-slate-500">{task.assignee?.name || "Unassigned"}</p>
                </div>
                <StatusPill value={task.priority} />
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{task.description || "No description provided."}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill value={task.status} />
                {task.isOverdue ? <StatusPill value="overdue" /> : null}
              </div>

              <div className="mt-4 text-sm text-slate-600">
                <p>Due: {formatDate(task.dueDate)}</p>
                {task.project?.name ? <p className="mt-1">Project: {task.project.name}</p> : null}
              </div>

              <div className="mt-5 space-y-3">
                {canUpdateStatus ? (
                  <select
                    className="input-field mt-0"
                    value={task.status}
                    onChange={(event) => onStatusChange(task, event.target.value)}
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">In review</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {canManageTasks ? (
                    <>
                      <button type="button" className="button-secondary flex-1" onClick={() => onEdit(task)}>
                        Edit
                      </button>
                      <button type="button" className="button-danger flex-1" onClick={() => onDelete(task)}>
                        Delete
                      </button>
                    </>
                  ) : (
                    <Link className="button-secondary w-full" to={`/projects/${task.project?._id}`}>
                      Open project
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
