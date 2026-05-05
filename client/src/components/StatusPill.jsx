const labelMap = {
  todo: "Todo",
  in_progress: "In Progress",
  review: "In Review",
  completed: "Done",
  overdue: "Overdue",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
  admin: "Admin",
  member: "Member"
};

const classMap = {
  todo: "bg-[#f4f4f5] text-slate-600",
  in_progress: "bg-[#ebefff] text-[#5364c9]",
  review: "bg-[#f4e7ff] text-[#9254d8]",
  completed: "bg-[#e8f7ef] text-[#2d8b57]",
  overdue: "bg-[#ffe7ea] text-[#d24a66]",
  low: "bg-[#e7f7ff] text-[#3176a8]",
  medium: "bg-[#fff2d8] text-[#8b6a1d]",
  high: "bg-[#ffe8d9] text-[#b66b36]",
  urgent: "bg-[#ffe5ea] text-[#c54b5e]",
  admin: "bg-[#ede7ff] text-[#6e58c3]",
  member: "bg-[#ecf8f5] text-[#2d8870]"
};

export default function StatusPill({ value }) {
  return (
    <span className={`inline-flex w-fit shrink-0 self-start rounded-xl px-3 py-1 text-[11px] font-semibold ${classMap[value] || "bg-slate-100 text-slate-600"}`}>
      {labelMap[value] || value}
    </span>
  );
}
