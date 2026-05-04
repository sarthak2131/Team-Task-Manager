const labelMap = {
  todo: "To do",
  in_progress: "In progress",
  review: "In review",
  completed: "Completed",
  overdue: "Overdue",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
  admin: "Admin",
  member: "Member"
};

const classMap = {
  todo: "bg-slate-100 text-slate-700",
  in_progress: "bg-cyan-100 text-cyan-800",
  review: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-800",
  overdue: "bg-rose-100 text-rose-800",
  low: "bg-cyan-100 text-cyan-800",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-rose-100 text-rose-800",
  admin: "bg-violet-100 text-violet-800",
  member: "bg-teal-100 text-teal-800"
};

export default function StatusPill({ value }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classMap[value] || "bg-slate-100 text-slate-700"}`}>
      {labelMap[value] || value}
    </span>
  );
}
