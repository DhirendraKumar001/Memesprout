import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-5 py-24 text-center">
      <p className="eyebrow">Wrong door</p>
      <h1 className="font-display text-3xl mt-2 mb-4">This room doesn't exist</h1>
      <p className="text-ivory-dim mb-6">Whatever you were looking for isn't behind this one.</p>
      <Link to="/" className="btn-gold">
        Back to home
      </Link>
    </div>
  );
}
