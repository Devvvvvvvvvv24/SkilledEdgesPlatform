// middlewares/multer.middleware.js
import path from "path";
import multer from "multer";

// Set up multer configuration
const upload = multer({
  dest: "uploads/", // Ensure the folder exists
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50 MB
  storage: multer.diskStorage({
    destination: "uploads/", // Where files will be saved
    filename: (_req, file, cb) => {
      // Add a unique suffix to avoid file name conflicts
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // Adding unique suffix to the filename
    },
  }),
  fileFilter: (_req, file, cb) => {
    // Only allow certain file extensions
    const ext = path.extname(file.originalname);

    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".webp" &&
      ext !== ".png" &&
      ext !== ".mp4"
    ) {
      return cb(new Error(`Unsupported file type: ${ext}`), false); // Reject unsupported file types
    }
    cb(null, true); // Proceed with the file
  },
});

export default upload;
