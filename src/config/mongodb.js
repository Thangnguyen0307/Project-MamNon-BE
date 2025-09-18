import mongoose from "mongoose";
import { env } from "./environment.js";

const connectToMongo = async () => {
    if (!env.MONGODB_URI) {
        throw new Error("MONGODB_URI is missing in environment");
    }
    try {
        await mongoose.connect(env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("Đã kết nối MongoDB thành công!");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
        throw error;
    }
};

export { connectToMongo };