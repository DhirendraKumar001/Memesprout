import Post from "../models/Post.js";
import User from "../models/User.js";

// Attaches `savedByMe`, `repostedByMe`, and `repostCount` to each post for the
// given viewer, INCLUDING each post's nested `originalPost` (when the post is
// itself a repost wrapper) — otherwise the real, interactive content shown
// inside a repost always reads as un-saved/un-reposted regardless of the
// viewer's actual state. Works on plain objects (call .lean() or .toObject()
// first). viewerId may be undefined for anonymous viewers.
export const attachPostMeta = async (posts, viewerId) => {
  if (posts.length === 0) return posts;

  // Collect ids for both the top-level posts and any nested originals.
  const targets = [];
  posts.forEach((p) => {
    targets.push(p);
    if (p.originalPost) targets.push(p.originalPost);
  });
  const ids = targets.map((p) => p._id);

  const repostCounts = await Post.aggregate([
    { $match: { isRepost: true, originalPost: { $in: ids } } },
    { $group: { _id: "$originalPost", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(repostCounts.map((r) => [String(r._id), r.count]));

  let savedSet = new Set();
  let myRepostsSet = new Set();

  if (viewerId) {
    const viewer = await User.findById(viewerId).select("savedPosts");
    savedSet = new Set((viewer?.savedPosts || []).map(String));

    const myReposts = await Post.find({
      author: viewerId,
      isRepost: true,
      originalPost: { $in: ids },
    }).select("originalPost");
    myRepostsSet = new Set(myReposts.map((r) => String(r.originalPost)));
  }

  const attach = (p) => ({
    ...p,
    repostCount: countMap.get(String(p._id)) || 0,
    savedByMe: savedSet.has(String(p._id)),
    repostedByMe: myRepostsSet.has(String(p._id)),
  });

  return posts.map((p) => {
    const withMeta = attach(p);
    if (p.originalPost) withMeta.originalPost = attach(p.originalPost);
    return withMeta;
  });
};

// If a post is itself a repost, resolve down to the real underlying post —
// prevents repost-of-a-repost chains from ever being created.
export const resolveOriginal = async (postId) => {
  const post = await Post.findById(postId);
  if (!post) return null;
  if (post.isRepost && post.originalPost) {
    return Post.findById(post.originalPost);
  }
  return post;
};
