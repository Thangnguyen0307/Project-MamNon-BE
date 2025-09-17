import { ZaloToken } from "../models/zalo-token.model.js";

export async function saveZaloToken(oaId, accessToken, refreshToken, expiresIn) {
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    return await ZaloToken.findOneAndUpdate(
        { oaId },
        { accessToken, refreshToken, expiresAt },
        { new: true, upsert: true }
    );
}

export async function getZaloToken(oaId) {
    return await ZaloToken.findOne({ oaId });
}
