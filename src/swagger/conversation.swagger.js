export const conversationSwagger = {
    '/api/conversations': {
        get: {
            tags: ['Conversations'],
            summary: 'Lấy danh sách tất cuộc trò chuyện',
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
            ],
            responses: {
                200: { description: 'Lấy danh sách cuộc trò chuyện thành công' },
                401: { description: 'Không có quyền truy cập' },
                500: { description: 'Lỗi server' }
            }
        },
    }
};