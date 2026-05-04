import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { User } from "../models/User.js";
import { serializeTasks, syncOverdueFlags } from "../utils/taskState.js";

function buildProjectAccessFilter(user) {
  if (user.role === "admin") {
    return {};
  }

  return {
    $or: [{ owner: user._id }, { members: user._id }]
  };
}

export async function getDashboardSummary(req, res) {
  const projectFilter = buildProjectAccessFilter(req.user);
  const taskFilter = req.user.role === "admin" ? {} : { assignee: req.user._id };
  await syncOverdueFlags(taskFilter);

  const [
    projectCount,
    totalTasks,
    overdueTasks,
    statusRows,
    recentTasks,
    overdueItems,
    memberCount
  ] = await Promise.all([
    Project.countDocuments(projectFilter),
    Task.countDocuments(taskFilter),
    Task.countDocuments({
      ...taskFilter,
      isOverdue: true
    }),
    Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]),
    Task.find(taskFilter)
      .populate([
        { path: "project", select: "name" },
        { path: "assignee", select: "name email role" }
      ])
      .sort({ updatedAt: -1 })
      .limit(6)
      .lean(),
    Task.find({
      ...taskFilter,
      isOverdue: true
    })
      .populate([
        { path: "project", select: "name" },
        { path: "assignee", select: "name email role" }
      ])
      .sort({ dueDate: 1 })
      .limit(6)
      .lean(),
    req.user.role === "admin" ? User.countDocuments({ role: "member" }) : Promise.resolve(0)
  ]);

  const statusSummary = {
    todo: 0,
    in_progress: 0,
    review: 0,
    completed: 0
  };

  for (const row of statusRows) {
    statusSummary[row._id] = row.count;
  }

  const completionRate =
    totalTasks === 0 ? 0 : Math.round((statusSummary.completed / totalTasks) * 100);

  res.json({
    stats: {
      projectCount,
      memberCount,
      totalTasks,
      completedTasks: statusSummary.completed,
      inProgressTasks: statusSummary.in_progress,
      overdueTasks,
      completionRate,
      statuses: statusSummary
    },
    recentTasks: serializeTasks(recentTasks),
    overdueItems: serializeTasks(overdueItems)
  });
}
