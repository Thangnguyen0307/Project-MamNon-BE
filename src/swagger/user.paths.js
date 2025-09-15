import UserSchema from '../schemas/user.schema.js';

export const userPaths = {
    '/api/user/': {
        get: {
            tags: ['Admins'],
            summary: 'Admin lấy danh sách tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
                { name: 'limit', in: 'query', schema: { type: 'integer', example: 20 } },
                { name: 'role', in: 'query', schema: { type: 'string', example: 'TEACHER' } },
                { name: 'keyword', in: 'query', schema: { type: 'string', example: 'Name' } }
            ],
            responses: {
                200: { description: 'Danh sách tài khoản' }
            }
        }
    },
    '/api/user/my-account': {
        get: {
            tags: ['Users'],
            summary: 'User xem chi tiết tài khoản',
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: 'Thông tin tài khoản' },
                404: { description: 'User không tồn tại' }
            }
        },
        put: {
            tags: ['Users'],
            summary: 'User cập nhật thông tin tài khoản',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: UserSchema.UpdateUserRequest
                    }
                }
            },
            responses: {
                200: { description: 'Cập nhật thành công' },
                404: { description: 'User không tồn tại' }
            }
        },
        delete: {
            tags: ['Users'],
            summary: 'User xóa tài khoản',
            security: [{ bearerAuth: [] }],
            responses: {
                200: { description: 'Đã xóa user thành công' },
                404: { description: 'User không tồn tại' }
            }
        }
    },
    '/api/user/{id}/status': {
        put: {
            tags: ['Admins'],
            summary: 'Admin khóa/mở khóa tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: UserSchema.UpdateUserStatusRequest
                    }
                }
            },
            responses: {
                200: { description: 'Cập nhật trạng thái thành công' },
                404: { description: 'User không tồn tại' }
            }
        }
    },
    '/api/user/{id}/role': {
        put: {
            tags: ['Admins'],
            summary: 'Admin đổi role tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: UserSchema.UpdateUserRoleRequest
                    }
                }
            },
            responses: {
                200: { description: 'Cập nhật role thành công' },
                404: { description: 'User không tồn tại' }
            }
        }
    },
};