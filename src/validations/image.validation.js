import Joi from 'joi';

export const uploadImagesSchema = Joi.object({
  type: Joi.string()
    .valid('blog', 'avatar')
    .default('blog')
    .messages({
      'any.only': 'Loại hình chỉ được phép là: blog hoặc avatar'
    }),
  classId: Joi.when('type', {
    is: 'blog',
    then: Joi.string()
      .required()
      .messages({
        'any.required': 'classId là bắt buộc khi upload hình cho blog',
        'string.base': 'classId phải là chuỗi'
      }),
    otherwise: Joi.forbidden()
  }),
  userId: Joi.when('type', {
    is: 'avatar',
    then: Joi.string()
      .required()
      .messages({
        'any.required': 'userId là bắt buộc khi upload avatar',
        'string.base': 'userId phải là chuỗi'
      }),
    otherwise: Joi.forbidden()
  }),
  images: Joi.array()
    .items(Joi.any())
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.base': 'Phải là mảng hình ảnh',
      'array.min': 'Phải upload ít nhất 1 hình',
      'array.max': 'Tối đa 10 hình mỗi lần upload',
      'any.required': 'Phải có field images để upload hình'
    })
});
