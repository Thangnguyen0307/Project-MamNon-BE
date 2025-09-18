import Joi from 'joi';

export const createBlogSchema = Joi.object({
    title: Joi.string()
        .required()
        .min(1)
        .max(200)
        .messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.min': 'Tiêu đề phải có ít nhất 1 ký tự',
            'string.max': 'Tiêu đề không được vượt quá 200 ký tự',
            'any.required': 'Tiêu đề là bắt buộc'
        }),
    
    content: Joi.string()
        .required()
        .min(1)
        .messages({
            'string.empty': 'Nội dung không được để trống',
            'string.min': 'Nội dung phải có ít nhất 1 ký tự',
            'any.required': 'Nội dung là bắt buộc'
        }),
    
    class: Joi.string()
        .required()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.empty': 'ID lớp học không được để trống',
            'string.pattern.base': 'ID lớp học không hợp lệ',
            'any.required': 'ID lớp học là bắt buộc'
        }),
    
    images: Joi.any().optional(), // Allow images field from form-data
    image: Joi.any().optional() // Allow single image field from form-data
});

export const updateBlogSchema = Joi.object({
    title: Joi.string()
        .min(1)
        .max(200)
        .messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.min': 'Tiêu đề phải có ít nhất 1 ký tự',
            'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
        }),
    
    content: Joi.string()
        .min(1)
        .messages({
            'string.empty': 'Nội dung không được để trống',
            'string.min': 'Nội dung phải có ít nhất 1 ký tự'
        }),
    
    class: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID lớp học không hợp lệ'
        }),
    
    images: Joi.any().optional(), // Allow images field from form-data
    image: Joi.any().optional(), // Allow single image field from form-data
    existingImages: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional() // Allow existingImages as array or single string
});

export const getBlogsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Số trang phải là số nguyên',
            'number.min': 'Số trang phải lớn hơn 0'
        }),
    
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Số lượng phải là số nguyên',
            'number.min': 'Số lượng phải lớn hơn 0',
            'number.max': 'Số lượng không được vượt quá 100'
        }),
    
    class: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID lớp học không hợp lệ'
        }),
    
    author: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'ID tác giả không hợp lệ'
        }),
    
    search: Joi.string()
        .allow('')
        .max(100)
        .messages({
            'string.max': 'Từ khóa tìm kiếm không được vượt quá 100 ký tự'
        })
});