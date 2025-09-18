import Joi from 'joi';

export const initVideoSchema = Joi.object({
  originalName: Joi.string().max(255).optional(),
  totalChunks: Joi.number().integer().min(1).optional()
});

export const chunkParamsSchema = Joi.object({
  id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
});

export const uploadVideoChunkSchema = Joi.object({
  chunkIndex: Joi.number().integer().min(0).required(),
  totalChunks: Joi.number().integer().min(1).required()
}).custom((value, helpers) => {
  if (value.chunkIndex >= value.totalChunks) {
    return helpers.error('any.invalid', { message: 'chunkIndex must be < totalChunks' });
  }
  return value;
}, 'chunkIndex < totalChunks rule');

export default {
  initVideoSchema,
  chunkParamsSchema,
  uploadVideoChunkSchema
};