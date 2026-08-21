import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true, maxlength: 2000 },
    imageUrl: { type: String, default: "" },
    hour: { type: Number, default: () => new Date().getHours() }, // hour posted, for the "night ledger" feel
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    isRepost: { type: Boolean, default: false },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: true }
);

postSchema.index({ createdAt: -1 });

export default mongoose.model("Post", postSchema);
