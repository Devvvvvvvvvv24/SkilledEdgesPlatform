import dotenv from "dotenv";
dotenv.config(); // This MUST come before anything else!

import Razorpay from "razorpay";

console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID); // Debug
console.log("SECRET:", process.env.RAZORPAY_SECRET); // Debug

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export default razorpay;
