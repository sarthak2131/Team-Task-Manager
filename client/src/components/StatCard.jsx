const accentMap = {
  ember: "from-orange-50 to-white",
  teal: "from-teal-50 to-white",
  gold: "from-amber-50 to-white",
  rose: "from-rose-50 to-white",
  violet: "from-violet-50 to-white"
};

export default function StatCard({ title, value, accent = "gold", subtitle }) {
  return (
    <article className={`panel bg-gradient-to-br ${accentMap[accent]} p-5`}>
      <p className="text-sm text-slate-500">{title}</p>
      <strong className="mt-3 block font-display text-4xl text-ink">{value}</strong>
      {subtitle ? <span className="mt-3 block text-sm text-slate-600">{subtitle}</span> : null}
    </article>
  );
}
