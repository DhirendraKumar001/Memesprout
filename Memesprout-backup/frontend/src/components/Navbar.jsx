import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Home, Compass, MessageSquare, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../api/axios.js";
import Seal from "./Seal.jsx";

export default function Navbar() {
  const { user } = useAuth();
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

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-hairline">
      <div className="px-5 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-gold flex items-center justify-center text-white font-bold text-xs">
            N
          </span>
          <span className="font-display text-lg font-bold text-ivory">MemeSprout</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" aria-label="Home" className="text-ivory hover:text-gold">
            <Home size={22} />
          </Link>
          <Link to="/explore" aria-label="Explore" className="text-ivory hover:text-gold">
            <Compass size={22} />
          </Link>
          {user && (
            <>
              <Link to="/messages" aria-label="Messages" className="relative text-ivory hover:text-gold">
                <MessageSquare size={22} />
                {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-wine" />}
              </Link>
              <Link to="/settings" aria-label="Settings" className="text-ivory hover:text-gold">
                <Settings size={22} />
              </Link>
              <Link to={`/u/${user.handle}`} aria-label="My profile">
                <Seal initials={user.seal?.initials} hue={user.seal?.hue} avatarUrl={user.avatarUrl} size="sm" />
              </Link>
            </>
          )}
          {!user && (
            <Link to="/login" className="btn-gold !px-4 !py-1.5 text-xs">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
