export const messageSwagger = {
    '/api/messages/{conversationId}': {
        get: {
            tags: ['Messages'],
            summary: 'Lấy danh sách tất cả tin nhắn của một cuộc trò chuyện',
            security: [{ bearerAuth: [] }],
            parameters: [
                {
                    in: 'query',
                    name: 'page',
                    schema: { type: 'integer', default: 1 },
                    description: 'Trang hiện tại (mặc định = 1)'
                },
                {
                    in: 'query',
                    name: 'limit',
                    schema: { type: 'integer', default: 10 },
                    description: 'Số lượng item mỗi trang (mặc định = 10)'
                },
                {
                    in: 'path',
                    name: 'conversationId',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID của cuộc trò chuyện'
                }
            ],
            responses: {
                200: { description: 'Lấy danh sách tất cả tin nhắn thành công' },
                401: { description: 'Không có quyền truy cập' },
                500: { description: 'Lỗi server' }
            }
        },
    },

    '/api/messages/send-image': {
        post: {
            tags: ['Messages'],
            summary: 'Gửi tin nhắn hình ảnh đến người dùng qua Zalo',
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    'multipart/form-data': {
                        schema: {
                            type: 'object',
                            properties: {
                                conversationId: {
                                    type: 'string',
                                    description: 'ID của người dùng (bắt buộc khi type = avatar)'
                                },
                                description: {
                                    type: 'string',
                                    description: 'Mô tả hình ảnh',
                                },
                                file: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                        format: 'binary'
                                    },
                                    description: 'Mảng file hình ảnh để upload (1-10 file)'
                                }
                            },
                            required: ['file', 'conversationId']
                        }
                    }
                }
            },
            responses: {
                200: { description: 'Gửi tin nhắn hình ảnh thành công' },
                400: { description: 'Yêu cầu không hợp lệ' },
                401: { description: 'Không có quyền truy cập' },
                500: { description: 'Lỗi server' }
            }
        }
    }
};