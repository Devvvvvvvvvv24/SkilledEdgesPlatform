import User from "../models/user.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import sendEmail from "../utils/email.util.js";

const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("Email already exists", 400));
    }

    const user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: email, // Default avatar setup, will be updated if image uploaded
        secure_url: '',
      },
    });

    if (req.file) {
      // Upload the avatar image to cloud storage (e.g., Cloudinary)
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "users", // Customize folder name as needed
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        // Update the user's avatar with the uploaded image URL
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // Remove the local file after upload
        await fs.rm(`uploads/${req.file.filename}`);
      } catch (err) {
        return next(new AppError("Avatar upload failed", 500));
      }
    }

    await user.save();
    user.password = undefined; // Don't send password in the response

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    next(new AppError("Registration failed", 500));
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All fields are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Email or password does not match", 400));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOption);

    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (err) {
    next(new AppError(err.message || "Login failed", 500));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (err) {
    next(new AppError("Failed to fetch profile details", 500));
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("Email not registered", 400));
    }

    const resetToken = await user.generatePasswordResetToken();
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = "Reset Password";
    const message = `
      You can reset your password by clicking <a href="${resetURL}" target="_blank">Reset Your Password</a><br>
      If the above link does not work, copy-paste this link in a new tab: ${resetURL}.
      If you did not request this, kindly ignore.
    `;

    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token sent to ${email}.`,
    });
  } catch (err) {
    if (err instanceof AppError) return next(err);
    await User.updateOne(
      { email: req.body.email },
      { $unset: { forgotPasswordToken: "", forgotPasswordExpiry: "" } }
    );
    next(new AppError("Failed to send reset email", 500));
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken } = req.params;
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const user = await User.findOne({
      forgotPasswordToken: hashedToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Invalid or expired reset token", 400));
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (err) {
    next(new AppError("Failed to reset password", 500));
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(new AppError("All fields are mandatory", 400));
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user || !(await user.comparePassword(oldPassword))) {
      return next(new AppError("Invalid old password", 400));
    }

    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    next(new AppError("Failed to change password", 500));
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { fullName } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (fullName) user.fullName = fullName;

    if (req.file) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
        width: 250,
        height: 250,
        gravity: "faces",
        crop: "fill",
      });

      user.avatar.public_id = result.public_id;
      user.avatar.secure_url = result.secure_url;

      await fs.rm(`uploads/${req.file.filename}`);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User details updated successfully!",
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to update user", 500));
  }
};

export {
  register,
  login,
  logout,
  getProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  updateUser,
};
