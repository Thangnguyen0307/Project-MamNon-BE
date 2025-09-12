import express from 'express';
import { createAccountSchema } from '../validations/admin.validation.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { createAccount } from '../controllers/admin.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const adminRouter = express.Router();

// Define admin routes here

adminRouter.post('/create-account', authenticate, authorize(ROLE.ADMIN), validate(createAccountSchema), createAccount );

export default adminRouter;