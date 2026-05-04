export default function LoadingPanel({ title = "Loading", message = "Pulling the latest workspace data." }) {
  return (
    <div className="rounded-[2rem] border border-white/60 bg-white/80 p-8 shadow-panel backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-emerald-600" />
        <div>
          <h3 className="font-display text-2xl text-ink">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
}
