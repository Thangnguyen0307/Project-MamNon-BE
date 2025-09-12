const levelSwagger = {
    "/api/levels": {
        post: {
            tags: ["Levels"],
            summary: "Tạo cấp lớp mới",
            security: [{ bearerAuth: [] }],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/LevelCreate" }
                    }
                }
            },
            responses: {
                201: { description: "Tạo cấp lớp thành công" },
                400: { description: "Dữ liệu không hợp lệ" }
            }
        },
        get: {
            tags: ["Levels"],
            summary: "Lấy danh sách cấp lớp",
            responses: {
                200: {
                    description: "Danh sách cấp lớp",
                    content: {
                        "application/json": {
                            schema: { type: "array", items: { $ref: "#/components/schemas/Level" } }
                        }
                    }
                }
            }
        }
    },
    "/api/levels/{id}": {
        get: {
            tags: ["Levels"],
            summary: "Lấy chi tiết cấp lớp",
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            responses: {
                200: { description: "Chi tiết cấp lớp", content: { "application/json": { schema: { $ref: "#/components/schemas/Level" } } } },
                404: { description: "Không tìm thấy" }
            }
        },
        put: {
            tags: ["Levels"],
            summary: "Cập nhật cấp lớp",
            security: [{ bearerAuth: [] }],
            parameters: [
                { name: "id", in: "path", required: true, schema: { type: "string" } }
            ],
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: { $ref: "#/components/schemas/LevelUpdate" }
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
            tags: ["Levels"],
            summary: "Xoá cấp lớp",
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

const levelSchemas = {
    Level: {
        type: "object",
        properties: {
            _id: { type: "string" },
            id: { type: "string" },
            name: { type: "string" },
            createdAt: { type: "string" },
            updatedAt: { type: "string" }
        }
    },
    LevelCreate: {
        type: "object",
        required: ["name"],
        properties: {
            name: { type: "string", example: "mầm" }
        }
    },
    LevelUpdate: {
        type: "object",
        properties: {
            name: { type: "string", example: "mầm" }
        }
    }
};

export { levelSwagger, levelSchemas };