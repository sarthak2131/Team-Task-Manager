import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw httpError(401, "Authentication required.");
    }

    const token = authorization.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      throw httpError(401, "User account no longer exists.");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function authorize(...roles) {
  return function roleGate(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      next(httpError(403, "You do not have access to perform this action."));
      return;
    }

    next();
  };
}
