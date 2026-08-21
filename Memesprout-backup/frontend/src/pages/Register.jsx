import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", handle: "", email: "", password: "", craft: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16 lg:min-h-[calc(100vh-4rem)] lg:flex lg:flex-col lg:justify-center lg:py-0">
      <h1 className="font-display text-3xl font-bold text-center mb-8">Create your account</h1>

      <form onSubmit={submit} className="club-card p-6 space-y-4">
        <div>
          <label className="eyebrow block mb-1.5">Full name</label>
          <input required className="field" value={form.name} onChange={set("name")} />
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Handle</label>
          <input
            required
            placeholder="lowercase_no_spaces"
            className="field"
            value={form.handle}
            onChange={set("handle")}
          />
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Craft (optional)</label>
          <input placeholder="Poet, Composer, Painter…" className="field" value={form.craft} onChange={set("craft")} />
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Email</label>
          <input type="email" required className="field" value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Password</label>
          <input type="password" required minLength={6} className="field" value={form.password} onChange={set("password")} />
        </div>
        {error && <p className="text-wine text-sm">{error}</p>}
        <button className="btn-gold w-full" disabled={busy}>
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-ivory-dim text-sm mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-gold font-semibold hover:text-gold-bright">
          Log in
        </Link>
      </p>
    </div>
  );
}
