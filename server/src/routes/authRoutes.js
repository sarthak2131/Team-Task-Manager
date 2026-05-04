import { Router } from "express";

import { login, me, signup } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginBodySchema, signupBodySchema } from "../validators/authValidators.js";

const router = Router();

router.post("/signup", validate({ body: signupBodySchema }), signup);
router.post("/login", validate({ body: loginBodySchema }), login);
router.get("/me", authenticate, me);

export default router;
