import mongoose from "mongoose";
import initCrons from "../crone/index.js";

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    initCrons();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

export default connectDB;
