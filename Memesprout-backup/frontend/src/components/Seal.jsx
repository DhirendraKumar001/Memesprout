// Every member is represented by an avatar: an uploaded photo if they've set
// one, otherwise a colorful embossed monogram as a friendly default.
export default function Seal({ initials = "??", hue = 38, size = "md", avatarUrl = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`${sizes[size] || sizes.md} rounded-full object-cover shrink-0`}
      />
    );
  }

  const bg = `linear-gradient(155deg, hsl(${hue} 55% 46%), hsl(${hue} 65% 30%) 55%, hsl(${hue} 70% 20%))`;

  return (
    <span
      className={`seal ${sizes[size] || sizes.md}`}
      style={{ background: bg }}
      aria-hidden="true"
    >
      {initials || "??"}
    </span>
  );
}
