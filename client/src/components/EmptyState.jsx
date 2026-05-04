export default function EmptyState({ eyebrow, title, message, action }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-amber-200 bg-white/70 p-10 text-center shadow-panel backdrop-blur">
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-700">{eyebrow}</p> : null}
      <h3 className="mt-3 font-display text-3xl text-ink">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{message}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
