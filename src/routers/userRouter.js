import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { validate } from '../middlewares/validate.middleware.js';        
import { updateUserSchema, updateUserStatusSchema, updateUserRoleSchema } from '../validations/user.validation.js';
import {
        getUsers,
        getUserDetail,
        updateUser,
        updateUserStatus,
        deleteUser,
        updateUserRole,
 } from '../controllers/user.controller.js';

const userRouter = express.Router();
userRouter.get('/', authenticate, authorize(ROLE.ADMIN), getUsers); // Lấy danh sách user
userRouter.get('/my-account', authenticate, getUserDetail); // Xem chi tiết user
userRouter.put('/my-account', authenticate, validate(updateUserSchema), updateUser); // Cập nhật thông tin user
userRouter.put('/:id/status', authenticate, authorize(ROLE.ADMIN), validate(updateUserStatusSchema), updateUserStatus); // Khóa/mở khóa tài khoản
userRouter.delete('/my-account', authenticate, deleteUser); // Xóa tài khoản
userRouter.put('/:id/role', authenticate, authorize(ROLE.ADMIN), validate(updateUserRoleSchema), updateUserRole); // Đổi role tài khoản

export default userRouter;