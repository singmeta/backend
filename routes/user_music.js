const express = require("express");
const router = express.Router();
const config = require("../config/key");
const { UserMusic } = require("../models/UserMusic");
const { User } = require("../models/User");
const { OriginMusic } = require("../models/OriginMusic");
var CurrentTime = require("../functions/function");
var bucket = require("../functions/bucket");

// 생성
router.post("", bucket.fileUploader.array("mp3"), (req, res) => {
  User.findOne({ _id: req.body.user_id, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user가 없습니다.",
      });
    }

    OriginMusic.findOne({ _id: req.body.origin_music_id, is_deleted: false }, (err, originMusic) => {
      if (!originMusic) {
        return res.status(400).json({
          success: false,
          message: " 제공된 _id에 해당하는 originMusic이 없습니다.",
        });
      }
      const userMusic = new UserMusic(req.body);
      userMusic.created_at = CurrentTime.getCurrentDate();
      userMusic.record_url = `https://singmeta.s3.amazonaws.com/${bucket.directory}`;
      userMusic.save((err, userMusicInfo) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        return res.status(200).json({ success: true, _id: userMusicInfo._id });
      });
    });
  });
});

// 전체 단순 조회
router.get("", (req, res) => {
  UserMusic.find({ is_deleted: false }, (error, list) => {
    res.status(200).send({ userMusic: list });
  });
});

// 특정 id 조회
router.get("/:id", (req, res) => {
  // 방 찾기
  UserMusic.findOne({ _id: req.params.id, is_deleted: false }, (err, userMusicInfo) => {
    if (!userMusicInfo) {
      return res.status(400).json({
        success: false,
        message: "해당 User Music이 존재하지 않습니다.",
      });
    }

    return res.status(200).json({ success: true, userMusic: userMusicInfo });
  });
});

// 차트 조회 : 인기순 조회
router.get("/popular", (req, res) => {
  UserMusic.find({ is_showed: true, is_deleted: false })
    .sort([["likes", -1]])
    .limit(100)
    .exec(function (error, list) {
      res.status(200).send({ userMusic: list });
    });
});

// 차트 조회 : 최신순 조회
router.get("/latest", (req, res) => {
  UserMusic.find({ is_showed: true, is_deleted: false })
    .sort([["created_at", -1]])
    .limit(100)
    .exec(function (error, list) {
      res.status(200).send({ userMusic: list });
    });
});

// 마이페이지 - 내 곡 조회 : 특정 유저의 id로 인기순 조회
router.get("/users/:id/popular", (req, res) => {
  UserMusic.find({ user_id: req.params.id, is_deleted: false })
    .sort([["likes", -1]])
    .exec(function (error, list) {
      if (!list) {
        return res.status(400).json({
          success: false,
          message: "해당 User Music이 존재하지 않습니다.",
        });
      }
      res.status(200).send({ userMusic: list });
    });
});

// 마이페이지 - 내 곡 조회 : 특정 유저의 id로 최신순 조회
router.get("/users/:id/latest", (req, res) => {
  UserMusic.find({ user_id: req.params.id, is_deleted: false })
    .sort([["created_at", -1]])
    .exec(function (error, list) {
      if (!list) {
        return res.status(400).json({
          success: false,
          message: "해당 User Music이 존재하지 않습니다.",
        });
      }
      res.status(200).send({ userMusic: list });
    });
});

// 공개처리
router.patch("/:id/public", (req, res) => {
  UserMusic.findOneAndUpdate({ _id: req.params.id, is_showed: false, is_deleted: false }, { is_showed: true }, (err, userMusicInfo) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// 비공개처리
router.patch("/:id/private", (req, res) => {
  UserMusic.findOneAndUpdate({ _id: req.params.id, is_showed: true, is_deleted: false }, { is_showed: false }, (err, userMusicInfo) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// 좋아요 수 증가
router.patch("/:id/likes", (req, res) => {
  UserMusic.findOneAndUpdate(
    { _id: req.params.id, is_showed: true, is_deleted: false },
    { $inc: { likes: 1 }, updated_at: CurrentTime.getCurrentDate() },
    (err, userMusicInfo) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).send({
        success: true,
        likes: userMusicInfo.likes + 1,
      });
    }
  );
});

// 삭제
router.delete("/:id", (req, res) => {
  UserMusic.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { is_showed: false, is_deleted: true, updated_at: CurrentTime.getCurrentDate() },
    (err, userMusicInfo) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

module.exports = router;
