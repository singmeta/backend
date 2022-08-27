const mongoose = require("mongoose");

const OriginMusicSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  singer: {
    type: String,
    required: true,
  },
  mr_url: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
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

const OriginMusic = mongoose.model("OriginMusic", OriginMusicSchema);

module.exports = { OriginMusic };
