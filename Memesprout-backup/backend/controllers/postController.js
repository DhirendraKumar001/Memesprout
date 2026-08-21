import Post from "../models/Post.js";
import { attachPostMeta, resolveOriginal } from "../utils/postMeta.js";

const POPULATE_AUTHOR = "name handle seal craft isPrivate avatarUrl";
const ORIGINAL_POPULATE = {
  path: "originalPost",
  populate: [
    { path: "author", select: POPULATE_AUTHOR },
    { path: "comments.author", select: POPULATE_AUTHOR },
  ],
};

// Removes posts by private accounts unless the viewer is the author or a follower.
const filterPrivate = (posts, viewerId) => {
  return posts.filter((p) => {
    const author = p.author;
    if (!author?.isPrivate) return true;
    if (viewerId && String(author._id) === String(viewerId)) return true;
    if (viewerId && author.followers?.some((f) => String(f) === String(viewerId))) return true;
    return false;
  });
};

const stripFollowers = (posts) => {
  posts.forEach((p) => {
    if (p.author) delete p.author.followers;
    if (p.originalPost?.author) delete p.originalPost.author.followers;
  });
  return posts;
};

// @desc   Get feed — latest posts from everyone, newest first (private accounts hidden
//         from non-followers)
// @route  GET /api/posts?page=&limit=
export const getFeed = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 30);
    const viewerId = req.user?._id;

    // Over-fetch a bit since private-account posts get filtered out after the query.
    const raw = await Post.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit * 2)
      .populate({ path: "author", select: `${POPULATE_AUTHOR} followers` })
      .populate("comments.author", POPULATE_AUTHOR)
      .populate(ORIGINAL_POPULATE)
      .lean();

    let posts = filterPrivate(raw, viewerId).slice(0, limit);
    posts = await attachPostMeta(posts, viewerId);
    stripFollowers(posts);

    const total = await Post.countDocuments({});

    res.json({ posts, page, hasMore: page * limit < total, total });
  } catch (err) {
    next(err);
  }
};

// @desc   Create a new post
// @route  POST /api/posts
export const createPost = async (req, res, next) => {
  try {
    const { body, imageUrl } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "A post needs some words in it" });
    }

    const post = await Post.create({
      author: req.user._id,
      body: body.trim(),
      imageUrl: imageUrl || "",
      hour: new Date().getHours(),
    });

    await post.populate("author", POPULATE_AUTHOR);
    res.status(201).json({ post: { ...post.toObject(), repostCount: 0, savedByMe: false, repostedByMe: false } });
  } catch (err) {
    next(err);
  }
};

// @desc   Delete own post (or own repost)
// @route  DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.author.equals(req.user._id)) {
      return res.status(403).json({ message: "You can only remove your own posts" });
    }
    await post.deleteOne();
    res.json({ message: "Post removed" });
  } catch (err) {
    next(err);
  }
};

// @desc   Toggle like on a post
// @route  POST /api/posts/:id/like
export const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const already = post.likes.some((id) => id.equals(req.user._id));
    if (already) {
      post.likes = post.likes.filter((id) => !id.equals(req.user._id));
    } else {
      post.likes.push(req.user._id);
    }
    await post.save();

    res.json({ liked: !already, likeCount: post.likes.length });
  } catch (err) {
    next(err);
  }
};

// @desc   Toggle save (bookmark) on a post
// @route  POST /api/posts/:id/save
export const toggleSave = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const user = req.user;
    const already = user.savedPosts.some((id) => id.equals(post._id));
    if (already) {
      user.savedPosts = user.savedPosts.filter((id) => !id.equals(post._id));
    } else {
      user.savedPosts.push(post._id);
    }
    await user.save();

    res.json({ saved: !already });
  } catch (err) {
    next(err);
  }
};

// @desc   Toggle repost. Reposting a repost resolves to the original to avoid chains.
// @route  POST /api/posts/:id/repost
export const toggleRepost = async (req, res, next) => {
  try {
    const original = await resolveOriginal(req.params.id);
    if (!original) return res.status(404).json({ message: "Post not found" });

    const existing = await Post.findOne({
      author: req.user._id,
      isRepost: true,
      originalPost: original._id,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ reposted: false });
    }

    const repost = await Post.create({
      author: req.user._id,
      body: (req.body.comment || "").trim(),
      isRepost: true,
      originalPost: original._id,
      hour: new Date().getHours(),
    });

    await repost.populate("author", POPULATE_AUTHOR);
    await repost.populate(ORIGINAL_POPULATE);

    const [withMeta] = await attachPostMeta([repost.toObject()], req.user._id);
    res.status(201).json({ reposted: true, post: withMeta });
  } catch (err) {
    next(err);
  }
};

// @desc   Get a single post by id (for the shareable permalink page).
//         404s if the post doesn't exist or belongs to a private account
//         the viewer can't see.
// @route  GET /api/posts/:id
export const getPostById = async (req, res, next) => {
  try {
    const raw = await Post.findById(req.params.id)
      .populate({ path: "author", select: `${POPULATE_AUTHOR} followers` })
      .populate("comments.author", POPULATE_AUTHOR)
      .populate(ORIGINAL_POPULATE)
      .lean();

    if (!raw) return res.status(404).json({ message: "Post not found" });

    const viewerId = req.user?._id;
    const [visible] = filterPrivate([raw], viewerId);
    if (!visible) return res.status(404).json({ message: "Post not found" });

    const [withMeta] = await attachPostMeta([visible], viewerId);
    stripFollowers([withMeta]);

    res.json({ post: withMeta });
  } catch (err) {
    next(err);
  }
};

// @desc   Add a comment to a post
// @route  POST /api/posts/:id/comments
export const addComment = async (req, res, next) => {
  try {
    const { body } = req.body;
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Say something before you send it" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ author: req.user._id, body: body.trim() });
    await post.save();
    await post.populate("comments.author", POPULATE_AUTHOR);

    res.status(201).json({ comments: post.comments });
  } catch (err) {
    next(err);
  }
};

export { POPULATE_AUTHOR, ORIGINAL_POPULATE, filterPrivate, stripFollowers };
