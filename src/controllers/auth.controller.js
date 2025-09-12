import { authService } from "../services/auth.service.js";
import { jwtUtils } from "../utils/jwt.util.js";

const login = async (req, res) => {
    try {

        const ip = req.clientIp;        // đã parse sẵn
        const device = req.device;      // đã parse sẵn

        const { user, accessToken, refreshToken } = await authService.login(req.body, ip, device);

        return res.json({
            message: "Đăng nhập thành công",
            data: user,
            accessToken,
            refreshToken
        });
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};

const register = async (req, res) => {
    try {
        const ip = req.clientIp;        // đã parse sẵn
        const device = req.device;      // đã parse sẵn
        const { user, accessToken, refreshToken } = await authService.register(req.body, ip, device);


        res.status(201).json({
            message: "Đăng ký thành công",
            data: user,
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const ip = req.clientIp;        // đã parse sẵn
        const device = req.device;      // đã parse sẵn

        const { accessToken, refreshToken } = await authService.resetPassword(req.body, ip, device);

        // Generated token

        res.status(201).json({
            message: "Thay đổi mật khẩu thành công",
            accessToken,
            refreshToken
        });
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};

const introspect = async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.json({ active: false });
    }
    try {
        // Verify access token
        jwtUtils.verifyAccessToken(accessToken);
        return res.json({ active: true });
    } catch (err) {
        return res.json({ active: false });
    }
};

const refreshToken = async (req, res) => {
    try {
        const ip = req.clientIp;        // đã parse sẵn
        const device = req.device;      // đã parse sẵn
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: "Thiếu refresh token" });
        }

        const result = await authService.refreshToken(refreshToken, ip, device);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};


const sendOtp = async (req, res) => {
    const { email } = req.body;
    const { type } = req.query;
    try {
        await authService.sendOtp(email, type);
        res.json({ message: 'OTP đã được gửi về email' });
    } catch (err) {
        console.error(err);
        res.status(err.status).json({ message: err.message || 'Lỗi server' });
    }
};

const logout = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ message: "Thiếu refresh token" });
    }
    try {
        const ip = req.clientIp;
        const result = await authService.logout(refreshToken, ip);
        res.json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};

export { login, register, resetPassword, introspect, refreshToken, sendOtp, logout };