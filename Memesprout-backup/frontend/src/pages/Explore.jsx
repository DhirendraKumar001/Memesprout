import { useEffect, useState, useCallback } from "react";
import api from "../api/axios.js";
import UserCard from "../components/UserCard.jsx";
import Loader from "../components/Loader.jsx";

export default function Explore() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (query) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users?q=${encodeURIComponent(query)}`);
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(q), 300);
    return () => clearTimeout(t);
  }, [q, search]);

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
      <p className="eyebrow">Explore</p>
      <h1 className="font-display text-3xl font-bold mt-1 mb-6">Find people to follow</h1>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, handle, or craft…"
        className="field mb-8 max-w-lg"
      />

      {loading && <Loader label="Searching…" />}

      {!loading && users.length === 0 && (
        <p className="text-ivory-dim text-center py-10">No members match that search.</p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {users.map((u) => (
          <UserCard key={u._id} user={u} />
        ))}
      </div>
    </div>
  );
}
