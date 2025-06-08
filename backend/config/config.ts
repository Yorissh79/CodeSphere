import mongoose from "mongoose";
import { configDotenv } from "dotenv";

configDotenv();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in the environment variables");
        }

        await mongoose.connect(uri);
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
};
