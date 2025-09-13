import joiToSwagger from 'joi-to-swagger';
import { 
    createClassSchema, 
    updateClassSchema, 
    getClassesQuerySchema 
} from '../validations/class.validation.js';

const { swagger: CreateClassRequest } = joiToSwagger(createClassSchema);
const { swagger: UpdateClassRequest } = joiToSwagger(updateClassSchema);
const { swagger: GetClassesQuery } = joiToSwagger(getClassesQuerySchema);

export default {
    CreateClassRequest,
    UpdateClassRequest,
    GetClassesQuery
};