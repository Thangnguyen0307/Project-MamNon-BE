import { MailType } from '../constants/mail.constant.js';
import AuthSchema from '../schemas/auth.schema.js';
import LevelSchema from '../schemas/level.schema.js';
import ClassSchema from '../schemas/class.schema.js';
import BlogSchema from '../schemas/blog.schema.js';
import { classSwagger } from './class.swagger.js';
import { levelSwagger } from './level.swagger.js';
import { blogSwagger } from './blog.swagger.js';
import { imageSwagger } from './image.swagger.js';
import UserSchema from '../schemas/user.schema.js';
import { userPaths } from './user.paths.js';
import AdminSchema from '../schemas/admin.schema.js';
const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Media Mam Non API',
        version: '1.0.0',
    },
    servers: [
        {
            url: 'http://localhost:8080',       // Dev local
            description: 'Local Development',
        },
        {
            url: '/projects/mam-non-media',     // Prod qua Nginx
            description: 'Production - Techleaf',
        },
    ],
    paths: {
        ///------------------- API USER
        ...userPaths,
        //------------------- API AUTH
        ...imageSwagger,
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
        "/api/auth/send-otp": {
            post: {
                tags: ["Auths"],
                summary: "Gửi OTP về email",
                description: "Gửi OTP theo loại mail (MailType).",
                parameters: [
                    {
                        name: "type",
                        in: "query",
                        required: true,
                        schema: {
                            type: "string",
                            enum: [MailType.RESET_PASSWORD],
                        },
                        description: "Loại OTP cần gửi",
                        example: "RESET_PASSWORD"
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: AuthSchema.SendOtpRequest
                        }
                    }
                },
                responses: {
                    200: {
                        description: "Gửi OTP thành công",
                    },
                    400: {
                        description: "Dữ liệu không hợp lệ hoặc type sai",
                    },
                    500: {
                        description: "Lỗi hệ thống",
                    }
                }
            }
        },
        '/api/auth/update-password': {
            put: {
                tags: ['Auths'],
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: AuthSchema.UpdatePasswordRequest,
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Cập nhật mật khẩu thành công'
                    },
                    400: {
                        description: 'Dữ liệu không hợp lệ'
                    },
                }
            }
        },

        //------------------- API ADMIN
        "/api/admins/create-account": {
            post: {
                tags: ["Admins"],
                summary: "Tạo tài khoản người dùng mới",
                description: "Chỉ ADMIN được phép tạo tài khoản, mật khẩu sẽ được gửi qua email.",
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: AdminSchema.CreateAccountRequest
                        }
                    }
                },
                responses: {
                    201: {
                        description: "Tài khoản đã được tạo và gửi mật khẩu qua email",
                    },
                    400: {
                        description: "Email đã tồn tại hoặc dữ liệu không hợp lệ",
                    },
                    401: {
                        description: "Không có quyền tạo tài khoản",
                    },
                    500: {
                        description: "Lỗi hệ thống",
                    }
                }
            }
        },
        ...classSwagger,
        ...levelSwagger,
        ...blogSwagger
    },
    components: {
        schemas: {
            ...AuthSchema,
            ...LevelSchema,
            ...ClassSchema,
            ...BlogSchema,
            ...UserSchema,
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
