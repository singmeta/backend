const createError = require("http-errors");
const express = require("express");
const app = express();
const port = 5000;
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = require("./config/key");
const mongoose = require("mongoose");

const usersRouter = require("./routes/user");
const roomRouter = require("./routes/room");
const roomTypeRouter = require("./routes/room_type");
const oringinMusic = require("./routes/origin_music");
const userMusic = require("./routes/user_music");
const notice = require("./routes/notice");

// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "ejs");

// app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// console.log(__dirname + "/views");

// app.use("/public", express.static(__dirname + "/src/public"));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/room-types", roomTypeRouter);
app.use("/api/v1/origin-musics", oringinMusic);
app.use("/api/v1/user-musics", userMusic);
app.use("/api/v1/notices", notice);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));
});

module.exports = app;
