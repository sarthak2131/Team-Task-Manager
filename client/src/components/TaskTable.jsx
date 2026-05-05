import { Link } from "react-router-dom";

import EmptyState from "./EmptyState.jsx";
import StatusPill from "./StatusPill.jsx";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

function progressFromStatus(status) {
  if (status === "completed") return 100;
  if (status === "review") return 80;
  if (status === "in_progress") return 55;
  return 15;
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
      {tasks.map((task) => {
        const canUpdateStatus = isAdmin || task.assignee?._id === user._id;
        const progress = progressFromStatus(task.status);

        return (
          <article key={task._id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-xl font-semibold tracking-[-0.03em] text-[#1f2230]">{task.title}</h4>
                <p className="mt-1 text-sm text-slate-500">{task.description || "Task item"}</p>
              </div>
              <StatusPill value={task.priority} />
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {showProjectColumn ? (
                <div className="rounded-2xl bg-[#f8f8fb] px-4 py-3 text-sm text-slate-500">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Project</span>
                  <p className="mt-2 break-words text-slate-700">{task.project?.name || "Task item"}</p>
                </div>
              ) : null}

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
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Due date</span>
                <p className="mt-2 text-slate-700">{formatDate(task.dueDate)}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              {canUpdateStatus ? (
                <select
                  className="input-field mt-0 w-full xl:max-w-[240px]"
                  value={task.status}
                  onChange={(event) => onStatusChange(task, event.target.value)}
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In progress</option>
                  <option value="review">In review</option>
                  <option value="completed">Completed</option>
                </select>
              ) : (
                <div />
              )}

              <div className="flex flex-wrap gap-2 xl:justify-end">
                {canManageTasks ? (
                  <>
                    <button type="button" className="button-secondary min-w-[120px] flex-1 sm:flex-none" onClick={() => onEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="button-danger min-w-[120px] flex-1 sm:flex-none" onClick={() => onDelete(task)}>
                      Delete
                    </button>
                  </>
                ) : (
                  <Link className="button-secondary w-full sm:w-auto px-4 py-2 text-sm" to={`/projects/${task.project?._id}`}>
                    Open project
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 xl:max-w-[460px]">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-500">{progress}%</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}
