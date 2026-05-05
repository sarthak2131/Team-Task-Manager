const accentMap = {
  ember: "bg-[#fff2ea]",
  teal: "bg-[#edf8f6]",
  gold: "bg-[#fff8ea]",
  rose: "bg-[#fff0f4]",
  violet: "bg-[#f3ecff]"
};

export default function StatCard({ title, value, accent = "gold", subtitle }) {
  return (
    <article className={`rounded-[1.5rem] border border-slate-200 ${accentMap[accent]} px-5 py-4 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <strong className="mt-3 block text-[2rem] font-semibold tracking-[-0.04em] text-[#1e1e28]">{value}</strong>
      {subtitle ? <span className="mt-2 block text-xs text-slate-500">{subtitle}</span> : null}
    </article>
  );
}
