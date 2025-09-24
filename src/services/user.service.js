import { User } from '../models/user.model.js';
import { toUserResponse } from '../mappers/user.mapper.js';

export const userService = {
    async getUsers({ page = 1, limit = 20, role, keyword }) {
        const query = {};
        if (role) query.role = role;
        if (keyword) {
            query.$or = [
                { fullName: { $regex: keyword, $options: 'i' } },
                { username: { $regex: keyword, $options: 'i' } }, // nếu muốn search thêm
                { email: { $regex: keyword, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find(query)
                .skip(skip)
                .limit(Number(limit)),
            User.countDocuments(query)
        ]);

        return {
            users: users.map(toUserResponse),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async getUserDetail(id) {
        const user = await User.findById(id);
        return user ? toUserResponse(user) : null;
    },

    async updateUser(id, { fullName }) {
        const user = await User.findByIdAndUpdate(
            id,
            { fullName },
            { new: true }
        );
        return user ? toUserResponse(user) : null;
    },

    async updateUserStatus(id, isActive) {
        const user = await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );
        return user ? toUserResponse(user) : null;
    },

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    },

    async updateUserRole(id, role) {
        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );
        return user ? toUserResponse(user) : null;
    },

    async getAllTeachers(query = {}) {
        const { page = 1, limit = 10 } = query;
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;

        const users = await User.find({ role: 'TEACHER' })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments({ role: 'TEACHER' });
        return {
            users: users.map(u => toUserResponse(u)),
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        };
    }
};