const mongoose = require("mongoose");

const UserMusicSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  user_nickname: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  origin_music_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OriginMusic",
  },
  record_url: {
    type: String,
    required: true,
  },
  play_time: {
    type: String,
    required: true,
  },
  is_showed: {
    type: Boolean,
    default: false,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
  },
  updated_at: {
    type: Date,
  },
  is_deleted: {
    type: Boolean,
    default: false,
    required: true,
  },
});

UserMusicSchema.index({ title: "text", user_nickname: "text" });

const UserMusic = mongoose.model("UserMusic", UserMusicSchema);

module.exports = { UserMusic };
