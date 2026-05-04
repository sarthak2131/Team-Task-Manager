import { Task } from "../models/Task.js";

export function computeIsOverdue(dueDate, status) {
  return Boolean(dueDate && new Date(dueDate) < new Date() && status !== "completed");
}

export function applyTaskTemporalState(task) {
  task.completedAt = task.status === "completed" ? task.completedAt || new Date() : null;
  task.isOverdue = computeIsOverdue(task.dueDate, task.status);
}

export async function syncOverdueFlags(scope = {}) {
  const now = new Date();

  await Promise.all([
    Task.updateMany(
      {
        ...scope,
        dueDate: { $lt: now },
        status: { $ne: "completed" },
        isOverdue: { $ne: true }
      },
      {
        $set: { isOverdue: true }
      }
    ),
    Task.updateMany(
      {
        ...scope,
        isOverdue: true,
        $or: [{ dueDate: { $gte: now } }, { dueDate: { $exists: false } }, { dueDate: null }, { status: "completed" }]
      },
      {
        $set: { isOverdue: false }
      }
    )
  ]);
}

export function serializeTask(task) {
  const plainTask = typeof task.toObject === "function" ? task.toObject() : task;
  const isOverdue = computeIsOverdue(plainTask.dueDate, plainTask.status);

  return {
    ...plainTask,
    isOverdue,
    computedStatus: isOverdue ? "overdue" : plainTask.status
  };
}

export function serializeTasks(tasks) {
  return tasks.map((task) => serializeTask(task));
}
