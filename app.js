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
app.set("view engine", "pug");
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

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

const httpServer = require("http").createServer(app);
const wsServer = require("socket.io")(httpServer, {
  // ...
});

var users = [];

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });

  console.log(socket.client.conn.server.clientsCount + " users connected");

  socket.on("enter_room", async (roomName, done) => {
    socket.roomName = roomName;
    await socket.join(roomName);
    await done();
    await socket.to(roomName).emit("welcome", socket["nickname"]);
    await users.push(socket["nickname"]);
    await console.log(users);
    await socket.to(roomName).emit("users", users);
  });

  socket.on("disconnecting", () => {
    users.pop();
    console.log("user poped!!");
    console.log(users);
    socket.rooms.forEach((room) => {
      socket.to(room).emit("bye", socket.nickname);
      socket.to(room).emit("users", users);
    });
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  mongoose
    .connect(config.mongoURI, {})
    .then(() => console.log("MongoDB Connected..."))
    .catch((err) => console.log(err));
});

module.exports = app;
