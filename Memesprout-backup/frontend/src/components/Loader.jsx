export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-ivory-dim">
      <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
      <p className="text-xs font-medium">{label}</p>
    </div>
  );
}
