import joiToSwagger from 'joi-to-swagger';
import { resetPasswordSchema, loginSchema, refreshTokenSchema, logoutSchema  } from '../validations/auth.validation.js';

const { swagger: LoginRequest } = joiToSwagger(loginSchema);
const { swagger: ResetPasswordRequest } = joiToSwagger(resetPasswordSchema);
const { swagger: RefreshTokenRequest } = joiToSwagger(refreshTokenSchema);
const { swagger: LogoutRequest } = joiToSwagger(logoutSchema);

export default {
    LoginRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    LogoutRequest
};
