import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageCircle, MoreHorizontal, Bookmark, Repeat2, Share2, Check } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "./Seal.jsx";
import CommentSection from "./CommentSection.jsx";

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default function PostCard({ post, onChanged, index = 0, nested = false }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [local, setLocal] = useState(post);
  const [busy, setBusy] = useState(false);
  const [repostBusy, setRepostBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // A repost is a thin wrapper: show who reposted, then render the real post inside.
  if (local.isRepost && local.originalPost) {
    const removeRepost = async () => {
      await api.delete(`/posts/${local._id}`);
      onChanged?.();
    };

    return (
      <div>
        <div className="flex items-center gap-2 text-ivory-dim text-xs mb-1.5 px-1">
          <Repeat2 size={14} />
          <Link to={`/u/${local.author?.handle}`} className="hover:text-ivory font-medium">
            {local.author?.handle}
          </Link>
          reposted
          {user && local.author?._id === user._id && (
            <button onClick={removeRepost} className="ml-auto hover:text-wine">
              Undo
            </button>
          )}
        </div>
        {local.body && <p className="text-sm text-ivory mb-2 px-1">{local.body}</p>}
        <PostCard post={local.originalPost} index={index} onChanged={onChanged} nested />
      </div>
    );
  }

  const liked = user && local.likes.includes(user._id);
  const isOwner = user && local.author?._id === user._id;

  const like = async () => {
    if (!user || busy) return;
    setBusy(true);
    setLocal((p) => ({
      ...p,
      likes: liked ? p.likes.filter((id) => id !== user._id) : [...p.likes, user._id],
    }));
    try {
      await api.post(`/posts/${local._id}/like`);
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    if (!user) return;
    setLocal((p) => ({ ...p, savedByMe: !p.savedByMe }));
    try {
      await api.post(`/posts/${local._id}/save`);
    } catch {
      setLocal((p) => ({ ...p, savedByMe: !p.savedByMe }));
    }
  };

  const repost = async () => {
    if (!user || repostBusy) return;
    setRepostBusy(true);
    try {
      const { data } = await api.post(`/posts/${local._id}/repost`);
      setLocal((p) => ({
        ...p,
        repostedByMe: data.reposted,
        repostCount: Math.max(0, (p.repostCount || 0) + (data.reposted ? 1 : -1)),
      }));
      // A repost creates (or removes) a real post elsewhere in the app — refresh
      // the list this card lives in so it's actually visible, not just a toggled icon.
      onChanged?.();
    } finally {
      setRepostBusy(false);
    }
  };

  const share = async () => {
    const url = `${window.location.origin}/p/${local._id}`;
    const shareData = {
      title: "MemeSprout",
      text: local.body ? local.body.slice(0, 120) : `${local.author?.handle}'s post on MemeSprout`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // person cancelled the native share sheet — no error needed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard blocked (e.g. insecure context) — nothing more we can do silently
    }
  };

  const remove = async () => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/posts/${local._id}`);
    onChanged?.();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className={nested ? "border border-hairline rounded-lg overflow-hidden" : "club-card overflow-hidden"}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Seal initials={local.author?.seal?.initials} hue={local.author?.seal?.hue} avatarUrl={local.author?.avatarUrl} size="sm" />
          <div>
            <Link to={`/u/${local.author?.handle}`} className="text-sm font-semibold text-ivory hover:text-gold-bright leading-tight">
              {local.author?.handle}
            </Link>
            <p className="text-ivory-dim text-xs">
              {local.author?.name} {local.author?.craft && `· ${local.author.craft}`} · {timeAgo(local.createdAt)}
            </p>
          </div>
        </div>
        {isOwner && (
          <button onClick={remove} aria-label="Post options" className="text-ivory-dim hover:text-ivory p-1">
            <MoreHorizontal size={18} />
          </button>
        )}
      </div>

      {local.imageUrl && (
        <img src={local.imageUrl} alt="" className="w-full max-h-[480px] object-cover border-y border-hairline" />
      )}

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={like}
            aria-label={liked ? "Unlike" : "Like"}
            className="transition-transform active:scale-90"
          >
            <Heart
              size={24}
              className={liked ? "fill-wine text-wine" : "text-ivory hover:text-ivory-dim"}
              strokeWidth={2}
            />
          </button>
          <button
            onClick={() => setShowComments((s) => !s)}
            aria-label="Comments"
            className="text-ivory hover:text-ivory-dim transition-colors"
          >
            <MessageCircle size={23} strokeWidth={2} />
          </button>
          <button
            onClick={repost}
            aria-label={local.repostedByMe ? "Undo repost" : "Repost"}
            disabled={repostBusy}
            className="flex items-center gap-1 transition-transform active:scale-90 disabled:opacity-50"
          >
            <Repeat2 size={23} strokeWidth={2} className={local.repostedByMe ? "text-emerald-500" : "text-ivory hover:text-ivory-dim"} />
            {local.repostCount > 0 && (
              <span className={`text-xs ${local.repostedByMe ? "text-emerald-500" : "text-ivory-dim"}`}>
                {local.repostCount}
              </span>
            )}
          </button>
          <div className="ml-auto flex items-center gap-4">
            <button onClick={share} aria-label="Share" className="relative transition-transform active:scale-90">
              {copied ? (
                <Check size={22} className="text-emerald-500" strokeWidth={2} />
              ) : (
                <Share2 size={22} className="text-ivory hover:text-ivory-dim" strokeWidth={2} />
              )}
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-[11px] font-medium bg-ivory text-ink px-2 py-1 rounded whitespace-nowrap">
                  Link copied
                </span>
              )}
            </button>
            <button
              onClick={save}
              aria-label={local.savedByMe ? "Unsave" : "Save"}
              className="transition-transform active:scale-90"
            >
              <Bookmark
                size={22}
                className={local.savedByMe ? "fill-ivory text-ivory" : "text-ivory hover:text-ivory-dim"}
                strokeWidth={2}
              />
            </button>
          </div>
        </div>

        {local.likes.length > 0 && (
          <p className="text-sm font-semibold text-ivory mt-2">
            {local.likes.length} {local.likes.length === 1 ? "like" : "likes"}
          </p>
        )}

        <p className="mt-1.5 text-sm text-ivory leading-relaxed whitespace-pre-wrap">
          <Link to={`/u/${local.author?.handle}`} className="font-semibold mr-1.5 hover:text-gold-bright">
            {local.author?.handle}
          </Link>
          {local.body}
        </p>

        {local.comments.length > 0 && !showComments && (
          <button
            onClick={() => setShowComments(true)}
            className="text-ivory-dim text-sm mt-1.5 hover:text-ivory"
          >
            View all {local.comments.length} {local.comments.length === 1 ? "comment" : "comments"}
          </button>
        )}

        {showComments && (
          <CommentSection post={local} onCommentsUpdated={(comments) => setLocal((p) => ({ ...p, comments }))} />
        )}
      </div>
    </motion.article>
  );
}
