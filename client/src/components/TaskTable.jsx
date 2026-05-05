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
      <div className="hidden space-y-3 lg:block">
        {tasks.map((task) => {
          const canUpdateStatus = isAdmin || task.assignee?._id === user._id;
          const progress = progressFromStatus(task.status);

          return (
            <article
              key={task._id}
              className="grid items-center gap-4 rounded-[1.6rem] border border-slate-200 bg-white px-6 py-5 shadow-sm"
             style={{
  gridTemplateColumns: showProjectColumn
    ? "minmax(0,2.2fr) minmax(0,1fr) minmax(0,0.9fr) minmax(0,auto) minmax(0,auto) minmax(0,auto) minmax(0,1fr) minmax(0,1fr)"
    : "minmax(0,2.5fr) minmax(0,0.9fr) minmax(0,auto) minmax(0,auto) minmax(0,auto) minmax(0,1fr) minmax(0,1fr)"
}}
            >
              <div className="min-w-0">
                <strong className="block truncate text-[1.05rem] font-semibold text-[#1f2230]">{task.title}</strong>
                <p className="mt-1 truncate text-sm text-slate-500">
                  {showProjectColumn ? task.project?.name : task.description || "Task item"}
                </p>
              </div>

              {showProjectColumn ? (
                <div className="min-w-0 text-sm text-slate-500">
                  <Link className="truncate font-medium text-slate-600 hover:text-black" to={`/projects/${task.project?._id}`}>
                    {task.project?.name}
                  </Link>
                </div>
              ) : null}

              <div className="flex min-w-0 items-center gap-2">
                <span className="muted-chip">{task.assignee?.name || "Unassigned"}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {canUpdateStatus ? (
                  <select
                    className="min-w-[132px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"
                    value={task.status}
                    onChange={(event) => onStatusChange(task, event.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">In review</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <StatusPill value={task.status} />
                )}
                {task.isOverdue ? <StatusPill value="overdue" /> : null}
              </div>

              <div className="justify-self-start">
                <StatusPill value={task.priority} />
              </div>

              <div className="text-xs whitespace-nowrap text-slate-500">{formatDate(task.dueDate)}</div>

              <div className="flex min-w-[150px] items-center gap-3 justify-self-end">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-500">{progress}%</span>
              </div>

              <div className="flex items-center justify-end gap-2 whitespace-nowrap min-w-0">
                {canManageTasks ? (
                  <>
                    <button type="button" className="button-secondary min-w-[72px] px-3 py-2 text-xs" onClick={() => onEdit(task)}>
                      Edit
                    </button>
                    <button type="button" className="button-danger min-w-[78px] px-3 py-2 text-xs" onClick={() => onDelete(task)}>
                      Delete
                    </button>
                  </>
                ) : (
                  <Link className="button-secondary min-w-[118px] px-3 py-2 text-xs" to={`/projects/${task.project?._id}`}>
                    Open project
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <div className="space-y-4 lg:hidden">
        {tasks.map((task) => {
          const canUpdateStatus = isAdmin || task.assignee?._id === user._id;
          const progress = progressFromStatus(task.status);
          return (
            <article key={task._id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-xl font-semibold tracking-[-0.03em] text-[#1f2230]">{task.title}</h4>
                  <p className="mt-1 text-sm text-slate-500">{task.assignee?.name || "Unassigned"}</p>
                </div>
                <StatusPill value={task.priority} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill value={task.status} />
                {task.isOverdue ? <StatusPill value="overdue" /> : null}
              </div>

              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <p>{task.project?.name || "Task item"}</p>
                <p>Due: {formatDate(task.dueDate)}</p>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full bg-black" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-500">{progress}%</span>
              </div>

              <div className="mt-5 space-y-3">
                {canUpdateStatus ? (
                  <select
                    className="input-field mt-0"
                    value={task.status}
                    onChange={(event) => onStatusChange(task, event.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="in_progress">In progress</option>
                    <option value="review">In review</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {canManageTasks ? (
                    <>
                      <button type="button" className="button-secondary min-w-[120px] flex-1" onClick={() => onEdit(task)}>
                        Edit
                      </button>
                      <button type="button" className="button-danger min-w-[120px] flex-1" onClick={() => onDelete(task)}>
                        Delete
                      </button>
                    </>
                  ) : (
                   <Link
  className="button-secondary w-full max-w-[140px] px-3 py-2 text-xs truncate"
  to={`/projects/${task.project?._id}`}
>
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
