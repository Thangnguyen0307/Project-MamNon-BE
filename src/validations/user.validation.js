import Joi from 'joi';

export const updateUserSchema = Joi.object({
    fullName: Joi.string().min(2).max(50).required(),
});

export const updateUserStatusSchema = Joi.object({
    isActive: Joi.boolean().required()
});

export const updateUserRoleSchema = Joi.object({
    role: Joi.string().valid('ADMIN', 'TEACHER').required()
});
