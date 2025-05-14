import { assign } from "nodemailer/lib/shared/index.js";
import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";
const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookie;
  if (!token) {
    return next(new AppError("UnAuthenticated, please login again", 40));
  }
  const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
  req.user = userDetails;
  next();
};

const authorizedRoles =
  (...roles) =>
  async (req, res, next) => {
    const currentUserRole = req.user.role;
    if (roles.includes(currentUserRole)) {
      return next(
        new AppError("You dont have permission to access this route", 400)
      );
    }
    next();
  };

const authorizeSubscriber = async (req, res, next) => {
  const subscription = req.user.subscription;
  const currentUserRole = req.user.role;
  if (currentUserRole !== "ADMIN" && subscription.status !== "active") {
    return next(new AppError("Please subscribe to access this route!", 403));
  }
  next();
};
export { isLoggedIn, authorizedRoles, authorizeSubscriber };
