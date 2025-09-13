import Joi from 'joi';

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Email không hợp lệ',
            'string.empty': 'Email không được để trống',
            'any.required': 'Email là bắt buộc'
        }),

    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Mật khẩu không được để trống',
            'any.required': 'Mật khẩu là bắt buộc',
        })
}).options({ abortEarly: false, stripUnknown: true });

export const resetPasswordSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            'string.email': 'Email không hợp lệ',
            'string.empty': 'Email không được để trống',
            'any.required': 'Email là bắt buộc'
        }),

    otpCode: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP phải gồm đúng 6 chữ số',
            'string.pattern.base': 'OTP chỉ được chứa chữ số',
            'string.empty': 'OTP không được để trống',
            'any.required': 'OTP là bắt buộc'
        }),

    newPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Mật khẩu mới không được để trống',
            'any.required': 'Mật khẩu mới là bắt buộc'
        })
}).options({ abortEarly: false, stripUnknown: true });

export const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh Token không được để trống',
        'any.required': 'Refresh Token là bắt buộc',
    }),
}).options({ abortEarly: false, stripUnknown: true });

export const sendOtpSchema = Joi.object({
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Email không hợp lệ',
        'string.empty': 'Email không được để trống',
        'any.required': 'Email là bắt buộc',
    }),
    // type nằm ở query string → validate riêng trong middleware nếu cần
}).options({ abortEarly: false, stripUnknown: true });

export const logoutSchema = Joi.object({
    refreshToken: Joi.string().required().messages({
        'string.empty': 'Refresh Token không được để trống',
        'any.required': 'Refresh Token là bắt buộc',
    }),
}).options({ abortEarly: false, stripUnknown: true });

export const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'string.empty': 'Mật khẩu hiện tại không được để trống',
            'any.required': 'Mật khẩu hiện tại là bắt buộc',
        }),

    newPassword: Joi.string()
        .required()
        .not(Joi.ref('currentPassword'))
        .messages({
            'string.empty': 'Mật khẩu mới không được để trống',
            'any.required': 'Mật khẩu mới là bắt buộc',
            'any.invalid': 'Mật khẩu mới không được giống mật khẩu hiện tại',   
        })
}).options({ abortEarly: false, stripUnknown: true });
