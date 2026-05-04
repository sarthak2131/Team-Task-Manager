import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "completed"],
      default: "todo"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    isOverdue: {
      type: Boolean,
      default: false
    },
    dueDate: {
      type: Date
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, dueDate: 1 });

export const Task = mongoose.model("Task", taskSchema);
