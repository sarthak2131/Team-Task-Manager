import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  listTasks,
  updateTask
} from "../controllers/taskController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createTaskBodySchema,
  taskIdParamsSchema,
  taskQuerySchema,
  updateTaskBodySchema
} from "../validators/taskValidators.js";

const router = Router();

router.use(authenticate);
router.get("/", validate({ query: taskQuerySchema }), listTasks);
router.get("/:taskId", validate({ params: taskIdParamsSchema }), getTaskById);
router.post("/", authorize("admin"), validate({ body: createTaskBodySchema }), createTask);
router.patch("/:taskId", validate({ params: taskIdParamsSchema, body: updateTaskBodySchema }), updateTask);
router.delete("/:taskId", authorize("admin"), validate({ params: taskIdParamsSchema }), deleteTask);

export default router;
