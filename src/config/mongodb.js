import mongoose from "mongoose";
import { env } from "./environment.js";

const connectToMongo = async () => {
    try {
        await mongoose.connect(env.MONGODB_URI);
        console.log("Đã kết nối MongoDB thành công!");
    } catch (error) {
        console.error("Lỗi kết nối MongoDB:", error.message);
    }
};

export { connectToMongo };