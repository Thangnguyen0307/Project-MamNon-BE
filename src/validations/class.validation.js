import Joi from 'joi';

export const createClassSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.min': 'Tên lớp phải có ít nhất 2 ký tự',
            'string.max': 'Tên lớp không được vượt quá 100 ký tự',
            'string.empty': 'Tên lớp không được để trống',
            'any.required': 'Tên lớp là bắt buộc'
        }),

    level: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'string.pattern.base': 'ID cấp độ không hợp lệ',
            'string.empty': 'Cấp độ không được để trống',
            'any.required': 'Cấp độ là bắt buộc'
        }),

    teachers: Joi.array()
        .items(
            Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
                'string.pattern.base': 'ID giáo viên không hợp lệ'
            })
        )
        .min(0)
        .default([])
        .messages({
            'string.pattern.base': 'ID giáo viên không hợp lệ'
        }),

    schoolYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/)
        .required()
        .messages({
            'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)',
            'string.empty': 'Năm học không được để trống',
            'any.required': 'Năm học là bắt buộc'
        })
}).options({ abortEarly: false, stripUnknown: true });

export const updateClassSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .messages({
            'string.min': 'Tên lớp phải có ít nhất 2 ký tự',
            'string.max': 'Tên lớp không được vượt quá 100 ký tự',
            'string.empty': 'Tên lớp không được để trống'
        }),

    level: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID cấp độ không hợp lệ',
            'string.empty': 'Cấp độ không được để trống'
        }),

    teachers: Joi.array()
        .items(
            Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
                'string.pattern.base': 'ID giáo viên không hợp lệ'
            })
        )
        .min(0)
        .messages({
            'string.pattern.base': 'ID giáo viên không hợp lệ'
        }),

    schoolYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/)
        .messages({
            'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY (ví dụ: 2024-2025)',
            'string.empty': 'Năm học không được để trống'
        })
}).options({ abortEarly: false, stripUnknown: true });

// Schema for query parameters
export const getClassesQuerySchema = Joi.object({
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
        }),

    level: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID cấp độ không hợp lệ'
        }),

    schoolYear: Joi.string()
        .pattern(/^\d{4}-\d{4}$/)
        .messages({
            'string.pattern.base': 'Năm học phải có định dạng YYYY-YYYY'
        })
}).options({ abortEarly: false, stripUnknown: true });
