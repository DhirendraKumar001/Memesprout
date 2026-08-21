import express from "express";
import { getProfile, updateProfile, followUser, searchUsers, getSavedPosts } from "../controllers/userController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", searchUsers);
router.get("/me/saved", protect, getSavedPosts);
router.put("/me", protect, updateProfile);
router.post("/:handle/follow", protect, followUser);
router.get("/:handle", optionalAuth, getProfile);

export default router;
