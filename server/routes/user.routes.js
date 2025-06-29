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
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * Register a new user with avatar upload
 * Validates multer errors manually to avoid crashing
 */
router.post("/register", upload.single("avatar"), async (req, res, next) => {
  try {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    await register(req, res, next);
  } catch (err) {
    next(err);
  }
});

// User login/logout
router.post("/login", login);
router.get("/logout", logout);

// Get logged-in user's profile
router.get("/me", isLoggedIn, getProfile);

// Forgot & reset password
router.post("/reset", forgotPassword); // Send reset link to email
router.post("/reset/:resetToken", resetPassword); // Use token to reset password

// Change password (user must be logged in)
router.post("/change-password", isLoggedIn, changePassword);

// Update user profile (e.g., avatar, name)
router.put("/update/:id", isLoggedIn, upload.single("avatar"), updateUser);

export default router;
