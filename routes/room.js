const express = require("express");
const request = require("request");
const router = express.Router();
const config = require("../config/key");
const multer = require("multer");
const form_data = multer();
const { Room } = require("../models/Room");
const { User } = require("../models/User");
const { RoomType } = require("../models/RoomType");
var CurrentTime = require("../functions/function");

// 방 만들기
router.post("", form_data.array(), (req, res) => {
  User.findOne({ _id: req.body.user_id, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user가 없습니다.",
      });
    }

    RoomType.findOne({ _id: req.body.room_type_id, is_deleted: false }, (err, room_type) => {
      if (!room_type) {
        return res.status(400).json({
          success: false,
          message: " 제공된 _id에 해당하는 room type이 없습니다.",
        });
      }

      if (req.body.is_required_password == "Y") {
        if (req.body.password == null || req.body.password == "")
          return res.status(400).json({ success: false, is_required_password: "password가 입력되지 않음" });
        req.body.is_required_password = true;
      } else if (req.body.is_required_password == "N") req.body.is_required_password = false;
      else return res.status(400).json({ success: false, is_required_password: "알 수 없는 값 입력" });

      const room = new Room(req.body);
      room.created_at = CurrentTime.getCurrentDate();

      room.save((err, roomInfo) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        // return res.status(200).json({ success: true, _id: roomInfo._id });
        const options = {
          uri: `http://localhost:5000/api/v1/rooms/createRoom/${room_type.theme}/${user.character}/${user.nickname}/${roomInfo._id}`,
        };
        request(options, function (err, response, body) {
          return res.status(200).json({ success: true });
        });
      });
    });
  });
});

router.get("/createRoom/:mapid/:charname/:nickname/:roomid", (req, res) => {
  //return res.status(200).json({ success: true });
  res.render("main.pug");
});

// 메타버스 방 입장 시 필요한 id 저장
router.patch("/enter/:id", form_data.array(), (req, res) => {
  Room.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { room_enter_id: req.body.room_enter_id, updated_at: CurrentTime.getCurrentDate() },
    (err, room) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).send({
        success: true,
      });
    }
  );
});

// 모든 방 조회
router.get("", (req, res) => {
  Room.find({ is_deleted: false }, (error, list) => {
    // res.status(200).send({ rooms: list });
    const options = {
      uri: `http://localhost:5000/api/v1/rooms/getRooms`,
    };
    request(options, function (err, response, body) {
      return res.status(200).json({ success: true });
    });
  });
});

router.get("/getRooms", (req, res) => {
  res.send("map2");
});

// 인기순 조회
router.get("/popular", (req, res) => {
  Room.find({ is_deleted: false })
    .sort([["likes", -1]])
    .exec(function (error, list) {
      res.status(200).send({ rooms: list });
    });
});

// 최신순 조회
router.get("/latest", (req, res) => {
  Room.find({ is_deleted: false })
    .sort([["created_at", -1]])
    .exec(function (error, list) {
      res.status(200).send({ rooms: list });
    });
});

// 특정 유저의 방 조회
router.get("/users/:id", (req, res) => {
  Room.find({ user_id: req.params.id, is_deleted: false }, (err, list) => {
    if (!room) {
      return res.json({
        roomFindSuccess: false,
        message: "해당 Room이 존재하지 않습니다.",
      });
    }

    return res.status(200).send({ room: list });
  });
});

// 특정 방 조회
router.get("/:id", (req, res) => {
  Room.findOne({ _id: req.params.id, is_deleted: false }, (err, room) => {
    if (!room) {
      return res.json({
        roomFindSuccess: false,
        message: "해당 Room이 존재하지 않습니다.",
      });
    }

    return res.status(200).send({ room: room });
  });
});

// 방 입장 -> 비밀번호 유무 상관없이 가능
router.get("/enter/:roomid/pw/:password/users/:userid", form_data.array(), (req, res) => {
  User.findOne({ _id: req.params.userid, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user가 없습니다.",
      });
    }
    // 방 찾기
    Room.findOne({ _id: req.params.roomid, is_deleted: false }, (err, room) => {
      if (!room) {
        return res.status(400).json({
          success: false,
          message: "해당 Room이 존재하지 않습니다.",
        });
      }

      if (room.is_required_password && (req.params.password == "" || req.params.password == null || room.password !== parseInt(req.params.password))) {
        return res.status(400).json({ success: false, message: "비밀번호가 틀렸습니다." });
      }

      RoomType.findOne({ _id: room.room_type_id, is_deleted: false }, (err, roomType) => {
        if (!room) {
          return res.status(400).json({
            success: false,
            message: "해당 Room이 존재하지 않습니다.",
          });
        }

        const options = {
          uri: `http://localhost:5000/api/v1/rooms/enterRoom/${roomType.theme}/${user.character}/${room.room_enter_id}/${user.nickname}/${room._id}`,
        };
        request(options, function (err, response, body) {
          return res.status(200).json({ success: true });
        });
      });
    });
  });
});

router.get("/enterRoom/:mapid/:charname/:id/:nickname/:roomid", (req, res) => {
  res.render("main.pug");
  // return res.status(200).send({
  //   success: true,
  // });
});

// 좋아요 수 증가
router.patch("/:id", (req, res) => {
  Room.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, { $inc: { likes: 1 }, updated_at: CurrentTime.getCurrentDate() }, (err, room) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
      likes: room.likes + 1,
    });
  });
});

// 삭제
router.delete("/:id", (req, res) => {
  Room.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, { is_deleted: true, updated_at: CurrentTime.getCurrentDate() }, (err, room) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

module.exports = router;
