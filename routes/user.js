const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { User } = require("../models/User");
const { UserMusic } = require("../models/UserMusic");
const multer = require("multer");
const form_data = multer();
var CurrentTime = require("../functions/function");

// 아이디 중복확인
router.post("/email/validation", form_data.array(), (req, res) => {
  User.findOne({ email: req.body.email, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ success: false });
  });
});

// 회원가입
router.post("/register", form_data.array(), (req, res) => {
  const user = new User(req.body);
  user.created_at = CurrentTime.getCurrentDate();

  user.save((err, userInfo) => {
    if (err) {
      return res.status(400).json({ success: false, err });
    }
    return res.status(200).json({ success: true, _id: userInfo._id });
  });
});

// 로그인
router.post("/login", form_data.array(), (req, res) => {
  User.findOne({ email: req.body.email, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch) return res.status(400).json({ success: false, message: "비밀번호가 틀렸습니다." });

      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);

        res.cookie("x_auth", user.token).status(200).json({ success: true, userId: user._id, email: user.email });
      });
    });
  });
});

// auth 검증
router.get("/auth", form_data.array(), auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    id: req.user.id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role,
    image: req.user.image,
  });
});

// 로그아웃
router.get("/logout", form_data.array(), auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id, is_deleted: false }, { token: "" }, (err, user) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// 전체 조회
router.get("", (req, res) => {
  User.find({ is_deleted: false }, (error, list) => {
    res.status(200).send({ users: list });
  });
});

// 특정 ID로 조회
router.get("/:id", (req, res) => {
  User.findOne({ _id: req.params.id, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        getMineSuccess: false,
        message: " 제공된 이메일에 해당하는 유저가 없습니다.",
      });
    }

    res.status(200).send({ user: user });
  });
});

// 회원탈퇴
router.delete("/:id", (req, res) => {
  User.findOneAndUpdate({ _id: req.params.id, is_deleted: false }, { is_deleted: true, updated_at: CurrentTime.getCurrentDate(), token: "" }, (err, user) => {
    if (err) return res.status(400).json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// 아이디 찾기 : 이메일이나 문자를 연동

// 비밀번호 찾기

// 케릭터 변경
router.patch("/:id", (req, res) => {
  User.findOneAndUpdate(
    { _id: req.params.id, is_deleted: false },
    { character: req.query.character, updated_at: CurrentTime.getCurrentDate() },
    (err, user) => {
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).send({ success: true });
    }
  );
});

// 플레이 리스트 추가
router.patch("/:user_id/playlists/:user_music_id", form_data.array(), (req, res) => {
  UserMusic.findOne({ _id: req.params.user_music_id, is_showed: true, is_deleted: false }, (err, userMusic) => {
    if (!userMusic) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user music이 없습니다.",
      });
    }

    User.findOneAndUpdate(
      { _id: req.params.user_id, is_deleted: false },
      { $addToSet: { playlist: req.params.user_music_id }, updated_at: CurrentTime.getCurrentDate() },
      (err, user) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        user.playlist.push(req.params.user_music_id);
        return res.status(200).json({ success: true, playlists: user.playlist });
      }
    );
  });
});

// 플레이 리스트 삭제
router.delete("/:user_id/playlists/:user_music_id", form_data.array(), (req, res) => {
  UserMusic.findOne({ _id: req.params.user_music_id, is_showed: true, is_deleted: false }, (err, userMusic) => {
    if (!userMusic) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user music이 없습니다.",
      });
    }

    User.findOneAndUpdate(
      { _id: req.params.user_id, is_deleted: false },
      { $pull: { playlist: req.params.user_music_id }, updated_at: CurrentTime.getCurrentDate() },
      (err, user) => {
        if (err) {
          return res.status(400).json({ success: false, err });
        }
        user.playlist.pull(req.params.user_music_id);
        return res.status(200).json({ success: true, playlists: user.playlist });
      }
    );
  });
});

// 플레이 리스트 조회
router.get("/:user_id/playlists", form_data.array(), (req, res) => {
  User.findOne({ _id: req.params.user_id, is_deleted: false }, (err, user) => {
    if (!user) {
      return res.status(400).json({
        success: false,
        message: " 제공된 _id에 해당하는 user가 없습니다.",
      });
    }
    if (user.playlist.length == 0) {
      return res.status(200).json({ success: true, message: "playlist가 존재하지 않습니다." });
    }

    let playlists = new Array();
    user.playlist.forEach((element, index) => {
      UserMusic.findOne({ _id: element, is_showed: true, is_deleted: false }, (err, userMusic) => {
        if (!userMusic) {
          // 삭제되거나 비공개처리된 user_music은 자체적으로 플레이리스트에서 제거
          User.findOneAndUpdate(
            { _id: req.params.user_id, is_deleted: false },
            { $pull: { playlist: element }, updated_at: CurrentTime.getCurrentDate() },
            (err, user) => {
              if (err) {
                return res.status(400).json({ success: false, err });
              }
            }
          );
        } else playlists.push(userMusic);
        if (index == user.playlist.length - 1) {
          return res.status(200).json({ success: true, playlists: playlists });
        }
      });
    });
  });
});

// 플레이 리스트 최신순 정렬 > 보류

// 플레이 리스트 인기순 정렬 > 보류

module.exports = router;
