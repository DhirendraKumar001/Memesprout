import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, User, LogOut, MessageSquare, Bookmark, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Seal from "./Seal.jsx";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const check = () => {
      api
        .get("/messages/unread-count")
        .then(({ data }) => setUnread(data.count))
        .catch(() => {});
    };
    check();
    const interval = setInterval(check, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 px-3 py-3 rounded-lg text-[15px] transition-colors relative ${
      isActive ? "font-semibold text-ivory bg-surface2" : "text-ivory-dim hover:bg-surface2 hover:text-ivory"
    }`;

  return (
    <aside className="hidden lg:flex flex-col sticky top-0 h-screen w-64 shrink-0 border-r border-hairline bg-surface px-4 py-8">
      <Link to="/" className="flex items-center gap-2 px-3 mb-8">
        <span className="w-7 h-7 rounded-lg bg-gold flex items-center justify-center text-white font-bold text-sm">
          N
        </span>
        <span className="font-display text-xl font-bold text-ivory">MemeSprout</span>
      </Link>

      <nav className="flex flex-col gap-1">
        <NavLink to="/" className={linkClass} end>
          <Home size={24} strokeWidth={2} />
          Home
        </NavLink>
        <NavLink to="/explore" className={linkClass}>
          <Compass size={24} strokeWidth={2} />
          Explore
        </NavLink>
        {user && (
          <>
            <NavLink to="/messages" className={linkClass}>
              <span className="relative">
                <MessageSquare size={24} strokeWidth={2} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-wine" />
                )}
              </span>
              Messages
            </NavLink>
            <NavLink to="/saved" className={linkClass}>
              <Bookmark size={24} strokeWidth={2} />
              Saved
            </NavLink>
            <NavLink to={`/u/${user.handle}`} className={linkClass}>
              <User size={24} strokeWidth={2} />
              Profile
            </NavLink>
            <NavLink to="/settings" className={linkClass}>
              <Settings size={24} strokeWidth={2} />
              Settings
            </NavLink>
          </>
        )}
      </nav>

      <div className="mt-auto pt-4 border-t border-hairline">
        {user ? (
          <div className="flex items-center gap-3 px-3 py-2">
            <Link to={`/u/${user.handle}`} aria-label="My profile">
              <Seal initials={user.seal?.initials} hue={user.seal?.hue} avatarUrl={user.avatarUrl} size="md" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ivory truncate">{user.name}</p>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex items-center gap-1 text-xs text-ivory-dim hover:text-wine transition-colors mt-0.5"
              >
                <LogOut size={13} />
                Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 px-3">
            <Link to="/login" className="btn-ghost text-sm w-full">
              Log in
            </Link>
            <Link to="/register" className="btn-gold text-sm w-full">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
