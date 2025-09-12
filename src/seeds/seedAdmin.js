import { User } from '../models/user.model.js';
import { hashPassword } from '../utils/bcrypt.util.js';
import { env } from '../config/environment.js';
import { ROLE } from '../constants/role.constant.js';

export const seedAdminUser = async () => {

    const existing = await User.findOne({ email: env.ADMIN_EMAIL });

    if (existing) {
        console.log(`🟢 Admin user already exists with email: ${env.ADMIN_EMAIL} and password: ${env.ADMIN_PASSWORD}`);
        return;
    }

    const hashed = await hashPassword(env.ADMIN_PASSWORD);

    const adminUser = new User({
        fullName: 'Administrator',
        email: env.ADMIN_EMAIL,
        password: hashed,
        role: ROLE.ADMIN,
    });

    await adminUser.save();
    console.log(`✅ Admin user created with email: ${env.ADMIN_EMAIL} and password: ${env.ADMIN_PASSWORD}`);
};
