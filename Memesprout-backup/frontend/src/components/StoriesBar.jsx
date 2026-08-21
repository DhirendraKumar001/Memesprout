import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "./Seal.jsx";

export default function StoriesBar() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setMembers(data.users.slice(0, 12)))
      .catch(() => {});
  }, []);

  if (members.length === 0) return null;

  return (
    <div className="club-card p-4 mb-6">
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-none">
        {members.map((m) => (
          <Link key={m._id} to={`/u/${m.handle}`} className="flex flex-col items-center gap-1.5 shrink-0 w-16">
            <span className="p-[2px] rounded-full bg-gradient-to-tr from-gold via-gold-bright to-gold">
              <span className="block p-[2px] rounded-full bg-surface">
                <Seal initials={m.seal?.initials} hue={m.seal?.hue} avatarUrl={m.avatarUrl} size="md" />
              </span>
            </span>
            <span className="text-[11px] text-ivory-dim truncate w-full text-center">
              {m._id === user?._id ? "You" : m.handle}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
