import { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "./Seal.jsx";

export default function CreatePost({ onPosted }) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImage, setShowImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError("");
    try {
      const { data } = await api.post("/posts", { body, imageUrl });
      setBody("");
      setImageUrl("");
      setShowImage(false);
      onPosted(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post that.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="club-card p-5">
      <div className="flex gap-3">
        <Seal initials={user?.seal?.initials} hue={user?.seal?.hue} avatarUrl={user?.avatarUrl} />
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            maxLength={2000}
            className="field resize-none"
          />
          {showImage && (
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste an image URL (optional)"
              className="field mt-2 text-sm"
            />
          )}
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={() => setShowImage((s) => !s)}
              aria-label={showImage ? "Remove image" : "Add image"}
              className="flex items-center gap-1.5 text-sm text-ivory-dim hover:text-gold"
            >
              {showImage ? <X size={18} /> : <ImageIcon size={18} />}
              {showImage ? "Remove image" : "Photo"}
            </button>
            <button className="btn-gold text-sm" disabled={busy || !body.trim()}>
              {busy ? "Posting…" : "Post"}
            </button>
          </div>
          {error && <p className="text-wine text-xs mt-2">{error}</p>}
        </div>
      </div>
    </form>
  );
}
