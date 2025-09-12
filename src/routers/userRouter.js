import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import {
        getUsers,
        getUserDetail,
        updateUser,
        updateUserStatus,
        deleteUser,
        updateUserRole,
 } from '../controllers/user.controller.js';

const userRouter = express.Router();
userRouter.get('/', authenticate, authorize(ROLE.ADMIN),  getUsers); // Lấy danh sách user
userRouter.get('/:id', authenticate, authorize(ROLE.ADMIN),  getUserDetail); // Xem chi tiết user
userRouter.put('/:id', authenticate, authorize(ROLE.ADMIN),  updateUser); // Cập nhật thông tin user
userRouter.patch('/:id/status', authenticate, authorize(ROLE.ADMIN),  updateUserStatus); // Khóa/mở khóa tài khoản
userRouter.delete('/:id', authenticate, authorize(ROLE.ADMIN),  deleteUser); // Xóa tài khoản
userRouter.patch('/:id/role', authenticate, authorize(ROLE.ADMIN),  updateUserRole); // Đổi role tài khoản

export default userRouter;