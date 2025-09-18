import express from 'express';
import * as classController from '../controllers/class.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { 
    createClassSchema, 
    updateClassSchema, 
    getClassesQuerySchema 
} from '../validations/class.validation.js';

const classRouter = express.Router();
classRouter.get('/user', authenticate, authorize(ROLE.TEACHER), classController.getMyClasses);
classRouter.get('/', validate(getClassesQuerySchema, 'query'), classController.getAllClasses);
classRouter.get('/:id', classController.getClassById);
classRouter.post('/', authenticate, authorize(ROLE.ADMIN), validate(createClassSchema), classController.createClass);
classRouter.put('/:id', authenticate, authorize(ROLE.ADMIN), validate(updateClassSchema), classController.updateClass);
classRouter.delete('/:id', authenticate, authorize(ROLE.ADMIN), classController.deleteClass);


export default classRouter;
