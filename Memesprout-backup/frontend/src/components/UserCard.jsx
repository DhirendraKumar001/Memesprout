import { Link } from "react-router-dom";
import Seal from "./Seal.jsx";

export default function UserCard({ user }) {
  return (
    <Link
      to={`/u/${user.handle}`}
      className="club-card p-4 flex items-center gap-3 hover:border-gold transition-colors"
    >
      <Seal initials={user.seal?.initials} hue={user.seal?.hue} avatarUrl={user.avatarUrl} />
      <div className="min-w-0">
        <p className="font-semibold text-base text-ivory truncate">{user.name}</p>
        <p className="text-ivory-dim text-xs truncate">
          @{user.handle} {user.craft && `· ${user.craft}`}
        </p>
      </div>
    </Link>
  );
}
