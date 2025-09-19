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
    }
};