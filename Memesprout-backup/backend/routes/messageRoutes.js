import express from "express";
import { getConversations, getUnreadCount, getThread, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.get("/unread-count", getUnreadCount);
router.get("/:handle", getThread);
router.post("/:handle", sendMessage);

export default router;
