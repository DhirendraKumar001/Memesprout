import { useState } from "react";
import { Sun, Moon, Monitor, Lock, Globe, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Settings() {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  const togglePrivacy = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await api.put("/users/me", { isPrivate: !user.isPrivate });
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't update that setting.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-10 py-10">
      <h1 className="font-display text-3xl font-bold mb-8">Settings</h1>

      <section className="club-card p-6 mb-6">
        <p className="eyebrow mb-4">Appearance</p>
        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 py-4 rounded-lg border transition-colors ${
                theme === value
                  ? "border-gold bg-surface2 text-ivory"
                  : "border-hairline text-ivory-dim hover:bg-surface2"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {user && (
        <section className="club-card p-6 mb-6">
          <p className="eyebrow mb-4">Privacy</p>
          <button
            onClick={togglePrivacy}
            disabled={busy}
            className="w-full flex items-center justify-between gap-4 py-2 disabled:opacity-50"
          >
            <div className="flex items-center gap-3 text-left">
              {user.isPrivate ? (
                <Lock size={20} className="text-ivory-dim shrink-0" />
              ) : (
                <Globe size={20} className="text-ivory-dim shrink-0" />
              )}
              <div>
                <p className="text-sm font-semibold text-ivory">
                  {user.isPrivate ? "Private account" : "Public account"}
                </p>
                <p className="text-xs text-ivory-dim mt-0.5">
                  {user.isPrivate
                    ? "Only your followers can see your posts."
                    : "Anyone can see your posts."}
                </p>
              </div>
            </div>
            <span
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                user.isPrivate ? "bg-gold" : "bg-hairline"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                  user.isPrivate ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </button>
          {error && <p className="text-wine text-xs mt-3">{error}</p>}
        </section>
      )}

      {user && (
        <section className="club-card p-6">
          <p className="eyebrow mb-4">Account</p>
          <p className="text-sm text-ivory mb-1">{user.name}</p>
          <p className="text-sm text-ivory-dim mb-4">{user.email}</p>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="flex items-center gap-2 text-sm text-wine font-semibold"
          >
            <LogOut size={16} />
            Log out
          </button>
        </section>
      )}
    </div>
  );
}
