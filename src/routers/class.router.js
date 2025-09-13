import express from 'express';
import { createClass, getAllClasses, getClassById, updateClass, deleteClass } from '../controllers/class.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { 
    createClassSchema, 
    updateClassSchema, 
    getClassesQuerySchema 
} from '../validations/class.validation.js';

const classRouter = express.Router();


classRouter.post('/', authenticate, authorize(ROLE.ADMIN), validate(createClassSchema), createClass);
classRouter.get('/', authenticate, validate(getClassesQuerySchema, 'query'), getAllClasses);
classRouter.get('/:id', authenticate, getClassById);
classRouter.put('/:id', authenticate, authorize(ROLE.ADMIN), validate(updateClassSchema), updateClass);
classRouter.delete('/:id', authenticate, authorize(ROLE.ADMIN), deleteClass);

export default classRouter;
