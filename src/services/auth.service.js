import { toUserResponse } from "../mappers/user.mapper.js";
import { User } from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";
import { otpService } from '../services/otp.service.js';
import { jwtUtils } from "../utils/jwt.util.js";
import { RefreshToken } from "../models/refreshToken.model.js";
import { refreshTokenService } from "./refresh-token.service.js";

export const authService = {

    async login({ email, password }, ip, device) {
        //Check if user exists
        const user = await User.findOne({ email });
        if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };

        if (!await comparePassword(password, user.password)) {
            throw { status: 401, message: "Sai mật khẩu" };
        }

        //Generate token
        const accessToken = jwtUtils.signAccessToken(user);
        const refreshToken = await refreshTokenService.generate(user, ip, device);
        return {
            user: toUserResponse(user),
            accessToken,
            refreshToken
        };
    },

    async resetPassword({ email, otpCode, newPassword }, ip, device) {
        const user = await User.findOne({ email });
        if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };

        // Validate OTP code
        if (!await otpService.verify(email, otpCode)) {
            throw { status: 400, message: "Mã OTP không hợp lệ" };
        }
        newPassword = await hashPassword(newPassword);
        user.password = newPassword;

        await user.save();

        await RefreshToken.updateMany(
            { user: user._id, revokedAt: null },
            { $set: { revokedAt: new Date(), revokedByIp: ip } }
        );


        //Generate token
        const accessToken = jwtUtils.signAccessToken(user);
        const refreshToken = await refreshTokenService.generate(user, ip, device);

        return {
            accessToken,
            refreshToken
        };
    },

    async refreshToken(refreshToken, ip, device) {
        const decoded = await refreshTokenService.verify(refreshToken);

        const user = await User.findOne({ _id: decoded.userId });
        if (!user) throw { status: 404, message: "User không tồn tại" };

        // Phát hành token mới
        const newAccessToken = jwtUtils.signAccessToken(user);
        const newRefreshToken = await refreshTokenService.rotate(refreshToken, user, ip, device);
        return { accessToken: newAccessToken, refreshToken: newRefreshToken };

    },

    async logout(refreshToken, ip) {
        if (!refreshToken) {
            throw { status: 400, message: "Thiếu refresh token" };
        }

        // revoke token trong DB
        await refreshTokenService.revoke(refreshToken, ip);

        return { message: "Đăng xuất thành công" };
    },
};