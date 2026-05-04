import { User } from "../models/User.js";
import { httpError } from "../utils/httpError.js";

export async function listUsers(req, res) {
  const users = await User.find()
    .select("name email role createdAt updatedAt")
    .sort({ name: 1 });

  res.json({ users });
}

export async function updateUserRole(req, res) {
  const { userId } = req.params;
  const { role } = req.body;
  const targetUser = await User.findById(userId);

  if (!targetUser) {
    throw httpError(404, "User not found.");
  }

  if (targetUser.role === "admin" && role === "member") {
    const adminCount = await User.countDocuments({ role: "admin" });

    if (adminCount === 1) {
      throw httpError(400, "At least one admin account must remain.");
    }
  }

  targetUser.role = role;
  await targetUser.save();

  res.json({
    message: "User role updated successfully.",
    user: {
      _id: targetUser._id,
      name: targetUser.name,
      email: targetUser.email,
      role: targetUser.role,
      createdAt: targetUser.createdAt,
      updatedAt: targetUser.updatedAt
    }
  });
}
