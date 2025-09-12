import joiToSwagger from 'joi-to-swagger';
import { updateUserSchema, updateUserStatusSchema, updateUserRoleSchema } from '../validations/user.validation.js';

const { swagger: UpdateUserRequest } = joiToSwagger(updateUserSchema);
const { swagger: UpdateUserStatusRequest } = joiToSwagger(updateUserStatusSchema);
const { swagger: UpdateUserRoleRequest } = joiToSwagger(updateUserRoleSchema);

export default {
    UpdateUserRequest,
    UpdateUserStatusRequest,
    UpdateUserRoleRequest
};
