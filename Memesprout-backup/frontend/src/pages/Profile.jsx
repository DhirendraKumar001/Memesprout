import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, MessageSquare, Camera, X } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "../components/Seal.jsx";
import PostCard from "../components/PostCard.jsx";
import Loader from "../components/Loader.jsx";

const MAX_AVATAR_BYTES = 3 * 1024 * 1024; // 3MB raw file cap

export default function Profile() {
  const { handle } = useParams();
  const { user: me, setUser: setMe } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: "", craft: "", avatarUrl: "" });
  const [followBusy, setFollowBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: res } = await api.get(`/users/${handle}`);
      setData(res);
      setForm({ bio: res.user.bio || "", craft: res.user.craft || "", avatarUrl: res.user.avatarUrl || "" });
    } catch (err) {
      setError(err.response?.data?.message || "User not found.");
    } finally {
      setLoading(false);
    }
  }, [handle]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Loader label="Loading profile…" />;
  if (error) return <p className="text-wine text-center py-20">{error}</p>;
  if (!data) return null;

  const { user, posts, restricted } = data;
  const isMe = me && me._id === user._id;
  const isFollowing = me && user.followers.some((f) => f._id === me._id);

  const saveProfile = async (e) => {
    e.preventDefault();
    const { data: res } = await api.put("/users/me", form);
    setMe(res.user);
    setEditing(false);
    load();
  };

  const toggleFollow = async () => {
    if (!me) return;
    setFollowBusy(true);
    try {
      await api.post(`/users/${user.handle}/follow`);
      load();
    } finally {
      setFollowBusy(false);
    }
  };

  const onAvatarPicked = (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again later
    if (!file) return;
    setAvatarError("");

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("That image is too large — please pick one under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, avatarUrl: reader.result }));
    reader.onerror = () => setAvatarError("Couldn't read that file — try a different image.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-10">
        <div className="lg:sticky lg:top-10 lg:self-start">
          <div className="club-card p-6 mb-8 lg:mb-0">
            <div className="flex flex-col items-start gap-4">
              <div className="relative">
                <Seal
                  initials={user.seal?.initials}
                  hue={user.seal?.hue}
                  avatarUrl={editing ? form.avatarUrl : user.avatarUrl}
                  size="xl"
                />
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Change photo"
                      className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold text-white flex items-center justify-center shadow-card hover:bg-gold-bright transition-colors"
                    >
                      <Camera size={15} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onAvatarPicked}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {editing && form.avatarUrl && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, avatarUrl: "" }))}
                  className="flex items-center gap-1 text-xs text-ivory-dim hover:text-wine -mt-2"
                >
                  <X size={12} />
                  Remove photo
                </button>
              )}
              {editing && avatarError && <p className="text-wine text-xs -mt-2">{avatarError}</p>}

              <div className="min-w-0 w-full">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-display text-2xl font-bold">{user.name}</h1>
                  {user.isPrivate && <Lock size={16} className="text-ivory-dim" />}
                </div>
                <p className="text-ivory-dim text-sm">
                  @{user.handle} {user.craft && `· ${user.craft}`}
                </p>
                {user.bio && <p className="text-ivory mt-2 leading-relaxed">{user.bio}</p>}
                <div className="flex gap-5 mt-4 text-sm text-ivory-dim">
                  <span>
                    <strong className="text-ivory">{user.followers.length}</strong> followers
                  </span>
                  <span>
                    <strong className="text-ivory">{user.following.length}</strong> following
                  </span>
                  <span>
                    <strong className="text-ivory">{posts.length}</strong> posts
                  </span>
                </div>
              </div>

              {isMe ? (
                <button
                  onClick={() => {
                    setForm({ bio: user.bio || "", craft: user.craft || "", avatarUrl: user.avatarUrl || "" });
                    setAvatarError("");
                    setEditing((s) => !s);
                  }}
                  className="btn-ghost text-xs w-full"
                >
                  {editing ? "Cancel" : "Edit profile"}
                </button>
              ) : me ? (
                <div className="flex gap-2 w-full">
                  <button
                    onClick={toggleFollow}
                    disabled={followBusy}
                    className={isFollowing ? "btn-ghost text-xs flex-1" : "btn-gold text-xs flex-1"}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                  <Link
                    to={`/messages/${user.handle}`}
                    aria-label="Message"
                    className="btn-ghost text-xs px-3 shrink-0"
                  >
                    <MessageSquare size={16} />
                  </Link>
                </div>
              ) : null}
            </div>

            {editing && (
              <form onSubmit={saveProfile} className="mt-5 pt-5 border-t border-hairline space-y-3">
                <div>
                  <label className="eyebrow block mb-1.5">Craft</label>
                  <input className="field" value={form.craft} onChange={(e) => setForm({ ...form, craft: e.target.value })} />
                </div>
                <div>
                  <label className="eyebrow block mb-1.5">Bio</label>
                  <textarea
                    className="field resize-none"
                    rows={3}
                    maxLength={220}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
                <button className="btn-gold text-sm w-full">Save changes</button>
              </form>
            )}
          </div>
        </div>

        <div className="max-w-2xl">
          {restricted ? (
            <div className="club-card p-10 text-center">
              <Lock size={28} className="mx-auto mb-3 text-ivory-dim" />
              <p className="font-semibold text-lg text-ivory mb-1">This account is private</p>
              <p className="text-ivory-dim text-sm">Follow @{user.handle} to see their posts.</p>
            </div>
          ) : (
            <>
              <p className="eyebrow mb-4">Posts</p>
              {posts.length === 0 ? (
                <p className="text-ivory-dim text-sm">Nothing posted yet.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post, i) => (
                    <PostCard key={post._id} post={post} index={i} onChanged={load} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
