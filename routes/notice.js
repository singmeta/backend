const express = require("express");
const router = express.Router();
const config = require("../config/key");
const multer = require("multer");
const form_data = multer();
const { Notice } = require("../models/Notice");
const { User } = require("../models/User");
var CurrentTime = require("../functions/function");

// 생성
router.post("", form_data.array(), (req, res) => {
  User.findOne({ _id: req.body.user_id, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user가 없습니다.",
      });
    }
    const notice = new Notice(req.body);
    notice.created_at = CurrentTime.getCurrentDate();

    notice.save((err, notice) => {
      if (err) {
        return res.status(400).json({ success: false, err });
      }
      return res.status(200).json({ success: true, _id: notice._id });
    });
  });
});

// 전체 조회
router.get("", (req, res) => {
  Notice.find({ is_deleted: false }, (error, list) => {
    res.status(200).send({ notices: list });
  });
});

// 특정 유저의 ID로 조회
router.get("/users/:id", (req, res) => {
  Notice.find({ user_id: req.params.id, is_deleted: false }, (err, list) => {
    if (!notice) {
      return res.json({
        success: false,
        message: "해당 Notice가 존재하지 않습니다.",
      });
    }

    return res.status(200).send({ notice: list });
  });
});

// 특정 ID로 조회
router.get("/:id", (req, res) => {
  Notice.findOne({ _id: req.params.id, is_deleted: false }, (err, notice) => {
    if (!notice) {
      return res.json({
        success: false,
        message: "해당 Notice가 존재하지 않습니다.",
      });
    }

    return res.status(200).send({ notice: notice });
  });
});

// 삭제
router.delete("/:id", (req, res) => {
  Notice.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, { is_deleted: true, updated_at: CurrentTime.getCurrentDate() }, (err, notice) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

module.exports = router;
