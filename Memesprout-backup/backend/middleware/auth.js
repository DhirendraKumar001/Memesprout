import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer")) {
    try {
      token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, member not found" });
      }
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Not authorized, token invalid" });
    }
  }

  return res.status(401).json({ message: "Not authorized, no token provided" });
};

// Attaches req.user if a valid token is present, but never blocks the request.
// Used on public routes (feed, profiles) that behave differently for logged-in
// viewers (privacy checks, saved/liked/reposted state) without requiring login.
export const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer")) {
    try {
      const token = header.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      // invalid/expired token on a public route — just proceed as anonymous
    }
  }
  next();
};
