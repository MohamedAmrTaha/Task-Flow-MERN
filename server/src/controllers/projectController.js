import mongoose from "mongoose";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const createProject = async (req, res) => {
  const { name, description, color } = req.body;
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "Project name is required" });
  }
  const project = new Project({
    name,
    description,
    color,
    owner: req.user._id,
  });
  await project.save();
  res.status(201).json(project);
};

export const getProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Project not found" });
  }
  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.status(200).json(project);
};

export const updateProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Project not found" });
  }
  // Allowlist: only these fields can be changed (blocks mass assignment,
  // e.g. a client sending { owner: "..." }). Fields not sent are untouched.
  const updates = {};
  for (const key of ["name", "description", "color"]) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { new: true, runValidators: true },
  );
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.status(200).json(project);
};

export const deleteProject = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ message: "Project not found" });
  }
  const project = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  await Task.deleteMany({ project: project._id });
  res.status(204).end();
};

export const getProjects = async (req, res) => {
  const projects = await Project.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .lean();
  const counts = await Task.aggregate([
    { $match: { project: { $in: projects.map((p) => p._id) } } },
    {
      $group: {
        _id: "$project",
        taskCount: { $sum: 1 },
        doneCount: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
      },
    },
  ]);

  // Projects with no tasks have no row in `counts`, so default them to 0.
  const countMap = {};
  for (const c of counts) countMap[c._id.toString()] = c;

  const result = projects.map((p) => {
    const c = countMap[p._id.toString()];
    return {
      ...p,
      taskCount: c?.taskCount ?? 0,
      doneCount: c?.doneCount ?? 0,
    };
  });

  res.status(200).json(result);
};
