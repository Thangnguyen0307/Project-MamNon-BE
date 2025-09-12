import { User } from '../models/user.model.js'; 

export const userService = {    
    async getUsers({ page = 1, limit = 20, role, keyword }) {
        const query = {};
        if (role) query.role = role;
        if (keyword) query.$or = [
            { email: { $regex: keyword, $options: 'i' } },
            { fullName: { $regex: keyword, $options: 'i' } }
        ];
        return await User.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit));
    },

    async getUserDetail(id) {
        return await User.findById(id);
    },

    async updateUser(id, { fullName, role, isActive }) {
        return await User.findByIdAndUpdate(
            id,
            { fullName, role, isActive },
            { new: true }
        );
    },

    async updateUserStatus(id, isActive) {
        return await User.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );
    },

    async deleteUser(id) {
        return await User.findByIdAndDelete(id);
    },

    async updateUserRole(id, role) {
        return await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        );
    },
};