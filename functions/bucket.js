const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const config = require("../config/key");

AWS.config.update({
  region: config.region,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const s3 = new AWS.S3();

const allowedExtensions = [".mp3"];

// exports.directory = "";

exports.fileUploader = multer({
  storage: multerS3({
    s3: s3,
    bucket: "singmeta",
    key: (req, file, callback) => {
      // console.log(file);
      if (req.query.directory == null || req.query.directory == "") return callback(new Error("Can't find directory"));
      const uploadDirectory = req.query.directory;
      const extension = path.extname(file.originalname);
      //   if (!allowedExtensions.includes(extension)) {
      //     return callback(new Error("wrong extention"));
      //   }
      const directory = `${uploadDirectory}/${Date.now()}_${file.originalname}`;
      exports.directory = directory;
      callback(null, directory);
    },
    acl: "public-read-write",
  }),
});
