export const userPaths = {   
    '/api/user/': {
        get: {
            tags: ['Admin'],
            summary: 'Admin lấy danh sách tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
                { name: 'limit', in: 'query', schema: { type: 'integer', example: 20 } },
                { name: 'role', in: 'query', schema: { type: 'string', example: 'TEACHER' } },
                { name: 'keyword', in: 'query', schema: { type: 'string', example: 'Nguyen' } }
            ],
            responses: {
                200: { description: 'Danh sách tài khoản' }
            }
        }
    },
    '/api/user/{id}': {
        get: {
            tags: ['Admin'],
            summary: 'Admin xem chi tiết tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                200: { description: 'Thông tin tài khoản' },
                404: { description: 'User không tồn tại' }
            }
        },
        put: {
            tags: ['Admin'],
            summary: 'Admin cập nhật thông tin tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                fullName: { type: 'string', example: 'Nguyễn Văn A' },
                                role: { type: 'string', example: 'TEACHER' },
                                isActive: { type: 'boolean', example: true }
                            }
                        }
                    }
                }
            },
            responses: {
                200: { description: 'Cập nhật thành công' },
                404: { description: 'User không tồn tại' }
            }
        },
        delete: {
            tags: ['Admin'],
            summary: 'Admin xóa tài khoản',
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            responses: {
                200: { description: 'Đã xóa user thành công' },
                404: { description: 'User không tồn tại' }
            }
        }
    },
    '/api/user/{id}/status': {
        patch: {
            tags: ['Admin'],
            summary: 'Admin khóa/mở khóa tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                isActive: { type: 'boolean', example: false }
                            }
                        }
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
        patch: {
            tags: ['Admin'],
            summary: 'Admin đổi role tài khoản',
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                role: { type: 'string', example: 'TEACHER' }
                            }
                        }
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