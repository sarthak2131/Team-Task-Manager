import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";
import { syncOverdueFlags } from "../utils/taskState.js";

const projectPopulate = [
  { path: "owner", select: "name email role" },
  { path: "members", select: "name email role" }
];

function buildProjectAccessFilter(user) {
  if (user.role === "admin") {
    return {};
  }

  return {
    $or: [{ owner: user._id }, { members: user._id }]
  };
}

async function attachProjectMetrics(projects, user) {
  if (!projects.length) {
    return projects;
  }

  const projectIds = projects.map((project) => project._id);
  const match = {
    project: { $in: projectIds }
  };

  if (user.role !== "admin") {
    match.assignee = user._id;
  }

  await syncOverdueFlags(match);
  const metrics = await Task.aggregate([
    {
      $match: match
    },
    {
      $group: {
        _id: "$project",
        totalTasks: { $sum: 1 },
        completedTasks: {
          $sum: {
            $cond: [{ $eq: ["$status", "completed"] }, 1, 0]
          }
        },
        overdueTasks: {
          $sum: {
            $cond: [
              { $eq: ["$isOverdue", true] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);

  const metricMap = new Map(
    metrics.map((item) => [item._id.toString(), item])
  );

  return projects.map((project) => {
    const projectMetric = metricMap.get(project._id.toString()) || {
      totalTasks: 0,
      completedTasks: 0,
      overdueTasks: 0
    };

    const progress =
      projectMetric.totalTasks === 0
        ? 0
        : Math.round((projectMetric.completedTasks / projectMetric.totalTasks) * 100);

    return {
      ...project,
      metrics: {
        totalTasks: projectMetric.totalTasks,
        completedTasks: projectMetric.completedTasks,
        overdueTasks: projectMetric.overdueTasks,
        progress
      }
    };
  });
}

async function resolveProjectMemberIds(memberIds = [], memberEmails = []) {
  const uniqueIds = [...new Set(memberIds)];
  const normalizedEmails = [...new Set(memberEmails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
  const resolvedIds = new Set(uniqueIds);

  if (uniqueIds.length) {
    const idUsers = await User.find({ _id: { $in: uniqueIds } }).select("_id");

    if (idUsers.length !== uniqueIds.length) {
      throw httpError(400, "One or more team member ids could not be found.");
    }

    idUsers.forEach((user) => resolvedIds.add(user._id.toString()));
  }

  if (normalizedEmails.length) {
    const emailUsers = await User.find({ email: { $in: normalizedEmails } }).select("_id email");
    const resolvedEmails = new Set(emailUsers.map((user) => user.email));

    if (emailUsers.length !== normalizedEmails.length) {
      const missingEmails = normalizedEmails.filter((email) => !resolvedEmails.has(email));
      throw httpError(400, `No account found for: ${missingEmails.join(", ")}`);
    }

    emailUsers.forEach((user) => resolvedIds.add(user._id.toString()));
  }

  return [...resolvedIds];
}

export async function listProjects(req, res) {
  const projects = await Project.find(buildProjectAccessFilter(req.user))
    .populate(projectPopulate)
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    projects: await attachProjectMetrics(projects, req.user)
  });
}

export async function getProjectById(req, res) {
  const { projectId } = req.params;
  const project = await Project.findOne({
    _id: projectId,
    ...buildProjectAccessFilter(req.user)
  })
    .populate(projectPopulate)
    .lean();

  if (!project) {
    throw httpError(404, "Project not found.");
  }

  const summaryMatch = { project: project._id };

  if (req.user.role !== "admin") {
    summaryMatch.assignee = req.user._id;
  }

  await syncOverdueFlags(summaryMatch);
  const statusRows = await Task.aggregate([
    { $match: summaryMatch },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  const summary = {
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    byStatus: {
      todo: 0,
      in_progress: 0,
      review: 0,
      completed: 0
    }
  };

  for (const row of statusRows) {
    summary.totalTasks += row.count;
    summary.byStatus[row._id] = row.count;

    if (row._id === "completed") {
      summary.completedTasks = row.count;
    }
  }

  summary.overdueTasks = await Task.countDocuments({
    ...summaryMatch,
    isOverdue: true
  });

  summary.progress =
    summary.totalTasks === 0
      ? 0
      : Math.round((summary.completedTasks / summary.totalTasks) * 100);

  res.json({
    project,
    summary
  });
}

export async function createProject(req, res) {
  const { name, description, dueDate, memberIds = [], memberEmails = [] } = req.body;
  const resolvedMemberIds = await resolveProjectMemberIds(memberIds, memberEmails);
  const uniqueMemberIds = [...new Set([...resolvedMemberIds, req.user._id.toString()])];

  const project = await Project.create({
    name,
    description,
    dueDate: dueDate ?? undefined,
    owner: req.user._id,
    members: uniqueMemberIds
  });

  const populatedProject = await Project.findById(project._id).populate(projectPopulate).lean();

  res.status(201).json({
    message: "Project created successfully.",
    project: (await attachProjectMetrics([populatedProject], req.user))[0]
  });
}

export async function updateProject(req, res) {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw httpError(404, "Project not found.");
  }

  const { name, description, dueDate, memberIds, memberEmails } = req.body;

  if (memberIds || memberEmails) {
    const resolvedMemberIds = await resolveProjectMemberIds(memberIds || [], memberEmails || []);
    const uniqueMemberIds = [...new Set([...resolvedMemberIds, project.owner.toString()])];
    project.members = uniqueMemberIds;
  }

  if (name !== undefined) {
    project.name = name;
  }

  if (description !== undefined) {
    project.description = description;
  }

  if (dueDate !== undefined) {
    project.dueDate = dueDate ?? undefined;
  }

  await project.save();
  const populatedProject = await Project.findById(project._id).populate(projectPopulate).lean();
  const [projectWithMetrics] = await attachProjectMetrics([populatedProject], req.user);

  res.json({
    message: "Project updated successfully.",
    project: projectWithMetrics
  });
}

export async function deleteProject(req, res) {
  const { projectId } = req.params;
  const project = await Project.findById(projectId);

  if (!project) {
    throw httpError(404, "Project not found.");
  }

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({
    message: "Project and related tasks deleted successfully."
  });
}
