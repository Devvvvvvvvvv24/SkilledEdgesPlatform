import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";

// ✅ Middleware to check if the user is authenticated
const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies; // ✅ Corrected: req.cookies, not req.cookie

  if (!token) {
    return next(new AppError("Unauthenticated, please login again", 401));
  }

  try {
    const userDetails = jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;
    next();
  } catch (err) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

// ✅ Middleware to check if user has required roles
const authorizedRoles =
  (...roles) =>
  (req, res, next) => {
    const currentUserRole = req.user?.role;

    if (!roles.includes(currentUserRole)) {
      return next(
        new AppError("You don't have permission to access this route", 403)
      );
    }

    next();
  };

// ✅ Middleware to check if user is subscribed (except for ADMIN)
const authorizeSubscriber = (req, res, next) => {
  const { role, subscription } = req.user;

  if (role !== "ADMIN" && subscription?.status !== "active") {
    return next(
      new AppError("Please subscribe to access this route!", 403)
    );
  }

  next();
};

export { isLoggedIn, authorizedRoles, authorizeSubscriber };
