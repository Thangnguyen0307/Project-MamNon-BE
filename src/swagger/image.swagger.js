export const imageSwagger = {
  '/api/images/upload': {
    post: {
      security: [{ bearerAuth: [] }],
      tags: ['Images'],
      summary: 'Upload hình ảnh (blog hoặc avatar)',
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['blog', 'avatar'],
                  default: 'blog',
                  description: 'Loại hình ảnh (blog hoặc avatar)'
                },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  minItems: 1,
                  maxItems: 10,
                  description: 'Mảng file hình ảnh để upload (1-10 file)'
                }
              },
              required: ['images']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Upload hình thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      urls: { 
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Mảng URL hình đã upload' 
                      },
                      type: { type: 'string', description: 'Loại hình đã upload' }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'Không có file nào được upload hoặc loại hình không hợp lệ.' }
      }
    }
  },
  '/api/images/delete': {
    delete: {
      security: [{ bearerAuth: [] }],
      tags: ['Images'],
      summary: 'Xóa nhiều hình ảnh cùng lúc (tự động tìm trong cả blogs và avatars)',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                filenames: {
                  type: 'array',
                  items: { type: 'string' },
                  minItems: 1,
                  description: 'Mảng tên file cần xóa (không cần biết type, tự động tìm)'
                }
              },
              required: ['filenames']
            }
          }
        }
      },
      responses: {
        200: { 
          description: 'Xóa tất cả file thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  message: { type: 'string' },
                  data: {
                    type: 'object',
                    properties: {
                      total: { type: 'number' },
                      success: { type: 'number' },
                      failed: { type: 'number' },
                      results: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            filename: { type: 'string' },
                            status: { type: 'string' },
                            location: { type: 'string' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        207: { description: 'Một số file được xóa thành công' },
        404: { description: 'Không thể xóa file nào' },
        400: { description: 'Dữ liệu không hợp lệ' }
      }
    }
  }
};
