import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  resetPassword,
  updateUser,
} from "../controllers/user.controller.js"; // Import controllers
import { isLoggedIn } from "../middlewares/auth.middleware.js"; // Auth middleware
import upload from "../middlewares/multer.middleware.js"; // Import multer middleware

const router = Router();

// Register route with file upload
router.post('/register', upload.single("avatar"), async (req, res, next) => {
  try {
    // Handle file validation error if any
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    // Continue to register the user after handling the file
    await register(req, res, next);
  } catch (err) {
    next(err); // Pass any error to the error handler
  }
});

// Other routes
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/reset', forgotPassword);
router.post('/reset/:resetToken', resetPassword);
router.post('/change-password', isLoggedIn, changePassword);
router.put('/update/:id', isLoggedIn, upload.single("avatar"), updateUser);

export default router;
