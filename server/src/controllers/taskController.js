import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";
import { applyTaskTemporalState, serializeTask, serializeTasks, syncOverdueFlags } from "../utils/taskState.js";

const taskPopulate = [
  { path: "project", select: "name dueDate members owner" },
  { path: "assignee", select: "name email role" },
  { path: "createdBy", select: "name email role" }
];

function buildProjectAccessFilter(user) {
  if (user.role === "admin") {
    return {};
  }

  return {
    $or: [{ owner: user._id }, { members: user._id }]
  };
}

async function ensureAccessibleProject(projectId, user) {
  const project = await Project.findOne({
    _id: projectId,
    ...buildProjectAccessFilter(user)
  });

  if (!project) {
    throw httpError(404, "Project not found.");
  }

  return project;
}

async function ensureAssigneeBelongsToProject(project, assigneeId) {
  const user = await User.findById(assigneeId).select("_id");

  if (!user) {
    throw httpError(400, "Assignee does not exist.");
  }

  const isMember = project.members.some((memberId) => memberId.toString() === assigneeId.toString());

  if (!isMember) {
    throw httpError(400, "Assignee must be part of the selected project team.");
  }
}

export async function listTasks(req, res) {
  const { projectId, status, priority, assignee, overdue } = req.query;
  const filter = {};
  const overdueSyncScope = {};

  if (projectId) {
    const project = await ensureAccessibleProject(projectId, req.user);
    filter.project = project._id;
    overdueSyncScope.project = project._id;
  }

  if (req.user.role !== "admin") {
    filter.assignee = req.user._id;
    overdueSyncScope.assignee = req.user._id;
  } else if (assignee) {
    filter.assignee = assignee === "me" ? req.user._id : assignee;
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (overdue === "true") {
    filter.isOverdue = true;
  }

  if (overdue === "false") {
    filter.isOverdue = false;
  }

  await syncOverdueFlags(overdueSyncScope);
  const tasks = await Task.find(filter)
    .populate(taskPopulate)
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();

  res.json({ tasks: serializeTasks(tasks) });
}

export async function getTaskById(req, res) {
  const { taskId } = req.params;
  const task = await Task.findById(taskId).populate(taskPopulate);

  if (!task) {
    throw httpError(404, "Task not found.");
  }

  await ensureAccessibleProject(task.project._id, req.user);
  await syncOverdueFlags({ _id: task._id });

  if (req.user.role !== "admin" && !task.assignee._id.equals(req.user._id)) {
    throw httpError(403, "Members can only view tasks assigned to them.");
  }

  res.json({ task: serializeTask(task) });
}

export async function createTask(req, res) {
  const { title, description, projectId, assigneeId, status, priority, dueDate } = req.body;
  const project = await Project.findById(projectId);

  if (!project) {
    throw httpError(404, "Project not found.");
  }

  await ensureAssigneeBelongsToProject(project, assigneeId);

  const task = await Task.create({
    title,
    description,
    project: project._id,
    assignee: assigneeId,
    createdBy: req.user._id,
    status,
    priority,
    dueDate: dueDate ?? undefined,
    completedAt: status === "completed" ? new Date() : null,
    isOverdue: false
  });

  applyTaskTemporalState(task);
  await task.save();
  const populatedTask = await Task.findById(task._id).populate(taskPopulate);

  res.status(201).json({
    message: "Task created successfully.",
    task: serializeTask(populatedTask)
  });
}

export async function updateTask(req, res) {
  const { taskId } = req.params;
  const updates = req.body;
  const task = await Task.findById(taskId).populate(taskPopulate);

  if (!task) {
    throw httpError(404, "Task not found.");
  }

  const project = await ensureAccessibleProject(task.project._id, req.user);
  const updateKeys = Object.keys(updates).filter((key) => updates[key] !== undefined);

  if (req.user.role !== "admin") {
    if (!task.assignee._id.equals(req.user._id)) {
      throw httpError(403, "Members can only update tasks assigned to them.");
    }

    if (!updateKeys.length || updateKeys.some((key) => key !== "status")) {
      throw httpError(403, "Members can only change the task status.");
    }

    task.status = updates.status;
    applyTaskTemporalState(task);
    await task.save();
    await task.populate(taskPopulate);

    res.json({
      message: "Task status updated successfully.",
      task: serializeTask(task)
    });
    return;
  }

  if (updates.assigneeId) {
    await ensureAssigneeBelongsToProject(project, updates.assigneeId);
    task.assignee = updates.assigneeId;
  }

  if (updates.title !== undefined) {
    task.title = updates.title;
  }

  if (updates.description !== undefined) {
    task.description = updates.description;
  }

  if (updates.status !== undefined) {
    task.status = updates.status;
  }

  if (updates.priority !== undefined) {
    task.priority = updates.priority;
  }

  if (updates.dueDate !== undefined) {
    task.dueDate = updates.dueDate ?? undefined;
  }

  applyTaskTemporalState(task);
  await task.save();
  await task.populate(taskPopulate);

  res.json({
    message: "Task updated successfully.",
    task: serializeTask(task)
  });
}

export async function deleteTask(req, res) {
  const { taskId } = req.params;
  const task = await Task.findById(taskId);

  if (!task) {
    throw httpError(404, "Task not found.");
  }

  await task.deleteOne();

  res.json({
    message: "Task deleted successfully."
  });
}
