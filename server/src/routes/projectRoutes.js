import express from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/").get(getProjects).post(createProject);
router.route("/:id").get(getProject).patch(updateProject).delete(deleteProject);

export default router;
