import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import Seal from "./Seal.jsx";

export default function RightRail() {
  const { user } = useAuth();
  const [arrivals, setArrivals] = useState([]);

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => {
        const list = data.users.filter((u) => u._id !== user?._id).slice(0, 5);
        setArrivals(list);
      })
      .catch(() => {});
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="club-card p-5">
        <p className="eyebrow mb-4">Suggested for you</p>
        {arrivals.length === 0 ? (
          <p className="text-ivory-dim text-sm">No suggestions yet.</p>
        ) : (
          <div className="space-y-3">
            {arrivals.map((a) => (
              <Link key={a._id} to={`/u/${a.handle}`} className="flex items-center gap-3 group">
                <Seal initials={a.seal?.initials} hue={a.seal?.hue} avatarUrl={a.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ivory group-hover:text-gold-bright truncate">{a.handle}</p>
                  <p className="text-ivory-dim text-xs truncate">
                    {a.name} {a.craft && `· ${a.craft}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link
          to="/explore"
          className="block mt-4 pt-4 border-t border-hairline text-sm font-semibold text-gold hover:text-gold-bright"
        >
          See all
        </Link>
      </div>

      <div className="club-card p-5">
        <p className="eyebrow mb-4">Community guidelines</p>
        <ul className="space-y-3 text-sm text-ivory-dim leading-relaxed">
          <li>Be honest — share what's actually true for you.</li>
          <li>Reply the way you'd want someone to reply to you.</li>
          <li>Credit the work you're building on.</li>
        </ul>
      </div>
    </div>
  );
}
