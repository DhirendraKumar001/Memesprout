import Message from "../models/Message.js";
import User from "../models/User.js";

const SELECT_USER = "name handle seal avatarUrl";

// @desc   Get a list of conversations (most recent message with each person)
// @route  GET /api/messages/conversations
export const getConversations = async (req, res, next) => {
  try {
    const me = req.user._id;

    const conversations = await Message.aggregate([
      { $match: { $or: [{ sender: me }, { recipient: me }] } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", me] }, "$recipient", "$sender"],
          },
          lastMessage: { $first: "$body" },
          lastAt: { $first: "$createdAt" },
          lastSender: { $first: "$sender" },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$recipient", me] }, { $eq: ["$read", false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    const userIds = conversations.map((c) => c._id);
    const users = await User.find({ _id: { $in: userIds } }).select(SELECT_USER);
    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const result = conversations
      .filter((c) => userMap.has(String(c._id)))
      .map((c) => ({
        user: userMap.get(String(c._id)),
        lastMessage: c.lastMessage,
        lastAt: c.lastAt,
        lastFromMe: String(c.lastSender) === String(me),
        unreadCount: c.unreadCount,
      }));

    res.json({ conversations: result });
  } catch (err) {
    next(err);
  }
};

// @desc   Total unread message count (for a nav badge)
// @route  GET /api/messages/unread-count
export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ recipient: req.user._id, read: false });
    res.json({ count });
  } catch (err) {
    next(err);
  }
};

// @desc   Get the message thread with a specific member, marks their messages as read
// @route  GET /api/messages/:handle
export const getThread = async (req, res, next) => {
  try {
    const other = await User.findOne({ handle: req.params.handle.toLowerCase() }).select(SELECT_USER);
    if (!other) return res.status(404).json({ message: "No member found with that handle" });

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: other._id },
        { sender: other._id, recipient: req.user._id },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { sender: other._id, recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ other, messages });
  } catch (err) {
    next(err);
  }
};

// @desc   Send a message to a member
// @route  POST /api/messages/:handle
export const sendMessage = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Message can't be empty" });
    }

    const other = await User.findOne({ handle: req.params.handle.toLowerCase() });
    if (!other) return res.status(404).json({ message: "No member found with that handle" });
    if (other._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You can't message yourself" });
    }

    const message = await Message.create({
      sender: req.user._id,
      recipient: other._id,
      body: body.trim(),
    });

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};
