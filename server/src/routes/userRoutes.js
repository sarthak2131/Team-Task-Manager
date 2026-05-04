import { Router } from "express";

import { listUsers, updateUserRole } from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateRoleBodySchema, userIdParamsSchema } from "../validators/userValidators.js";

const router = Router();

router.use(authenticate, authorize("admin"));
router.get("/", listUsers);
router.patch("/:userId/role", validate({ params: userIdParamsSchema, body: updateRoleBodySchema }), updateUserRole);

export default router;
