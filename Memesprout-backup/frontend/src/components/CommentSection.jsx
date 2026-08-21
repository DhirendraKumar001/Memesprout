import { useState } from "react";
import { Send } from "lucide-react";
import api from "../api/axios.js";
import Seal from "./Seal.jsx";

export default function CommentSection({ post, onCommentsUpdated }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post(`/posts/${post._id}/comments`, { body: text });
      onCommentsUpdated(data.comments);
      setText("");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send that. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-hairline space-y-3">
      {post.comments.length === 0 && (
        <p className="text-ivory-dim text-sm">No comments yet.</p>
      )}
      {post.comments.map((c) => (
        <div key={c._id} className="flex gap-3">
          <Seal initials={c.author?.seal?.initials} hue={c.author?.seal?.hue} avatarUrl={c.author?.avatarUrl} size="sm" />
          <div>
            <p className="text-sm">
              <span className="text-ivory font-semibold">{c.author?.handle}</span>{" "}
              <span className="text-ivory-dim">{c.body}</span>
            </p>
          </div>
        </div>
      ))}

      <form onSubmit={submit} className="flex items-center gap-2 pt-1">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          className="field !py-2 text-sm !bg-transparent !border-0 !border-t-0 px-0 focus:!bg-transparent"
          maxLength={500}
        />
        <button
          aria-label="Post comment"
          className="text-gold font-semibold text-sm disabled:opacity-30 disabled:pointer-events-none"
          disabled={busy || !text.trim()}
        >
          <Send size={18} />
        </button>
      </form>
      {error && <p className="text-wine text-xs">{error}</p>}
    </div>
  );
}
