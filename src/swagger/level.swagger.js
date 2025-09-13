import LevelSchema from '../schemas/level.schema.js';

export const levelSwagger = {
  '/api/levels': {
    get: {
      tags: ['Levels'],
      summary: 'Lấy danh sách tất cả levels',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Lấy danh sách levels thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        _id: { type: 'string' },
                        name: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  },
                  message: { type: 'string', example: 'Lấy danh sách levels thành công' }
                }
              }
            }
          }
        },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    },
    post: {
      tags: ['Levels'],
      summary: 'Tạo level mới',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LevelSchema.CreateLevelRequest,
          }
        }
      },
      responses: {
        201: {
          description: 'Tạo level thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Tạo level thành công' }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        409: { description: 'Level đã tồn tại' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    }
  },
  '/api/levels/{id}': {
    get: {
      tags: ['Levels'],
      summary: 'Lấy thông tin level theo ID',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của level'
        }
      ],
      responses: {
        200: {
          description: 'Lấy thông tin level thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Lấy thông tin level thành công' }
                }
              }
            }
          }
        },
        404: { description: 'Không tìm thấy level' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    },
    put: {
      tags: ['Levels'],
      summary: 'Cập nhật thông tin level',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của level'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: LevelSchema.UpdateLevelRequest,
          }
        }
      },
      responses: {
        200: {
          description: 'Cập nhật level thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      name: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Cập nhật level thành công' }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        404: { description: 'Không tìm thấy level' },
        409: { description: 'Level đã tồn tại' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    },
    delete: {
      tags: ['Levels'],
      summary: 'Xóa level',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của level'
        }
      ],
      responses: {
        200: {
          description: 'Xóa level thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'object', example: null },
                  message: { type: 'string', example: 'Xóa level thành công' }
                }
              }
            }
          }
        },
        404: { description: 'Không tìm thấy level' },
        400: { description: 'Không thể xóa level đang được sử dụng' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    }
  }
};