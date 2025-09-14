import express from 'express';
import * as levelController from '../controllers/level.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { 
    createLevelSchema, 
    updateLevelSchema, 
    getLevelsQuerySchema 
} from '../validations/level.validation.js';

const levelRouter = express.Router();

levelRouter.get('/', validate(getLevelsQuerySchema, 'query'), levelController.getAllLevels);
levelRouter.get('/:id', levelController.getLevelById);
levelRouter.post('/', authenticate, authorize(ROLE.ADMIN), validate(createLevelSchema), levelController.createLevel);
levelRouter.put('/:id', authenticate, authorize(ROLE.ADMIN), validate(updateLevelSchema), levelController.updateLevel);
levelRouter.delete('/:id', authenticate, authorize(ROLE.ADMIN), levelController.deleteLevel);

export default levelRouter;