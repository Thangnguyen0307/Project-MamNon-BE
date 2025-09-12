import { MailType } from '../constants/mail.constant.js';
import AuthSchema from '../schemas/auth.schema.js';
import { classroomSwagger, classroomSchemas } from './classroom.swagger.js';
import { levelSwagger, levelSchemas } from './level.swagger.js';
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Media API',
        version: '1.0.0',
    },
    paths: {
        ...{
            '/api/auth/login': {
                post: {
                    tags: ['Auths'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: AuthSchema.LoginRequest,
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Đăng nhập thành công',
                        },
                        400: {
                            description: 'Dữ liệu không hợp lệ',
                        },
                    }
                }
            },
            '/api/auth/reset-password': {
                put: {
                    tags: ['Auths'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: AuthSchema.ResetPasswordRequest,
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: 'Đặt lại mật khẩu thành công'
                        },
                        400: {
                            description: 'Dữ liệu không hợp lệ'
                        }
                    }
                }
            },
            "/api/auth/refresh-token": {
                post: {
                    tags: ["Auths"],
                    summary: "Làm mới token",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: AuthSchema.RefreshTokenRequest,
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Trả về access token mới",
                        },
                    }
                }
            },
            "/api/auth/logout": {
                post: {
                    tags: ["Auths"],
                    summary: "Đăng xuất",
                    description: "Thu hồi refresh token và đăng xuất người dùng.",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: AuthSchema.LogoutRequest
                            }
                        }
                    },
                    responses: {
                        200: {
                            description: "Đăng xuất thành công, refresh token đã bị thu hồi",
                        },
                        400: {
                            description: "Dữ liệu không hợp lệ hoặc thiếu refreshToken",
                        },
                        401: {
                            description: "Token không hợp lệ hoặc đã hết hạn",
                        },
                        500: {
                            description: "Lỗi hệ thống",
                        }
                    }
                }
            },
        },
        ...classroomSwagger,
        ...levelSwagger
    },
    components: {
        schemas: {
            ...AuthSchema,
            ...classroomSchemas,
            ...levelSchemas
        },
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};
export default swaggerDocument;
