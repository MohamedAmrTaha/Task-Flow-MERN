import mongoose from "mongoose";
const projectSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    color: {
      type: String,
      default: "indigo",
      enum: ["indigo", "emerald", "rose", "amber", "sky", "violet"],
    },
  },
  { timestamps: true },
);
const Project = mongoose.model("Project", projectSchema);
export default Project;