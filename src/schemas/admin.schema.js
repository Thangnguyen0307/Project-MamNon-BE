import joiToSwagger from 'joi-to-swagger';
import { createAccountSchema } from '../validations/admin.validation.js';

const { swagger: CreateAccountRequest } = joiToSwagger(createAccountSchema);

export default {
    CreateAccountRequest
};