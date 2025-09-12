import { env } from '../config/environment.js';
import { OtpModel } from '../models/otp.model.js';

export const otpService = {
    async generate(email) {
        await OtpModel.deleteOne({ email });
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + env.OTP_EXPIRE_MINUTES * 60 * 1000);
        await OtpModel.create({ email, otp, expiresAt });
        return otp;
    },

    async verify(email, otpInput) {
        const record = await OtpModel.findOne({
            email,
            otp: otpInput,
        });

        if (!record) {
            return false;
        }

        if (record.expiresAt < new Date()) {
            return false;
        }

        await OtpModel.deleteOne({ _id: record._id }); // Xoá sau khi dùng
        return true;
    }
};
