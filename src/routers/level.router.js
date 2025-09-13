import express from 'express';
import { createLevel, getAllLevels, getLevelById, updateLevel, deleteLevel } from '../controllers/level.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { 
    createLevelSchema, 
    updateLevelSchema, 
    getLevelsQuerySchema 
} from '../validations/level.validation.js';

const levelRouter = express.Router();


levelRouter.post('/', authenticate, authorize(ROLE.ADMIN), validate(createLevelSchema), createLevel);
levelRouter.get('/', authenticate, validate(getLevelsQuerySchema, 'query'), getAllLevels);
levelRouter.get('/:id', authenticate, getLevelById);
levelRouter.put('/:id', authenticate, authorize(ROLE.ADMIN), validate(updateLevelSchema), updateLevel);
levelRouter.delete('/:id', authenticate, authorize(ROLE.ADMIN), deleteLevel);

export default levelRouter;