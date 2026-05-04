import { Router } from "express";

import {
  createProject,
  deleteProject,
  getProjectById,
  listProjects,
  updateProject
} from "../controllers/projectController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createProjectBodySchema,
  projectIdParamsSchema,
  updateProjectBodySchema
} from "../validators/projectValidators.js";

const router = Router();

router.use(authenticate);
router.get("/", listProjects);
router.get("/:projectId", validate({ params: projectIdParamsSchema }), getProjectById);
router.post("/", authorize("admin"), validate({ body: createProjectBodySchema }), createProject);
router.patch(
  "/:projectId",
  authorize("admin"),
  validate({ params: projectIdParamsSchema, body: updateProjectBodySchema }),
  updateProject
);
router.delete("/:projectId", authorize("admin"), validate({ params: projectIdParamsSchema }), deleteProject);

export default router;
