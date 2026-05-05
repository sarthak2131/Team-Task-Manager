import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[rgba(241,236,248,0.76)] backdrop-blur-[12px]">
      <div className="flex min-h-screen items-start justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-2xl rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_24px_70px_rgba(99,72,123,0.18)] sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{initialValues ? "Update project" : "New project"}</p>
            <h3 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.03em] text-[#1f2230]">
              {initialValues ? "Edit project setup" : "Create a new project"}
            </h3>
          </div>
          <button type="button" className="button-secondary" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-6 max-h-[calc(100vh-11rem)] space-y-5 overflow-y-auto overscroll-contain pr-1 sm:max-h-[calc(100vh-12rem)]" onSubmit={handleSubmit}>
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
                    className="rounded-xl border border-slate-200 bg-[#f8f8fb] px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    onClick={() => addEmailSuggestion(member.email)}
                  >
                    {member.email}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" className="button-secondary w-full sm:w-auto" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary w-full sm:w-auto" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : initialValues ? "Save changes" : "Create project"}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>,
    document.body
  );
}
