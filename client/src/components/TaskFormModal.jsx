import { useEffect, useState } from "react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="panel max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{initialValues ? "Task editor" : "New task"}</p>
            <h3 className="mt-2 font-display text-3xl text-ink">
              {initialValues ? "Update task details" : "Create and assign a task"}
            </h3>
          </div>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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

          <button type="submit" className="button-primary w-full sm:w-auto" disabled={isSubmitting || !members.length}>
            {isSubmitting ? "Saving..." : initialValues ? "Save task" : "Create task"}
          </button>
        </form>
      </div>
    </div>
  );
}
