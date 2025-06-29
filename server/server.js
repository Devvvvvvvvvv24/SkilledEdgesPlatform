import app from './app.js';
import connectionToDB from './config/dbConnection.js';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5014;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECURE,
});

app.listen(PORT, async () => {
  try {
    await connectionToDB();
    console.log(`App is running at http://localhost:${PORT}`);
  } catch (err) {
    console.error("Failed to connect to DB:", err.message);
    process.exit(1);
  }
});
