import mongoose from "mongoose";

const DB = process.env.DATABASE!.replace(
  `<PASSWORD>`,
  process.env.DATABASE_PASSWORD!,
);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:, error");
  }
};

export default connectToDatabase;
