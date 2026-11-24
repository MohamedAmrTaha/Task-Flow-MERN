import express from "express";
import { updateTask, deleteTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.route("/:taskId").patch(updateTask).delete(deleteTask);

export default router;
