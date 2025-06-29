import mongoose from "mongoose";

mongoose.set("strictQuery", false); // Allow flexible queries

const connectionToDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lms";

    // Remove deprecated options (useNewUrlParser and useUnifiedTopology)
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit process if DB connection fails
  }
};

export default connectionToDB;
