import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const initialsFrom = (name) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

// @desc   Register a new member
// @route  POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, handle, email, password, craft } = req.body;

    if (!name || !handle || !email || !password) {
      return res.status(400).json({ message: "Name, handle, email and password are all required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { handle: handle.toLowerCase() }] });
    if (exists) {
      return res.status(400).json({ message: "That email or handle is already claimed" });
    }

    const hue = Math.floor(Math.random() * 40) + 30; // warm gold/bronze hue range

    const user = await User.create({
      name,
      handle: handle.toLowerCase(),
      email,
      password,
      craft: craft || "",
      seal: { initials: initialsFrom(name), hue },
    });

    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Login
// @route  POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }

    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc   Get current member
// @route  GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
};
