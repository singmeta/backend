const mongoose = require("mongoose");

const UserMusicSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  origin_music_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "OriginMusic",
    required: true,
  },
  record_url: {
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

const UserMusic = mongoose.model("UserMusic", UserMusicSchema);

module.exports = { UserMusic };
