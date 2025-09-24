import mongoose from "mongoose";

const zaloTokenSchema = new mongoose.Schema(
    {
        oaId: { type: String, required: true, unique: true },
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        expiresAt: { type: Date, required: true }
    },
    { timestamps: true }
);

export const ZaloToken = mongoose.model("ZaloToken", zaloTokenSchema);
