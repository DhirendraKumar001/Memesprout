import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't sign you in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-20 lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center lg:py-0">
      <h1 className="font-display text-3xl font-bold text-center mb-8">Welcome back</h1>

      <form onSubmit={submit} className="club-card p-6 space-y-4">
        <div>
          <label className="eyebrow block mb-1.5">Email</label>
          <input
            type="email"
            required
            className="field"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Password</label>
          <input
            type="password"
            required
            className="field"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && <p className="text-wine text-sm">{error}</p>}
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="text-center text-ivory-dim text-sm mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-gold font-semibold hover:text-gold-bright">
          Sign up
        </Link>
      </p>
    </div>
  );
}
