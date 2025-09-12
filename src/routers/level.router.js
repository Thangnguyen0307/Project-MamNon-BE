import express from 'express';
import * as levelController from '../controllers/level.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createLevelSchema, updateLevelSchema } from '../validations/level.validation.js';

const router = express.Router();

router.post('/', authMiddleware, validate(createLevelSchema), levelController.createLevel);
router.get('/', levelController.getAllLevels);
router.get('/:id', levelController.getLevelById);
router.put('/:id', authMiddleware, validate(updateLevelSchema), levelController.updateLevel);
router.delete('/:id', authMiddleware, levelController.deleteLevel);

export default router;