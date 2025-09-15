const multer = require("multer");
const path = require("path");
const fs = require("fs");

function makeUploader(subDir = "questions") {
  const uploadPath = path.join(
    __dirname,
    "..",
    "..",
    "public",
    "uploads",
    subDir
  );
  fs.mkdirSync(uploadPath, { recursive: true });

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, name);
    },
  });

  function fileFilter(req, file, cb) {
    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: 20 * 1024 * 1024 },
  }); // 20MB
}

const uploadQuestions = makeUploader("questions");
const uploadOptions = makeUploader("options");

module.exports = uploadQuestions;
module.exports.makeUploader = makeUploader;
module.exports.uploadQuestions = uploadQuestions;
module.exports.uploadOptions = uploadOptions;
