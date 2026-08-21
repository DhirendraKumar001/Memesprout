import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "../components/Seal.jsx";
import Loader from "../components/Loader.jsx";

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default function Messages() {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [thread, setThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const loadConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/messages/conversations");
      setConversations(data.conversations);
    } finally {
      setLoadingList(false);
    }
  }, []);

  const loadThread = useCallback(async (h, { silent = false } = {}) => {
    if (!h) {
      setThread(null);
      return;
    }
    // Only show the loading state on the initial open — background polling
    // must never unmount/remount the thread view, or the message input
    // loses focus and cursor position while the person is mid-sentence.
    if (!silent) setLoadingThread(true);
    try {
      const { data } = await api.get(`/messages/${h}`);
      setThread(data);
    } catch {
      if (!silent) setThread(null);
    } finally {
      if (!silent) setLoadingThread(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    prevMsgCountRef.current = 0;
    loadThread(handle);
  }, [handle, loadThread]);

  // Light polling so new messages show up without a full page refresh —
  // always silent so it never disrupts an in-progress reply.
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations();
      if (handle) loadThread(handle, { silent: true });
    }, 4000);
    return () => clearInterval(interval);
  }, [handle, loadConversations, loadThread]);

  useEffect(() => {
    const count = thread?.messages?.length || 0;
    if (count > prevMsgCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMsgCountRef.current = count;
  }, [thread]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !handle) return;
    setSending(true);
    try {
      await api.post(`/messages/${handle}`, { body: text });
      setText("");
      await loadThread(handle, { silent: true });
      await loadConversations();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto lg:px-10 py-0 lg:py-8">
      <div className="lg:grid lg:grid-cols-[320px_1fr] lg:gap-0 club-card lg:rounded-xl overflow-hidden lg:h-[calc(100vh-8rem)] rounded-none border-x-0 lg:border-x">
        {/* Conversation list */}
        <div className={`border-r border-hairline flex flex-col ${handle ? "hidden lg:flex" : "flex"}`}>
          <div className="px-5 py-4 border-b border-hairline">
            <h1 className="font-display text-lg font-bold">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingList && <Loader label="Loading conversations…" />}
            {!loadingList && conversations.length === 0 && (
              <p className="text-ivory-dim text-sm text-center py-10 px-4">
                No conversations yet. Visit someone's profile and send them a message.
              </p>
            )}
            {conversations.map((c) => (
              <Link
                key={c.user._id}
                to={`/messages/${c.user.handle}`}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-surface2 transition-colors ${
                  handle === c.user.handle ? "bg-surface2" : ""
                }`}
              >
                <Seal initials={c.user.seal?.initials} hue={c.user.seal?.hue} avatarUrl={c.user.avatarUrl} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ivory truncate">{c.user.name}</p>
                  <p className="text-xs text-ivory-dim truncate">
                    {c.lastFromMe ? "You: " : ""}
                    {c.lastMessage}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[11px] text-ivory-dim">{timeAgo(c.lastAt)}</span>
                  {c.unreadCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-gold" aria-label={`${c.unreadCount} unread`} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Thread */}
        <div className={`flex flex-col ${handle ? "flex" : "hidden lg:flex"}`}>
          {!handle && (
            <div className="flex-1 flex items-center justify-center text-ivory-dim text-sm">
              Select a conversation
            </div>
          )}

          {handle && loadingThread && <Loader label="Loading messages…" />}

          {handle && !loadingThread && thread && (
            <>
              <div className="px-5 py-4 border-b border-hairline flex items-center gap-3">
                <button onClick={() => navigate("/messages")} className="lg:hidden text-ivory-dim">
                  <ArrowLeft size={20} />
                </button>
                <Seal initials={thread.other.seal?.initials} hue={thread.other.seal?.hue} avatarUrl={thread.other.avatarUrl} size="sm" />
                <div>
                  <Link to={`/u/${thread.other.handle}`} className="text-sm font-semibold text-ivory hover:text-gold-bright">
                    {thread.other.name}
                  </Link>
                  <p className="text-xs text-ivory-dim">@{thread.other.handle}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
                {thread.messages.length === 0 && (
                  <p className="text-ivory-dim text-sm text-center py-10">
                    Say hello to {thread.other.name}.
                  </p>
                )}
                {thread.messages.map((m) => {
                  const fromMe = m.sender === user._id;
                  return (
                    <div key={m._id} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          fromMe ? "bg-gold text-white" : "bg-surface2 text-ivory"
                        }`}
                      >
                        {m.body}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              <form onSubmit={send} className="px-5 py-4 border-t border-hairline flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Write a message…"
                  className="field !py-2 text-sm"
                  maxLength={2000}
                />
                <button
                  aria-label="Send"
                  className="text-gold disabled:opacity-30 disabled:pointer-events-none shrink-0"
                  disabled={sending || !text.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
