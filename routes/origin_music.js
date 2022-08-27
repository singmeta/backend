const express = require("express");
const router = express.Router();
const config = require("../config/key");
const { OriginMusic } = require("../models/OriginMusic");
var CurrentTime = require("../functions/function");
var bucket = require("../functions/bucket");

// 생성
router.post("", bucket.fileUploader.array("mp3"), (req, res) => {
  const originMusic = new OriginMusic(req.body);
  originMusic.created_at = CurrentTime.getCurrentDate();
  originMusic.mr_url = `https://singmeta.s3.amazonaws.com/${bucket.directory}`;
  originMusic.save((err, originMusicInfo) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    }
    return res.status(200).json({ success: true, _id: originMusicInfo._id });
  });
});

// 전체 조회
router.get("", (req, res) => {
  OriginMusic.find({ is_deleted: false }, (error, list) => {
    res.status(200).send({ originMusic: list });
  });
});

// 특정 id 조회
router.get("/:id", (req, res) => {
  // 방 찾기
  OriginMusic.findOne({ _id: req.params.id, is_deleted: false }, (err, originMusicInfo) => {
    if (!originMusicInfo) {
      return res.status(400).json({
        success: false,
        message: "해당 Origin Music이 존재하지 않습니다.",
      });
    }

    return res.status(200).json({ success: true, originMusic: originMusicInfo });
  });
});

// 삭제
router.delete("/:id", (req, res) => {
  OriginMusic.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_deleted: true, updated_at: CurrentTime.getCurrentDate() },
    (err, originMusicInfo) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

module.exports = router;
