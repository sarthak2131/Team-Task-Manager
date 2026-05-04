import { User } from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import { httpError } from "../utils/httpError.js";

function serializeUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function signup(req, res) {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw httpError(409, "An account with this email already exists.");
  }

  const userCount = await User.countDocuments();
  const role = userCount === 0 ? "admin" : "member";

  const user = await User.create({
    name,
    email,
    password,
    role
  });

  res.status(201).json({
    message:
      role === "admin"
        ? "Account created. This first user has been granted admin access."
        : "Account created successfully.",
    token: generateToken(user._id),
    user: serializeUser(user)
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw httpError(401, "Invalid email or password.");
  }

  res.json({
    message: "Login successful.",
    token: generateToken(user._id),
    user: serializeUser(user)
  });
}

export async function me(req, res) {
  res.json({
    user: serializeUser(req.user)
  });
}
