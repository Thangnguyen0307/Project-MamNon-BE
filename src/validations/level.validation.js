import Joi from 'joi';

export const createLevelSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Tên cấp lớp không được để trống',
    'any.required': 'Tên cấp lớp là bắt buộc'
  })
});

export const updateLevelSchema = Joi.object({
  name: Joi.string().messages({
    'string.empty': 'Tên cấp lớp không được để trống'
  })
});