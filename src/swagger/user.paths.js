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
    '/api/user/teachers': {
    get: {
      tags: ['Users'],
      summary: ' Lấy danh sách giáo viên ',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Trang hiện tại (mặc định = 1)',
          example: 1
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Số lượng item mỗi trang (mặc định = 10, tối đa = 100)',
          example: 10
        }
      ],
      responses: {
        200: {
          description: 'Lấy danh sách giáo viên thành công',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GetTeachersResponse' },
              examples: {
                success: {
                  summary: 'Ví dụ thành công',
                  value: {
                    success: true,
                    message: 'Lấy danh sách giáo viên thành công',
                    data: {
                      users: [
                        {
                          id: '68c7a833691701c8d2a9d3b9',
                          email: 'teacher1@example.com',
                          fullName: 'Nguyễn Văn A',
                          role: 'TEACHER',
                          isActive: true,
                          createdAt: '2025-09-12T07:37:29.843Z',
                          updatedAt: '2025-09-16T05:37:35.796Z'
                        },
                        {
                          id: '68c3c432b180b339805cb5e5',
                          email: 'teacher2@example.com',
                          fullName: 'Trần Thị B',
                          role: 'TEACHER',
                          isActive: false,
                          createdAt: '2025-09-13T07:37:34.758Z',
                          updatedAt: '2025-09-17T05:13:20.832Z'
                        }
                      ],
                      pagination: {
                        page: 1,
                        limit: 10,
                        total: 2,
                        pages: 1
                      }
                    }
                  }
                }
              }
            }
          }
        },
        400: {
          description: 'Tham số không hợp lệ (page/limit)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                invalid: {
                  summary: 'Ví dụ lỗi 400',
                  value: {
                    success: false,
                    message: 'Validation error: "page" must be a number'
                  }
                }
              }
            }
          }
        },
        500: {
          description: 'Lỗi server',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              examples: {
                server: {
                  summary: 'Ví dụ lỗi 500',
                  value: {
                    success: false,
                    message: 'Lỗi server'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};