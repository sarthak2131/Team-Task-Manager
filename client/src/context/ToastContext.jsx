import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const toneClasses = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-amber-200 bg-amber-50 text-amber-900"
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function removeToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function showToast({ title, description = "", tone = "success" }) {
    const id = crypto.randomUUID();

    setToasts((current) => [...current, { id, title, description, tone }]);
    window.setTimeout(() => removeToast(id), 3800);
  }

  const value = useMemo(
    () => ({
      showToast
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-3xl border px-4 py-3 shadow-panel backdrop-blur ${toneClasses[toast.tone]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
              </div>
              <button
                type="button"
                className="rounded-full px-2 py-1 text-xs font-semibold transition hover:bg-black/5"
                onClick={() => removeToast(toast.id)}
              >
                Close
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
