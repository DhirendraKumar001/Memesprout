import User from "../models/User.js";
import Post from "../models/Post.js";
import { attachPostMeta } from "../utils/postMeta.js";
import { POPULATE_AUTHOR, ORIGINAL_POPULATE } from "./postController.js";

// @desc   Get a member's public profile by handle. Posts are hidden if the
//         account is private and the viewer isn't the owner or a follower.
// @route  GET /api/users/:handle
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ handle: req.params.handle.toLowerCase() })
      .populate("followers", "name handle seal avatarUrl")
      .populate("following", "name handle seal avatarUrl");

    if (!user) return res.status(404).json({ message: "No member found with that handle" });

    const viewerId = req.user?._id;
    const isOwner = viewerId && String(user._id) === String(viewerId);
    const isFollower = viewerId && user.followers.some((f) => String(f._id) === String(viewerId));
    const restricted = user.isPrivate && !isOwner && !isFollower;

    let posts = [];
    if (!restricted) {
      const raw = await Post.find({ author: user._id })
        .sort({ createdAt: -1 })
        .populate("author", POPULATE_AUTHOR)
        .populate("comments.author", POPULATE_AUTHOR)
        .populate(ORIGINAL_POPULATE)
        .lean();
      posts = await attachPostMeta(raw, viewerId);
    }

    res.json({ user, posts, restricted, isFollower, isOwner });
  } catch (err) {
    next(err);
  }
};

// @desc   Update own profile (bio, craft, name, privacy, theme, avatar)
// @route  PUT /api/users/me
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, craft, isPrivate, theme, avatarUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (craft !== undefined) user.craft = craft;
    if (isPrivate !== undefined) user.isPrivate = !!isPrivate;
    if (theme !== undefined && ["light", "dark", "system"].includes(theme)) user.theme = theme;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

// @desc   Follow a member
// @route  POST /api/users/:handle/follow
export const followUser = async (req, res, next) => {
  try {
    const target = await User.findOne({ handle: req.params.handle.toLowerCase() });
    if (!target) return res.status(404).json({ message: "No member found with that handle" });
    if (target._id.equals(req.user._id)) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const already = target.followers.some((id) => id.equals(req.user._id));
    if (already) {
      target.followers = target.followers.filter((id) => !id.equals(req.user._id));
      req.user.following = req.user.following.filter((id) => !id.equals(target._id));
    } else {
      target.followers.push(req.user._id);
      req.user.following.push(target._id);
    }

    await target.save();
    await req.user.save();

    res.json({ following: !already, followerCount: target.followers.length });
  } catch (err) {
    next(err);
  }
};

// @desc   Search members by name, handle, or craft
// @route  GET /api/users?q=
export const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { handle: { $regex: q, $options: "i" } },
            { craft: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(filter).limit(30).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// @desc   Get the current user's saved (bookmarked) posts
// @route  GET /api/users/me/saved
export const getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("savedPosts");
    const raw = await Post.find({ _id: { $in: user.savedPosts } })
      .sort({ createdAt: -1 })
      .populate("author", POPULATE_AUTHOR)
      .populate("comments.author", POPULATE_AUTHOR)
      .populate(ORIGINAL_POPULATE)
      .lean();
    const posts = await attachPostMeta(raw, req.user._id);
    res.json({ posts });
  } catch (err) {
    next(err);
  }
};
