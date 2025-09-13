import joiToSwagger from 'joi-to-swagger';
import { 
    createLevelSchema, 
    updateLevelSchema, 
    getLevelsQuerySchema 
} from '../validations/level.validation.js';

const { swagger: CreateLevelRequest } = joiToSwagger(createLevelSchema);
const { swagger: UpdateLevelRequest } = joiToSwagger(updateLevelSchema);
const { swagger: GetLevelsQuery } = joiToSwagger(getLevelsQuerySchema);

export default {
    CreateLevelRequest,
    UpdateLevelRequest,
    GetLevelsQuery
};