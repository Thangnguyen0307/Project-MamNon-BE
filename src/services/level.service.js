import { Level } from "../models/level.model.js";
import { Class } from "../models/class.model.js";
import { toLevelResponse } from "../mappers/level.mapper.js";

export const levelService = {
    
    async create(levelData) {
        // Check if level name already exists (case insensitive)
        const existingLevel = await Level.findOne({ 
            name: { $regex: new RegExp(`^${levelData.name}$`, 'i') } 
        });
        
        if (existingLevel) {
            throw { status: 400, message: "Cấp độ đã tồn tại" };
        }

        const level = new Level(levelData);
        await level.save();
        
        return toLevelResponse(level);
    },

    async getAll(query = {}) {
        const { page = 1, limit = 10, search } = query;
        const filter = {};
        
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const levels = await Level.find(filter)
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Level.countDocuments(filter);

        return {
            levels: levels.map(toLevelResponse),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async getById(id) {
        const level = await Level.findById(id);
        if (!level) {
            throw { status: 404, message: "Không tìm thấy cấp độ" };
        }
        
        return toLevelResponse(level);
    },

    async update(id, updateData) {
        const level = await Level.findById(id);
        if (!level) {
            throw { status: 404, message: "Không tìm thấy cấp độ" };
        }

        // Check duplicate name if name is being updated
        if (updateData.name && updateData.name !== level.name) {
            const existingLevel = await Level.findOne({ name: updateData.name });
            if (existingLevel) {
                throw { status: 400, message: "Tên cấp độ đã tồn tại" };
            }
        }

        Object.assign(level, updateData);
        await level.save();
        
        return toLevelResponse(level);
    },

    async delete(id) {
        const level = await Level.findById(id);
        if (!level) {
            throw { status: 404, message: "Không tìm thấy cấp độ" };
        }

        // Check if level is being used by classes
        const classCount = await Class.countDocuments({ level: id });
        if (classCount > 0) {
            throw { status: 400, message: "Không thể xóa cấp độ đang được sử dụng bởi các lớp học" };
        }

        await Level.findByIdAndDelete(id);
        return { message: "Xóa cấp độ thành công" };
    }
};