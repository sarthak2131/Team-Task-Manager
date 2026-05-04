import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 80
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },
    dueDate: {
      type: Date
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ]
  },
  {
    timestamps: true
  }
);

projectSchema.index({ owner: 1 });
projectSchema.index({ members: 1 });

export const Project = mongoose.model("Project", projectSchema);
