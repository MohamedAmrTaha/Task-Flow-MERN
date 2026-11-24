import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findOwnedProject = (projectId, userId) => {
  if (!mongoose.isValidObjectId(projectId)) return null;
  return Project.findOne({ _id: projectId, owner: userId });
};

const findOwnedTask = async (taskId, userId) => {
  if (!mongoose.isValidObjectId(taskId)) return null;
  const task = await Task.findById(taskId);
  if (!task) return null;
  const project = await Project.exists({ _id: task.project, owner: userId });
  return project ? task : null;
};

export const getTasks = async (req, res) => {
  const project = await findOwnedProject(req.params.projectId, req.user._id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  // Query values can be arrays (?search=a&search=b), so only accept strings.
  const { search, status, priority } = req.query;
  const filter = { project: project._id };
  if (typeof status === "string" && status) filter.status = status;
  if (typeof priority === "string" && priority) filter.priority = priority;
  if (typeof search === "string" && search) {
    filter.title = { $regex: escapeRegex(search), $options: "i" };
  }
  const tasks = await Task.find(filter).sort({ createdAt: 1 });
  res.json(tasks);
};

export const createTask = async (req, res) => {
  const project = await findOwnedProject(req.params.projectId, req.user._id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  const { title, description, status, priority, dueDate } = req.body;
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ message: "Task title is required" });
  }
  const task = await Task.create({
    project: project._id, // from the verified project, never from the body
    title,
    description,
    status,
    priority,
    dueDate,
  });
  res.status(201).json(task);
};

export const updateTask = async (req, res) => {
  const task = await findOwnedTask(req.params.taskId, req.user._id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  const { title, description, status, priority, dueDate } = req.body;
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  await task.save();
  res.json(task);
};

export const deleteTask = async (req, res) => {
  const task = await findOwnedTask(req.params.taskId, req.user._id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  await task.deleteOne();
  res.status(204).end();
};
