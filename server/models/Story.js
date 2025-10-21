import mongoose from "mongoose";

const StorySchema = new mongoose.Schema({
  user: { type: String, ref: "User", required: true },
  content: { type: String },
  media_url: [{ type: String, default: "" }],
  media_type: { type: String, enum: ['text', 'image', 'video'], required: true },
  views_count: [{ type: String, ref: "User" }],
  background_color: { type: String },
}, { timestamps: true, minimize: false });


const Story = mongoose.model("Story", StorySchema);

export default Story;
