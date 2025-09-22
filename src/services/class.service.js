import { Class } from "../models/class.model.js";
import { Level } from "../models/level.model.js";
import { User } from "../models/user.model.js";
import { toClassResponse } from "../mappers/class.mapper.js";
import mongoose from "mongoose";

export const classService = {

    async create(classData) {
        // Validate class name uniqueness within the same school year (case insensitive)
        const existingClass = await Class.findOne({
            name: { $regex: new RegExp(`^${classData.name}$`, 'i') },
            schoolYear: classData.schoolYear
        });
        if (existingClass) {
            throw { status: 400, message: `Lớp "${classData.name}" đã tồn tại trong năm học ${classData.schoolYear}` };
        }

        // Validate level exists
        const level = await Level.findById(classData.level);
        if (!level) {
            throw { status: 404, message: "Không tìm thấy cấp độ" };
        }

        // Validate teachers exist (if provided)
        if (classData.teachers && classData.teachers.length > 0) {
            const teachers = await User.find({
                _id: { $in: classData.teachers },
                role: 'TEACHER'
            });
            if (teachers.length !== classData.teachers.length) {
                throw { status: 400, message: "Một hoặc nhiều giáo viên không hợp lệ" };
            }
        }

        const classInstance = new Class(classData);
        await classInstance.save();

        // Populate related data
        await classInstance.populate('level teachers');

        return toClassResponse(classInstance);
    },

    async getAll(query = {}) {
        const { page = 1, limit = 10, search, level, schoolYear, teacher } = query;
        const filter = {};

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (level) {
            filter.level = level;
        }

        if (schoolYear) {
            filter.schoolYear = schoolYear;
        }

        if (teacher) {
            filter.teachers = teacher;
        }

        const classes = await Class.find(filter)
            .populate('level teachers')
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Class.countDocuments(filter);

        return {
            classes: classes.map(toClassResponse),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async getById(id) {
        const classInstance = await Class.findById(id)
            .populate('level teachers');

        if (!classInstance) {
            throw { status: 404, message: "Không tìm thấy lớp học" };
        }

        return toClassResponse(classInstance);
    },

    async update(id, updateData) {
        const classInstance = await Class.findById(id);
        if (!classInstance) {
            throw { status: 404, message: "Không tìm thấy lớp học" };
        }

        // Check duplicate name if name is being updated (case insensitive)
        if (updateData.name && updateData.schoolYear) {
            const existingClass = await Class.findOne({
                name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
                schoolYear: updateData.schoolYear,
                _id: { $ne: id }
            });
            if (existingClass) {
                throw { status: 400, message: `Lớp "${updateData.name}" đã tồn tại trong năm học ${updateData.schoolYear}` };
            }
        }

        // Validate level exists (if provided)
        if (updateData.level) {
            const level = await Level.findById(updateData.level);
            if (!level) {
                throw { status: 404, message: "Không tìm thấy cấp độ" };
            }
        }

        // Validate teachers exist (if provided)
        if (updateData.teachers && updateData.teachers.length > 0) {
            const teachers = await User.find({
                _id: { $in: updateData.teachers },
                role: 'TEACHER'
            });
            if (teachers.length !== updateData.teachers.length) {
                throw { status: 400, message: "Một hoặc nhiều giáo viên không hợp lệ" };
            }
        }

        Object.assign(classInstance, updateData);
        await classInstance.save();
        await classInstance.populate('level teachers');

        return toClassResponse(classInstance);
    },

    async delete(id) {
        const classInstance = await Class.findById(id);
        if (!classInstance) {
            throw { status: 404, message: "Không tìm thấy lớp học" };
        }

        // Additional business logic: Check if class has students
        // (This would depend on your Student model structure)
        // const studentCount = await Student.countDocuments({ class: id });
        // if (studentCount > 0) {
        //     throw { status: 400, message: "Không thể xóa lớp đang có học sinh" };
        // }

        await Class.findByIdAndDelete(id);
        return { message: "Xóa lớp học thành công" };
    },

    async getBySchoolYear(schoolYear) {
        const classes = await Class.find({ schoolYear })
            .populate('level teachers')
            .sort({ name: 1 });

        return classes.map(toClassResponse);
    },

    async getByLevel(levelId) {
        const classes = await Class.find({ level: levelId })
            .populate('level teachers')
            .sort({ schoolYear: -1, name: 1 });

        return classes.map(toClassResponse);
    },

    async getByUserId(id, query = {}) {
        
        const page = parseInt(query.page ?? 1, 10) || 1;
        const limit = parseInt(query.limit ?? 10, 10) || 10;

        const filter = { teachers: new mongoose.Types.ObjectId(String(id)) };

        const [classes, total] = await Promise.all([
            Class.find(filter)
                .populate('level teachers')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Class.countDocuments(filter)
        ]);
        return {
            classes: classes.map(toClassResponse),
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
};