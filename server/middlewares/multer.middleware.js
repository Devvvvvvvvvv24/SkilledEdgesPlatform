// middlewares/multer.middleware.js
import path from "path";
import multer from "multer";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Define allowed file extensions
const allowedExtensions = [".jpg", ".jpeg", ".webp", ".png", ".mp4"];

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return cb(new Error(`Unsupported file type: ${ext}`), false);
    }
    cb(null, true);
  },
});

export default upload;
