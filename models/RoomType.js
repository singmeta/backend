const mongoose = require("mongoose");

const RoomTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail_image_url: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    default: "map2",
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

const RoomType = mongoose.model("RoomType", RoomTypeSchema);

module.exports = { RoomType };
