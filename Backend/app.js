const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require('multer');
const path = require('path');

const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');

const app = express();

const MONGOOSE_URI =
  `mongodb+srv://sid16011997:${process.env.MONGO_PASSWORD}@cluster0-gddav.mongodb.net/test?retryWrites=true&w=majority`;

const MIME_TYPE = {
  'image/png': '.png',
  'image/jpg': '.jpg',
  'image/jpeg': '.jpg'
};

  const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE[file.mimetype];
      cb(null, file.originalname.split(' ').join('-') + ext);
    },
  });
  
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);

app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(postRoutes);
app.use(authRoutes);

mongoose
  .connect(MONGOOSE_URI)
  .then(() => {
    return app.listen(3000);
  })
  .then(() => {
    console.log("Server started!");
  })
  .catch((err) => {
    console.log(err);
  });
