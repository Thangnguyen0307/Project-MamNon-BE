import Joi from 'joi';

export const createLevelSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Tên cấp độ phải có ít nhất 2 ký tự',
            'string.max': 'Tên cấp độ không được vượt quá 50 ký tự',
            'string.empty': 'Tên cấp độ không được để trống',
            'any.required': 'Tên cấp độ là bắt buộc'
        })
}).options({ abortEarly: false, stripUnknown: true });

export const updateLevelSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'Tên cấp độ phải có ít nhất 2 ký tự',
            'string.max': 'Tên cấp độ không được vượt quá 50 ký tự',
            'string.empty': 'Tên cấp độ không được để trống'
        })
}).options({ abortEarly: false, stripUnknown: true });

export const getLevelsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.min': 'Trang phải lớn hơn 0',
            'number.integer': 'Trang phải là số nguyên'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.min': 'Số lượng phải lớn hơn 0',
            'number.max': 'Số lượng không được vượt quá 100',
            'number.integer': 'Số lượng phải là số nguyên'
        }),

    search: Joi.string()
        .allow('')
        .max(100)
        .messages({
            'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
        })
}).options({ abortEarly: false, stripUnknown: true });