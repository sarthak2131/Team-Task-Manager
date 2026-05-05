import { Link } from "react-router-dom";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

export default function ProjectCard({ project, isAdmin, onEdit }) {
  return (
    <article className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Project</p>
          <h3 className="mt-2 text-[1.45rem] font-semibold tracking-[-0.03em] text-[#1f2230]">{project.name}</h3>
        </div>
        {isAdmin ? (
          <button type="button" className="button-secondary px-4 py-2 text-xs" onClick={() => onEdit(project)}>
            Edit
          </button>
        ) : null}
      </div>

      <p className="mt-4 min-h-[54px] text-sm leading-6 text-slate-500">
        {project.description || "No description yet. Add project context so everyone knows the goal."}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-2xl bg-[#f7f7fb] p-3">
          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Team</span>
          <strong className="mt-2 block text-[#1f2230]">{project.members.length}</strong>
        </div>
        <div className="rounded-2xl bg-[#f7f7fb] p-3">
          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Due</span>
          <strong className="mt-2 block break-words text-[#1f2230]">{formatDate(project.dueDate)}</strong>
        </div>
        <div className="rounded-2xl bg-[#f7f7fb] p-3">
          <span className="block text-xs uppercase tracking-[0.16em] text-slate-400">Done</span>
          <strong className="mt-2 block text-[#1f2230]">{project.metrics.progress}%</strong>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{project.metrics.completedTasks}/{project.metrics.totalTasks} tasks</span>
          <span>{project.metrics.overdueTasks} overdue</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full rounded-full bg-black" style={{ width: `${project.metrics.progress}%` }} />
        </div>
      </div>

      <Link className="button-primary mt-6 w-full" to={`/projects/${project._id}`}>
        Open project
      </Link>
    </article>
  );
}
