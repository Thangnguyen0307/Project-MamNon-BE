import Joi from 'joi';
import { ROLE } from '../constants/role.constant.js';

export const createAccountSchema = Joi.object({
    email: Joi.string().email().required(),
    role: Joi.string().valid(ROLE.ADMIN, ROLE.TEACHER).required()
});