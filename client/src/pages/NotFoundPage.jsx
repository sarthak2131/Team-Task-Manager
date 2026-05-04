import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="panel max-w-2xl p-8 text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-3 font-display text-5xl text-ink">That page is off the board.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          The route you requested does not exist in this workspace.
        </p>
        <Link className="button-primary mt-6" to="/dashboard">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
