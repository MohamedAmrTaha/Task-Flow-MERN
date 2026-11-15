import mongoose from "mongoose";
const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      default: "todo",
      enum: ["todo", "in-progress", "done"],
    },
    priority: {
      type: String,
      default: "medium",
      enum: ["low", "medium", "high"],
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);
const Task = mongoose.model("Task", taskSchema);
export default Task;