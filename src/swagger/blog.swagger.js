import BlogSchema from '../schemas/blog.schema.js';

export const blogSwagger = {
  '/api/blogs': {
    get: {
      tags: ['Blogs'],
      summary: 'Lấy danh sách tất cả bài viết',
      parameters: [
        {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Số trang'
        },
        {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Số lượng bài viết mỗi trang'
        },
        {
          in: 'query',
          name: 'search',
          schema: { type: 'string' },
          description: 'Tìm kiếm theo tiêu đề hoặc nội dung'
        },
        {
          in: 'query',
          name: 'class',
          schema: { type: 'string' },
          description: 'Lọc theo ID lớp học'
        },
        {
          in: 'query',
          name: 'author',
          schema: { type: 'string' },
          description: 'Lọc theo ID tác giả'
        }
      ],
      responses: {
        200: {
          description: 'Lấy danh sách bài viết thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lấy danh sách bài viết thành công' },
                  data: {
                    type: 'object',
                    properties: {
                      blogs: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            _id: { type: 'string' },
                            title: { type: 'string' },
                            content: { type: 'string' },
                            images: { 
                              type: 'array',
                              items: { type: 'string' }
                            },
                            author: {
                              type: 'object',
                              properties: {
                                _id: { type: 'string' },
                                email: { type: 'string' },
                                fullName: { type: 'string' }
                              }
                            },
                            class: {
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
                                }
                              }
                            },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                          }
                        }
                      },
                      pagination: {
                        type: 'object',
                        properties: {
                          page: { type: 'integer' },
                          limit: { type: 'integer' },
                          total: { type: 'integer' },
                          pages: { type: 'integer' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        500: { description: 'Lỗi server' }
      }
    },
    post: {
      tags: ['Blogs'],
      summary: 'Tạo bài viết mới',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Tiêu đề bài viết' },
                content: { type: 'string', description: 'Nội dung bài viết' },
                class: { type: 'string', description: 'ID lớp học' },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'File hình ảnh để upload (tối đa 10 file)'
                }
              },
              required: ['title', 'content', 'class']
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Tạo bài viết thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Tạo bài viết thành công' },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      title: { type: 'string' },
                      content: { type: 'string' },
                      image: { type: 'string', nullable: true },
                      author: { type: 'object' },
                      class: { type: 'object' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        401: { description: 'Không có quyền truy cập' },
        403: { description: 'Không đủ quyền' },
        404: { description: 'Không tìm thấy lớp học' },
        500: { description: 'Lỗi server' }
      }
    }
  },
  '/api/blogs/{id}': {
    get: {
      tags: ['Blogs'],
      summary: 'Lấy thông tin bài viết theo ID',
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của bài viết'
        }
      ],
      responses: {
        200: {
          description: 'Lấy thông tin bài viết thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Lấy thông tin bài viết thành công' },
                  data: {
                    type: 'object',
                    properties: {
                      _id: { type: 'string' },
                      title: { type: 'string' },
                      content: { type: 'string' },
                      image: { type: 'string', nullable: true },
                      author: { type: 'object' },
                      class: { type: 'object' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' }
                    }
                  }
                }
              }
            }
          }
        },
        404: { description: 'Không tìm thấy bài viết' },
        500: { description: 'Lỗi server' }
      }
    },
    put: {
      tags: ['Blogs'],
      summary: 'Cập nhật bài viết',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của bài viết'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Tiêu đề bài viết' },
                content: { type: 'string', description: 'Nội dung bài viết' },
                class: { type: 'string', description: 'ID lớp học' },
                images: {
                  type: 'array',
                  items: {
                    type: 'string',
                    format: 'binary'
                  },
                  description: 'File hình ảnh mới để upload (sẽ thêm vào danh sách hiện tại)'
                },
                existingImages: {
                  type: 'array',
                  items: { type: 'string' },
                  description: 'Danh sách URL hình ảnh hiện tại muốn giữ lại'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Cập nhật bài viết thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Cập nhật bài viết thành công' },
                  data: { type: 'object' }
                }
              }
            }
          }
        },
        400: { description: 'Dữ liệu không hợp lệ' },
        401: { description: 'Không có quyền truy cập' },
        403: { description: 'Không có quyền chỉnh sửa bài viết này' },
        404: { description: 'Không tìm thấy bài viết' },
        500: { description: 'Lỗi server' }
      }
    },
    delete: {
      tags: ['Blogs'],
      summary: 'Xóa bài viết',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: { type: 'string' },
          description: 'ID của bài viết'
        }
      ],
      responses: {
        200: {
          description: 'Xóa bài viết thành công',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Xóa bài viết thành công' },
                  data: { type: 'null' }
                }
              }
            }
          }
        },
        401: { description: 'Không có quyền truy cập' },
        403: { description: 'Không có quyền xóa bài viết này' },
        404: { description: 'Không tìm thấy bài viết' },
        500: { description: 'Lỗi server' }
      }
    }
  }
};