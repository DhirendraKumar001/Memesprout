import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import CreatePost from "../components/CreatePost.jsx";
import PostCard from "../components/PostCard.jsx";
import Loader from "../components/Loader.jsx";
import RightRail from "../components/RightRail.jsx";
import StoriesBar from "../components/StoriesBar.jsx";
import { Link } from "react-router-dom";

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async (pageNum = 1) => {
    try {
      const { data } = await api.get(`/posts?page=${pageNum}&limit=10`);
      setPosts((prev) => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setHasMore(data.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load the feed right now.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const loadMore = () => {
    setLoadingMore(true);
    loadFeed(page + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
      <div className="xl:grid xl:grid-cols-[1fr_320px] xl:gap-12">
        <div className="max-w-2xl w-full">
          <StoriesBar />

          {user ? (
            <div className="mb-6">
              <CreatePost onPosted={(post) => setPosts((prev) => [post, ...prev])} />
            </div>
          ) : (
            <div className="club-card p-6 mb-6 text-center">
              <p className="text-ivory-dim mb-3">Log in to post and comment.</p>
              <Link to="/login" className="btn-gold text-sm">
                Log in
              </Link>
            </div>
          )}

          {loading && <Loader label="Loading your feed…" />}
          {error && !loading && <p className="text-wine text-center py-10">{error}</p>}

          {!loading && !error && posts.length === 0 && (
            <div className="club-card p-10 text-center">
              <p className="font-semibold text-lg text-ivory mb-2">No posts yet</p>
              <p className="text-ivory-dim text-sm">Be the first to share something.</p>
            </div>
          )}

          <div className="space-y-4">
            {posts.map((post, i) => (
              <PostCard key={post._id} post={post} index={i} onChanged={() => loadFeed(1)} />
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <button onClick={loadMore} className="btn-ghost" disabled={loadingMore}>
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-8">
            <RightRail />
          </div>
        </aside>
      </div>
    </div>
  );
}
