const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

const router = express.Router();

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "hairstyles"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = `hairstyle-${Date.now()}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP images are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/hairstyle",
  authMiddleware,
  adminOnly,
  upload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required.",
      });
    }

    const imageUrl = `/uploads/hairstyles/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully.",
      image: imageUrl,
    });
  }
);

module.exports = router;