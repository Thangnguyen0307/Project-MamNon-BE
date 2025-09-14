import ClassSchema from '../schemas/class.schema.js';

export const classSwagger = {
  '/api/classes': {
    get: {
      tags: ['Classes'],
      summary: 'Lấy danh sách tất cả lớp học',
      parameters: [
        {
          in: 'query',
          name: 'level',
          schema: { type: 'string' },
          description: 'Lọc theo level ID'
        },
        {
          in: 'query',
          name: 'schoolYear',
          schema: { type: 'string' },
          description: 'Lọc theo năm học'
        },
        {
          in: 'query',
          name: 'teacher',
          schema: { type: 'string' },
          description: 'Lọc theo giáo viên ID'
        }
      ],
      responses: {
        200: {
          description: 'Lấy danh sách lớp học thành công',
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
                        level: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            name: { type: 'string' }
                          }
                        },
                        teachers: {
                          type: 'array',
                          items: {
                            type: 'object',
                            properties: {
                              _id: { type: 'string' },
                              username: { type: 'string' },
                              fullName: { type: 'string' }
                            }
                          }
                        },
                        schoolYear: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                      }
                    }
                  },
                  message: { type: 'string', example: 'Lấy danh sách lớp học thành công' }
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
      tags: ['Classes'],
      summary: 'Tạo lớp học mới',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: ClassSchema.CreateClassRequest,
          }
        }
      },
      responses: {
        201: {
          description: 'Tạo lớp học thành công',
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
                      level: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      },
                      teachers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            username: { type: 'string' },
                            fullName: { type: 'string' }
                          }
                        }
                      },
                      schoolYear: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Tạo lớp học thành công' }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        409: { description: 'Lớp học đã tồn tại' },
        404: { description: 'Level hoặc giáo viên không tồn tại' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    }
  },
  '/api/classes/{id}': {
    get: {
      tags: ['Classes'],
      summary: 'Lấy thông tin lớp học theo ID',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lớp học'
        }
      ],
      responses: {
        200: {
          description: 'Lấy thông tin lớp học thành công',
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
                      level: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      },
                      teachers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            username: { type: 'string' },
                            fullName: { type: 'string' }
                          }
                        }
                      },
                      schoolYear: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Lấy thông tin lớp học thành công' }
                }
              }
            }
          }
        },
        404: { description: 'Không tìm thấy lớp học' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    },
    put: {
      tags: ['Classes'],
      summary: 'Cập nhật thông tin lớp học',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lớp học'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: ClassSchema.UpdateClassRequest,
          }
        }
      },
      responses: {
        200: {
          description: 'Cập nhật lớp học thành công',
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
                      level: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          name: { type: 'string' }
                        }
                      },
                      teachers: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            username: { type: 'string' },
                            fullName: { type: 'string' }
                          }
                        }
                      },
                      schoolYear: { type: 'string' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  },
                  message: { type: 'string', example: 'Cập nhật lớp học thành công' }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        404: { description: 'Không tìm thấy lớp học' },
        409: { description: 'Lớp học đã tồn tại' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    },
    delete: {
      tags: ['Classes'],
      summary: 'Xóa lớp học',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của lớp học'
        }
      ],
      responses: {
        200: {
          description: 'Xóa lớp học thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  data: { type: 'object', example: null },
                  message: { type: 'string', example: 'Xóa lớp học thành công' }
                }
              }
            }
          }
        },
        404: { description: 'Không tìm thấy lớp học' },
        401: { description: 'Không có quyền truy cập' },
        500: { description: 'Lỗi server' }
      }
    }
  }
};