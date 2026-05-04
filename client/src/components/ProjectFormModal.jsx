import { useEffect, useState } from "react";

function toDateValue(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Date(dateValue).toISOString().slice(0, 10);
}

function parseEmails(value) {
  return [...new Set(value.split(/[\n,]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))];
}

export default function ProjectFormModal({ open, onClose, onSubmit, users, initialValues, isSubmitting }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    dueDate: "",
    memberEmailsText: ""
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const ownerId = initialValues?.owner?._id;
    const memberEmails = initialValues?.members
      ?.filter((member) => member._id !== ownerId)
      .map((member) => member.email)
      .join(", ");

    setForm({
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      dueDate: toDateValue(initialValues?.dueDate),
      memberEmailsText: memberEmails || ""
    });
  }, [initialValues, open]);

  if (!open) {
    return null;
  }

  function addEmailSuggestion(email) {
    setForm((current) => {
      const emails = parseEmails(current.memberEmailsText);

      if (emails.includes(email.toLowerCase())) {
        return current;
      }

      return {
        ...current,
        memberEmailsText: [...emails, email.toLowerCase()].join(", ")
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await onSubmit({
      name: form.name,
      description: form.description,
      dueDate: form.dueDate || null,
      memberEmails: parseEmails(form.memberEmailsText)
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6">
      <div className="panel max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-y-auto p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">{initialValues ? "Update project" : "New project"}</p>
            <h3 className="mt-2 font-display text-3xl text-ink">
              {initialValues ? "Edit project setup" : "Create a new project"}
            </h3>
          </div>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Project name
            <input
              type="text"
              className="input-field"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
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
            Due date
            <input
              type="date"
              className="input-field"
              value={form.dueDate}
              onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))}
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Member emails
              <textarea
                rows={4}
                className="input-field"
                placeholder="Enter emails separated by commas or new lines"
                value={form.memberEmailsText}
                onChange={(event) => setForm((current) => ({ ...current, memberEmailsText: event.target.value }))}
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">
              Add existing user emails here. The project owner is included automatically.
            </p>
          </div>

          {users.length ? (
            <div>
              <p className="text-sm font-medium text-slate-700">Quick add from existing accounts</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {users.map((member) => (
                  <button
                    key={member._id}
                    type="button"
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-amber-100"
                    onClick={() => addEmailSuggestion(member.email)}
                  >
                    {member.email}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button type="submit" className="button-primary w-full sm:w-auto" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create project"}
          </button>
        </form>
      </div>
    </div>
  );
}
