import { Link } from "react-router-dom";

function formatDate(dateValue) {
  if (!dateValue) {
    return "No deadline";
  }

  return new Date(dateValue).toLocaleDateString();
}

export default function ProjectCard({ project, isAdmin, onEdit }) {
  return (
    <article className="panel flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Project</p>
          <h3 className="mt-2 font-display text-3xl text-ink">{project.name}</h3>
        </div>
        {isAdmin ? (
          <button type="button" className="button-secondary px-4 py-2 text-xs" onClick={() => onEdit(project)}>
            Edit
          </button>
        ) : null}
      </div>

      <p className="mt-4 flex-1 text-sm leading-7 text-slate-600">
        {project.description || "No description yet. Add some project context so the team has a shared brief."}
      </p>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
          <span>{project.metrics.progress}% complete</span>
          <span>
            {project.metrics.completedTasks}/{project.metrics.totalTasks} tasks
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
          <span
            className="block h-full rounded-full bg-gradient-to-r from-emerald-600 to-amber-400"
            style={{ width: `${project.metrics.progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-3">
          <span className="block text-slate-500">Team</span>
          <strong className="mt-1 block text-ink">{project.members.length}</strong>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <span className="block text-slate-500">Due</span>
          <strong className="mt-1 block text-ink">{formatDate(project.dueDate)}</strong>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <span className="block text-slate-500">Overdue</span>
          <strong className="mt-1 block text-ink">{project.metrics.overdueTasks}</strong>
        </div>
      </div>

      <Link className="button-primary mt-6 w-full" to={`/projects/${project._id}`}>
        Open project
      </Link>
    </article>
  );
}
