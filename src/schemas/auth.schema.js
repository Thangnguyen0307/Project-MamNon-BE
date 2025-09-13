import joiToSwagger from 'joi-to-swagger';
import { resetPasswordSchema, loginSchema, refreshTokenSchema, logoutSchema, sendOtpSchema, updatePasswordSchema  } from '../validations/auth.validation.js';

const { swagger: LoginRequest } = joiToSwagger(loginSchema);
const { swagger: ResetPasswordRequest } = joiToSwagger(resetPasswordSchema);
const { swagger: RefreshTokenRequest } = joiToSwagger(refreshTokenSchema);
const { swagger: LogoutRequest } = joiToSwagger(logoutSchema);
const { swagger: SendOtpRequest } = joiToSwagger(sendOtpSchema);
const { swagger: UpdatePasswordRequest } = joiToSwagger(updatePasswordSchema);

export default {
    LoginRequest,
    ResetPasswordRequest,
    RefreshTokenRequest,
    LogoutRequest,
    SendOtpRequest,
    UpdatePasswordRequest,
};
