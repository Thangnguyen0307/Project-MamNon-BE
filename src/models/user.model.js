import mongoose from 'mongoose';
import { ROLE } from '../constants/role.constant.js';

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Email không hợp lệ"]
    },
    role: { type: String, enum: ['ADMIN', 'TEACHER'], default: ROLE.TEACHER },
    isActive: { type: Boolean, default: true },
    password: { type: String, required: true },
}, { timestamps: true });
export const User = mongoose.model('User', userSchema);
