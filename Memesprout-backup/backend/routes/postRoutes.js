import express from "express";
import { getFeed, createPost, deletePost, toggleLike, toggleSave, toggleRepost, addComment, getPostById } from "../controllers/postController.js";
import { protect, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", optionalAuth, getFeed);
router.post("/", protect, createPost);
router.get("/:id", optionalAuth, getPostById);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/save", protect, toggleSave);
router.post("/:id/repost", protect, toggleRepost);
router.post("/:id/comments", protect, addComment);

export default router;
