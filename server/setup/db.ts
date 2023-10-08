import mongoose from "mongoose";
require("dotenv").config();

const DB_URL: string = process.env.MONGODB_URI || "";

let retryCounter: number = 3;

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL).then((data: any) => {
      console.log(`Database connected with ${data.connection.host}`);
    });
  } catch (error: any) {
    console.log(error.message);
    if (retryCounter > 0) {
      --retryCounter;
      setTimeout(connectDB, 5000);
    }
  }
};

export default connectDB;
