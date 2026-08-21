import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";
import Loader from "../components/Loader.jsx";

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/posts/${id}`);
      setPost(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "This post isn't available.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-10 py-10">
      <Link to="/" className="flex items-center gap-2 text-ivory-dim hover:text-ivory text-sm mb-6">
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      {loading && <Loader label="Loading post…" />}
      {error && !loading && (
        <div className="club-card p-10 text-center">
          <p className="font-semibold text-lg text-ivory mb-1">Post not found</p>
          <p className="text-ivory-dim text-sm">{error}</p>
        </div>
      )}
      {!loading && !error && post && <PostCard post={post} onChanged={load} />}
    </div>
  );
}
