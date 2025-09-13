import express from 'express';
import { login, logout, refreshToken, resetPassword, sendOtp, updatePassword } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { loginSchema, resetPasswordSchema, updatePasswordSchema } from '../validations/auth.validation.js';
import { clientInfo } from '../middlewares/client-info.middleware.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/login', validate(loginSchema), clientInfo, login);
authRouter.put('/reset-password', validate(resetPasswordSchema), clientInfo, resetPassword);
authRouter.post('/refresh-token', clientInfo, refreshToken);
authRouter.post('/logout', clientInfo, logout);
authRouter.post('/send-otp', sendOtp);
authRouter.put('/update-password', validate(updatePasswordSchema), authenticate, updatePassword);

export default authRouter;