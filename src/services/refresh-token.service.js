import { RefreshToken } from "../models/refreshToken.model.js";
import { jwtUtils } from "../utils/jwt.util.js";
import { sha256 } from "../utils/crypto.util.js"; // sha256 helper

export const refreshTokenService = {
    async generate(user, createdByIp, device) {
        // Sinh JWT refresh token
        const refreshToken = jwtUtils.signRefreshToken(user);

        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        const tokenHash = sha256(refreshToken);

        await RefreshToken.create({
            user: user._id,
            tokenHash,
            expiresAt: new Date(decoded.exp * 1000), // exp trong JWT là seconds
            createdByIp,
            device,
        });

        return refreshToken; // trả JWT plaintext cho FE
    },

    async verify(refreshToken) {
        const decoded = jwtUtils.verifyRefreshToken(refreshToken);
        const tokenHash = sha256(refreshToken);

        const stored = await RefreshToken.findOne({
            tokenHash,
            revokedAt: null,
            expiresAt: { $gt: new Date() },
        });

        if (!stored) {
            throw { status: 401, message: "Refresh token không hợp lệ hoặc đã bị thu hồi" };
        }

        return decoded;
    },

    async rotate(oldRefreshToken, user, createdByIp, device) {
        const oldHash = sha256(oldRefreshToken);
        const oldTokenDoc = await RefreshToken.findOne({
            user: user._id,
            tokenHash: oldHash,
            revokedAt: null,
        });

        if (!oldTokenDoc) {
            throw { status: 401, message: "Refresh token không hợp lệ" };
        }

        // Sinh JWT mới
        const newRefreshToken = jwtUtils.signRefreshToken(user);

        const decodedNew = jwtUtils.verifyRefreshToken(newRefreshToken);
        const newHash = sha256(newRefreshToken);

        // Revoke token cũ
        oldTokenDoc.revokedAt = new Date();
        oldTokenDoc.replacedByTokenHash = newHash;
        await oldTokenDoc.save();

        // Lưu token mới
        await RefreshToken.create({
            user: user._id,
            tokenHash: newHash,
            expiresAt: new Date(decodedNew.exp * 1000),
            createdByIp,
            device,
        });

        return newRefreshToken; // trả JWT plaintext cho FE
    },

    async revoke(refreshToken, ip) {
        const tokenHash = sha256(refreshToken);
        const tokenDoc = await RefreshToken.findOne({ tokenHash });

        if (tokenDoc) {
            tokenDoc.revokedAt = new Date();
            tokenDoc.revokedByIp = ip;
            await tokenDoc.save();
        }
    },
};
