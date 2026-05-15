import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

function toDateKey(dateValue) {
  const date = new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function initials(name = "U") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function statusColor(task) {
  if (task.isOverdue) return "bg-rose-400";
  if (task.status === "completed") return "bg-emerald-500";
  if (task.status === "review") return "bg-fuchsia-400";
  if (task.status === "in_progress") return "bg-indigo-500";
  return "bg-amber-400";
}

function formatFullDate(date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short"
  });
}

export default function DashboardCalendar({ tasks }) {
  const datedTasks = useMemo(
    () => tasks.filter((task) => task.dueDate).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [tasks]
  );

  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    for (const task of datedTasks) {
      const key = toDateKey(task.dueDate);
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(task);
    }
    return grouped;
  }, [datedTasks]);

  const [anchorDate, setAnchorDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    if (datedTasks.length && !tasksByDate.has(selectedDate)) {
      setSelectedDate(toDateKey(datedTasks[0].dueDate));
      setAnchorDate(new Date(datedTasks[0].dueDate));
    }
  }, [datedTasks, selectedDate, tasksByDate]);

  const visibleWeek = useMemo(() => {
    const days = [];
    for (let offset = -3; offset <= 3; offset += 1) {
      const next = new Date(anchorDate);
      next.setDate(anchorDate.getDate() + offset);
      days.push(next);
    }
    return days;
  }, [anchorDate]);

  const selectedTasks = tasksByDate.get(selectedDate) || [];
  const selectedDateObject = selectedTasks[0]?.dueDate ? new Date(selectedTasks[0].dueDate) : new Date(selectedDate);
  const monthLabel = anchorDate.toLocaleDateString(undefined, { month: "long" });

  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Calendar</p>
          <h3 className="mt-2 text-[1.2rem] font-semibold tracking-[-0.03em] text-[#1f2230]">{monthLabel}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            onClick={() => setAnchorDate((current) => {
              const next = new Date(current);
              next.setDate(current.getDate() - 7);
              return next;
            })}
          >
            ‹
          </button>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            onClick={() => setAnchorDate((current) => {
              const next = new Date(current);
              next.setDate(current.getDate() + 7);
              return next;
            })}
          >
            ›
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2">
        {visibleWeek.map((day) => {
          const key = toDateKey(day);
          const dayTasks = tasksByDate.get(key) || [];
          const isActive = selectedDate === key;

          return (
            <button
              key={key}
              type="button"
              className={`rounded-[1.1rem] px-2 py-3 text-center transition ${
                isActive ? "bg-[#6f60f6] text-white shadow-md" : "bg-[#f8f8fb] text-slate-700 hover:bg-slate-100"
              }`}
              onClick={() => {
                setSelectedDate(key);
                setAnchorDate(day);
              }}
            >
              <div className={`text-[10px] font-medium ${isActive ? "text-white/80" : "text-slate-400"}`}>
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </div>
              <div className="mt-1 text-base font-semibold">{String(day.getDate()).padStart(2, "0")}</div>
              <div className="mt-1 flex justify-center">
                {dayTasks.length ? (
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white" : statusColor(dayTasks[0])}`} />
                ) : (
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-white/30" : "bg-slate-200"}`} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-[1.5rem] bg-[#f4f3ff] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#1f2230]">
              {selectedTasks.length ? `${selectedTasks.length} task${selectedTasks.length > 1 ? "s" : ""} due` : "No task due"}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatFullDate(selectedDateObject)}</p>
          </div>
          {selectedTasks.length ? (
            <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusColor(selectedTasks[0])}`} />
          ) : null}
        </div>

        {selectedTasks.length ? (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTasks.slice(0, 3).map((task, index) => (
                <div
                  key={task._id}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-[#dff3ff] via-[#f7e1f2] to-[#ffe4cc] text-[10px] font-semibold text-slate-700 ${
                    index ? "-ml-2" : ""
                  }`}
                  title={task.assignee?.name || "Unassigned"}
                >
                  {initials(task.assignee?.name)}
                </div>
              ))}
              {selectedTasks.length > 3 ? (
                <div className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#6e58c3] text-[10px] font-semibold text-white">
                  +{selectedTasks.length - 3}
                </div>
              ) : null}
            </div>

            <div className="mt-4 max-h-[180px] space-y-2 overflow-y-auto pr-1">
              {selectedTasks.map((task) => (
                <Link
                  key={task._id}
                  to={task.project?._id ? `/projects/${task.project._id}` : "/projects"}
                  className="block rounded-2xl bg-white px-3 py-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1f2230]">{task.title}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {task.project?.name || "Task item"} • {task.assignee?.name || "Unassigned"}
                      </p>
                    </div>
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusColor(task)}`} />
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-3 text-xs text-slate-500">Click a highlighted day to view due tasks.</p>
        )}
      </div>
    </section>
  );
}
