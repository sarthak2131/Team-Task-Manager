import { ZodError } from "zod";

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    next(error);
    return;
  }

  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed.",
      issues: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message
      }))
    });
    return;
  }

  if (error.name === "CastError") {
    res.status(400).json({ message: "Invalid identifier provided." });
    return;
  }

  if (error.code === 11000) {
    res.status(409).json({ message: "A record with that value already exists." });
    return;
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    res.status(401).json({ message: "Your session is invalid or has expired." });
    return;
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error.";

  res.status(statusCode).json({ message });
}
