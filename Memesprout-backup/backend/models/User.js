import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    handle: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]{3,20}$/, "Handle must be 3-20 characters: letters, numbers, underscore only"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Enter a valid email"],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    bio: { type: String, maxlength: 220, default: "" },
    craft: { type: String, maxlength: 40, default: "" }, // e.g. "Poet", "Composer", "Painter"
    avatarUrl: { type: String, default: "" }, // uploaded photo (URL or data URI) — falls back to the seal monogram when empty
    seal: {
      // avatar identity: initials + a chosen hue, used to render the fallback monogram client-side
      initials: { type: String, maxlength: 2, default: "" },
      hue: { type: Number, default: 38 }, // gold-ish hue by default
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false },
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
