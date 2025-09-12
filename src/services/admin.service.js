import { User } from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.util.js';
import { sendMail } from './mail.service.js';
import { env } from '../config/environment.js';
import { generateRandomPassword } from '../utils/password.util.js';

export const adminService = {
    async createAccount({ email, role }) {
        const existing = await User.findOne({ email });
        if (existing) throw { status: 400, message: 'Email đã tồn tại trong hệ thống' };

        // 6 ký tự số
        const rawPassword = generateRandomPassword(6); // ví dụ: '473829'
        const hashedPassword = await hashPassword(rawPassword);

        const newUser = await User.create({
            fullName: 'New User',
            email,
            role,
            password: hashedPassword,
            createdBy: 'ADMIN_SCRIPT', // optional: track nguồn tạo
        });

        await sendMail(
            email,
            'ACCOUNT_CREATED',
            { email, password: rawPassword }
        );

        return {
            message: `Tài khoản đã được tạo và gửi mật khẩu tới ${email}`,
            userId: newUser._id
        };
    }
};
