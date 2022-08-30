const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
var CurrentTime = require("../functions/function");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  nickname: {
    type: String,
    required: true,
  },
  role: {
    type: Number,
    default: 0,
    required: true,
  },
  profile_picture_url: {
    type: String,
    default: "https://singmeta.s3.amazonaws.com/user-profile/1661884597810_default_profile.png",
    required: true,
  },
  character: {
    type: String,
    default: "ninja",
    required: true,
  },
  playlist: [],
  token: {
    type: String,
  },
  tokenExp: {
    type: Number,
  },
  final_login_date: {
    type: Date,
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

userSchema.pre("save", function (next) {
  var user = this; // userSchema를 가리킴
  // 비밀번호를 암호화 시키다

  if (user.isModified("password")) {
    // password가 수정되는 경우에만 암호화하도록 설정

    bcrypt.genSalt(saltRounds, function (err, salt) {
      // salt 생성
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function (err, hash) {
        // 위에서 생성한 salt
        // hash : 암호화된 비밀번호
        if (err) return next(err);
        user.password = hash; // 암호화된 비밀번호로 변경
        next();
      });
    });
  } else {
    next();
  }
});

// comparePassword라는 이름은 index.js에서 쓸 이름과 동일하게 내 맘대로 지으면 됨
userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  var user = this;

  var token = jwt.sign(user._id.toHexString(), "secretToken");

  user.token = token;
  user.final_login_date = CurrentTime.getCurrentDate();

  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  var user = this;

  jwt.verify(token, "secretToken", function (err, decoded) {
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
