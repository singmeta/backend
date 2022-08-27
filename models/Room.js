const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  room_name: {
    type: String,
    required: true,
  },
  room_type_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RoomType",
    required: true,
  },
  is_required_password: {
    type: Boolean,
    required: true,
  },
  password: {
    type: Number,
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

const Room = mongoose.model("CreatedRoom", RoomSchema);

module.exports = { Room };
