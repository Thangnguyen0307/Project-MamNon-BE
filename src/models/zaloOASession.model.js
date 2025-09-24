import mongoose from "mongoose";

const zaloOASessionSchema = new mongoose.Schema(
    {
        state: { type: String, required: true, unique: true },
        codeVerifier: { type: String, required: true },
        createdAt: { type: Date, default: Date.now, expires: 600 } // TTL 10 phút
    },
    { timestamps: true }
);

export const ZaloOASession = mongoose.model("ZaloOASession", zaloOASessionSchema);
