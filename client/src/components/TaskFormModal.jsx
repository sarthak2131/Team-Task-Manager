import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function toDateValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toISOString().slice(0, 10);
}

export default function TaskFormModal({ open, onClose, onSubmit, members, projectId, initialValues, isSubmitting }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    status: "todo",
    priority: "medium",
    dueDate: ""
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      assigneeId: initialValues?.assignee?._id || members[0]?._id || "",
      status: initialValues?.status || "todo",
      priority: initialValues?.priority || "medium",
      dueDate: toDateValue(initialValues?.dueDate)
    });
  }, [initialValues, members, open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      title: form.title,
      description: form.description,
      assigneeId: form.assigneeId,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || null,
      projectId
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[rgba(241,236,248,0.76)] backdrop-blur-[12px]">
      <div className="flex min-h-screen items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_70px_rgba(99,72,123,0.18)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{initialValues ? "Task editor" : "New task"}</p>
            <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-[#1f2230]">
              {initialValues ? "Update task details" : "Create and assign a task"}
            </h3>
          </div>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-6 max-h-[calc(100vh-11rem)] space-y-5 overflow-y-auto overscroll-contain pr-1 sm:max-h-[calc(100vh-12rem)]" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Title
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              required
              minLength={3}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Description
            <textarea
              rows={4}
              className="input-field"
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            />
          </label>

          <label className="block text-sm font-medium text-slate-700">
            Assignee
            <select
              className="input-field"
              value={form.assigneeId}
              onChange={(event) => setForm((current) => ({ ...current, assigneeId: event.target.value }))}
              required
              disabled={!members.length}
            >
              {!members.length ? <option value="">No team members available</option> : null}
              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Status
              <select
                className="input-field"
                value={form.status}
                onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="review">In review</option>
                <option value="completed">Completed</option>
              </select>
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Priority
              <select
                className="input-field"
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-700">
            Due date
            <input
              type="date"
              className="input-field"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" className="button-secondary w-full sm:w-auto" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary w-full sm:w-auto" disabled={isSubmitting || !members.length}>
              {isSubmitting ? "Saving..." : initialValues ? "Save task" : "Create task"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>,
    document.body
  );
}
