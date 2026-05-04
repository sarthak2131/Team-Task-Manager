import { useEffect, useState } from "react";

import { apiRequest } from "../api/client.js";
import EmptyState from "../components/EmptyState.jsx";
import LoadingPanel from "../components/LoadingPanel.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import ProjectFormModal from "../components/ProjectFormModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ProjectsPage() {
  const { token, user } = useAuth();
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError("");

      try {
        const requests = [apiRequest("/projects", { token })];

        if (user.role === "admin") {
          requests.push(apiRequest("/users", { token }));
        }

        const [projectsResponse, usersResponse] = await Promise.all(requests);
        setProjects(projectsResponse.projects);
        setUsers(usersResponse?.users || []);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [token, user.role]);

  async function reloadProjects() {
    const response = await apiRequest("/projects", { token });
    setProjects(response.projects);
  }

  async function handleSaveProject(values) {
    setSaving(true);
    setError("");

    try {
      const path = editingProject ? `/projects/${editingProject._id}` : "/projects";
      const method = editingProject ? "PATCH" : "POST";

      await apiRequest(path, {
        method,
        token,
        body: values
      });

      await reloadProjects();
      setModalOpen(false);
      setEditingProject(null);
      showToast({
        title: editingProject ? "Project updated" : "Project created",
        description: editingProject
          ? "The latest project details and member emails are saved."
          : "The project is ready for task assignment."
      });
    } catch (requestError) {
      setError(requestError.message);
      showToast({
        tone: "error",
        title: "Could not save project",
        description: requestError.message
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingPanel title="Loading projects" message="Pulling active workspaces and team membership." />;
  }

  return (
    <div className="space-y-6">
      <section className="panel bg-gradient-to-br from-white/90 via-white/75 to-amber-50/80 p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Projects</p>
            <h2 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
              {user.role === "admin" ? "Create, assign, and steer delivery." : "Track the projects you belong to."}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              {user.role === "admin"
                ? "Build new projects, assign members by email, and open each workspace for deeper task management."
                : "Open any project you’re part of to review your assigned work, update statuses, and watch deadlines."}
            </p>
          </div>
          {user.role === "admin" ? (
            <button type="button" className="button-primary" onClick={() => setModalOpen(true)}>
              New project
            </button>
          ) : null}
        </div>
      </section>

      {error ? <div className="panel p-6 text-sm font-semibold text-rose-700">{error}</div> : null}

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {projects.length ? (
          projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              isAdmin={user.role === "admin"}
              onEdit={(selectedProject) => {
                setEditingProject(selectedProject);
                setModalOpen(true);
              }}
            />
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState
              eyebrow="No projects yet"
              title="Start the first delivery stream."
              message="Projects will appear here once an admin creates them and assigns members."
              action={
                user.role === "admin" ? (
                  <button type="button" className="button-primary" onClick={() => setModalOpen(true)}>
                    Create project
                  </button>
                ) : null
              }
            />
          </div>
        )}
      </section>

      <ProjectFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleSaveProject}
        users={users}
        initialValues={editingProject}
        isSubmitting={saving}
      />
    </div>
  );
}
