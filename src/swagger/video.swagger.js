export const videoSwagger = {
  '/api/videos/init': {
    post: {
      tags: ['Videos'],
      summary: 'Khởi tạo phiên upload video (Level 2 async)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InitVideoRequest' },
            examples: {
              basic: {
                summary: 'Khởi tạo đơn giản (server tự sinh _id)',
                value: {}
              },
              withMeta: {
                summary: 'Khởi tạo kèm tên gốc & tổng chunk',
                value: { originalName: 'baigiang-week1.mp4', totalChunks: 42 }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Khởi tạo thành công (server tự sinh _id)',
          content: { 'application/json': { schema: { type:'object', properties:{ success:{type:'boolean'}, message:{type:'string'}, data:{ type:'object' } } }, examples:{
            created: {
              summary: 'Tạo mới',
              value: {
                success: true,
                message: 'Init video ok',
                data: { _id: '66f0c2c9e8e4c2f9f0b12345', status: 'uploading', totalChunks: 42, receivedChunks: 0, originalName: 'baigiang-week1.mp4', createdAt: '2025-09-16T03:21:55.123Z' }
              }
            }
          } } }
        },
        401: { description: 'Không có quyền' }
      }
    }
  },
  '/api/videos/{id}/chunk': {
    post: {
      tags: ['Videos'],
      summary: 'Gửi 1 chunk dữ liệu video',
      security: [{ bearerAuth: [] }],
  parameters: [ { in:'path', name:'id', required:true, schema:{ type:'string', pattern:'^[0-9a-fA-F]{24}$' }, description:'ID video do server sinh từ bước init' } ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                chunkIndex: { type: 'integer', minimum: 0, description:'Thứ tự chunk (0-based)' },
                totalChunks: { type: 'integer', minimum: 1, description:'Tổng số chunk' },
                file: { type: 'string', format: 'binary', description:'Chunk data' }
              },
              required: ['chunkIndex','totalChunks','file']
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Chunk OK hoặc đã đủ và lên lịch xử lý',
          content: { 'application/json': { schema: { type:'object', properties:{ success:{type:'boolean'}, message:{type:'string'}, data:{ type:'object', properties:{ received:{type:'integer'}, done:{type:'boolean'}, status:{ type:'string', description:'uploading|uploaded|processing|ready|failed' } } } } }, examples: {
            partial: {
              summary: 'Đang upload (chưa đủ)',
              value: { success:true, message:'Chunk received', data:{ received: 5, done: false, status: 'uploading' } }
            },
            lastChunk: {
              summary: 'Chunk cuối cùng (bắt đầu xử lý)',
              value: { success:true, message:'All chunks received - processing scheduled', data:{ received: 42, done: true, status: 'uploaded' } }
            }
          } } }
        },
        400: { description: 'Thiếu tham số hoặc file' }
      }
    }
  },
  // status endpoint removed per user's request
};
