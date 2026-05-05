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
      <section className="rounded-[1.8rem] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[1.45rem] font-semibold tracking-[-0.04em] text-[#1f2230]">
              {user.role === "admin" ? "Project workspace" : "Assigned projects"}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              {user.role === "admin"
                ? "Build new projects, assign members by email, and open each workspace for deeper task management."
                : "Open any project you’re part of to review your assigned work, update statuses, and watch deadlines."}
            </p>
          </div>
          {user.role === "admin" ? (
            <button type="button" className="button-primary w-full sm:w-auto" onClick={() => setModalOpen(true)}>
              New project
            </button>
          ) : null}
        </div>
      </section>

      {error ? <div className="rounded-[1.7rem] border border-rose-200 bg-white p-6 text-sm font-semibold text-rose-700">{error}</div> : null}

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
