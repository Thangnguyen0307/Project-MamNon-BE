import { adminService } from '../services/admin.service.js';

export const createAccount = async (req, res, next) => {
    try {
        const { email, role } = req.body;

        const result = await adminService.createAccount({ email, role });
        res.status(201).json(result);
    } catch (err) {
        res.status(err.status || 500).json({ message: err.message || "Lỗi server" });
    }
};
