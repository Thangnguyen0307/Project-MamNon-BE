const classroomSwagger = {
    "/api/classrooms": {
        post: {
            tags: ["Classrooms"],
            summary: "Tạo lớp học mới",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/ClassroomCreate" }
                    }
                }
            },
            responses: {
                201: { description: "Tạo lớp học thành công" },
                400: { description: "Dữ liệu không hợp lệ" }
            }
        },
        get: {
            tags: ["Classrooms"],
            summary: "Lấy danh sách lớp học",
            security: [{ bearerAuth: [] }],
            responses: {
                200: {
                    description: "Danh sách lớp học",
                    content: {
                        "application/json": {
                            schema: { type: "array", items: { $ref: "#/components/schemas/Classroom" } }
                        }
                    }
                }
            }
        }
    },
    "/api/classrooms/{id}": {
        get: {
            tags: ["Classrooms"],
            summary: "Lấy chi tiết lớp học",
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: {
                200: { description: "Chi tiết lớp học", content: { "application/json": { schema: { $ref: "#/components/schemas/Classroom" } } } },
                404: { description: "Không tìm thấy" }
            }
        },
        put: {
            tags: ["Classrooms"],
            summary: "Cập nhật lớp học",
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/ClassroomUpdate" }
                    }
                }
            },
            responses: {
                200: { description: "Cập nhật thành công" },
                400: { description: "Dữ liệu không hợp lệ" },
                404: { description: "Không tìm thấy" }
            }
        },
        delete: {
            tags: ["Classrooms"],
            summary: "Xoá lớp học",
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: {
                200: { description: "Xoá thành công" },
                404: { description: "Không tìm thấy" }
            }
        }
    }
};

const classroomSchemas = {
    Classroom: {
        type: "object",
        properties: {
            _id: { type: "string" },
            id: { type: "string" },
            levelId: { type: "string", description: "ID cấp lớp" },
            name: { type: "string" },
            teacherId: { type: "string", description: "ID giáo viên chủ nhiệm" },
            schoolYear: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" }
        }
    },
    ClassroomCreate: {
        type: "object",
        required: ["levelId", "name", "schoolYear"],
        properties: {
            levelId: { type: "string", example: "67c2835bc3515d6f5763cff4" },
            name: { type: "string", example: "mầm 1" },
            teacherId: { type: "string", example: "" },
            schoolYear: { type: "string", example: "2024-2025" }
        }
    },
    ClassroomUpdate: {
        type: "object",
        properties: {
            levelId: { type: "string", example: "67c2835bc3515d6f5763cff4" },
            name: { type: "string", example: "mầm 1" },
            teacherId: { type: "string", example: "" },
            schoolYear: { type: "string", example: "2024-2025" }
        }
    }
};

export { classroomSwagger, classroomSchemas };
