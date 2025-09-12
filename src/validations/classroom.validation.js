import Joi from 'joi';

export const createClassroomSchema = Joi.object({
  levelId: Joi.string().hex().length(24).required(),
  name: Joi.string().required(),
  teacherId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string().allow('', null),
    Joi.allow(null)
  ).optional(),
  schoolYear: Joi.string().required()
});

export const updateClassroomSchema = Joi.object({
  levelId: Joi.string().hex().length(24),
  name: Joi.string(),
  teacherId: Joi.alternatives().try(
    Joi.string().hex().length(24),
    Joi.string().allow('', null),
    Joi.allow(null)
  ).optional(),
  schoolYear: Joi.string()
});
