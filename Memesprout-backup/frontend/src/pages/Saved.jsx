import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import PostCard from "../components/PostCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Saved() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/users/me/saved");
      setPosts(data.posts);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load your saved posts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-10 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Saved</h1>

      {loading && <Loader label="Loading saved posts…" />}
      {error && !loading && <p className="text-wine text-center py-10">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <div className="club-card p-10 text-center">
          <p className="font-semibold text-lg text-ivory mb-2">Nothing saved yet</p>
          <p className="text-ivory-dim text-sm">Tap the bookmark icon on any post to save it here.</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post, i) => (
          <PostCard key={post._id} post={post} index={i} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
