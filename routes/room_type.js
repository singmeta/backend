const express = require("express");
const router = express.Router();
const config = require("../config/key");
const multer = require("multer");
const form_data = multer();
const { RoomType } = require("../models/RoomType");
var CurrentTime = require("../functions/function");
var bucket = require("../functions/bucket");

// 생성
router.post("", bucket.fileUploader.array("thumbnail"), (req, res) => {
  const room = new RoomType(req.body);
  room.created_at = CurrentTime.getCurrentDate();
  room.thumbnail_image_url = `https://singmeta.s3.amazonaws.com/${bucket.directory}`;

  room.save((err, roomInfo) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    }
    return res.status(200).json({ success: true, _id: roomInfo._id });
  });
});

// 전체 조회
router.get("", (req, res) => {
  RoomType.find({ is_deleted: false }, (error, list) => {
    res.status(200).send({ roomTypes: list });
  });
});

// 특정 id 조회
router.get("/:id", (req, res) => {
  // 방 찾기
  RoomType.findOne({ _id: req.params.id, is_deleted: false }, (err, room) => {
    if (!room) {
      return res.status(400).json({
        success: false,
        message: "해당 room type이 존재하지 않습니다.",
      });
    }

    return res.status(200).json({ success: true, roomType: room });
  });
});

// 삭제
router.delete("/:id", (req, res) => {
  RoomType.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, { is_deleted: true, updated_at: CurrentTime.getCurrentDate() }, (err, room) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

module.exports = router;
