import { Blog } from "../models/blog.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { toBlogResponse } from "../mappers/blog.mapper.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const blogService = {
    
    async create(blogData, imageFiles, authorId) {
        // Validate class exists
        const classInstance = await Class.findById(blogData.class);
        if (!classInstance) {
            throw { status: 404, message: "Không tìm thấy lớp học" };
        }

        // Validate author exists
        const author = await User.findById(authorId);
        if (!author) {
            throw { status: 404, message: "Không tìm thấy tác giả" };
        }

        // Process image paths
        const imagePaths = imageFiles ? imageFiles.map(file => `/images/blogs/${file.filename}`) : [];

        const blog = new Blog({
            ...blogData,
            author: authorId,
            images: imagePaths
        });
        
        await blog.save();
        
        // Populate for response
        await blog.populate([
            {
                path: 'author',
                select: 'email fullName'
            },
            {
                path: 'class',
                select: 'name level',
                populate: {
                    path: 'level',
                    select: 'name'
                }
            }
        ]);
        
        return toBlogResponse(blog);
    },

    async getAll(query = {}) {
        const { page = 1, limit = 10, search, class: classId, author } = query;
        const filter = {};
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (classId) {
            filter.class = classId;
        }
        
        if (author) {
            filter.author = author;
        }

        const blogs = await Blog.find(filter)
            .populate([
                {
                    path: 'author',
                    select: 'email fullName'
                },
                {
                    path: 'class',
                    select: 'name level',
                    populate: {
                        path: 'level',
                        select: 'name'
                    }
                }
            ])
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(filter);

        return {
            blogs: blogs.map(toBlogResponse),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async getById(id) {
        const blog = await Blog.findById(id)
            .populate([
                {
                    path: 'author',
                    select: 'email fullName'
                },
                {
                    path: 'class',
                    select: 'name level',
                    populate: {
                        path: 'level',
                        select: 'name'
                    }
                }
            ]);
            
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }
        
        return toBlogResponse(blog);
    },

    async update(id, updateData, newImageFiles, userId) {
        const blog = await Blog.findById(id);
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }

        // Check if user is the author or admin
        if (blog.author.toString() !== userId) {
            const user = await User.findById(userId);
            if (user.role !== 'ADMIN') {
                throw { status: 403, message: "Không có quyền chỉnh sửa bài viết này" };
            }
        }

        // Validate class exists (if provided)
        if (updateData.class) {
            const classInstance = await Class.findById(updateData.class);
            if (!classInstance) {
                throw { status: 404, message: "Không tìm thấy lớp học" };
            }
        }

        // Delete old images if new images are uploaded
        if (newImageFiles && newImageFiles.length > 0 && blog.images && blog.images.length > 0) {
            blog.images.forEach(imagePath => {
                const oldImagePath = path.join(__dirname, '../../images/blogs', path.basename(imagePath));
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (error) {
                    console.log('Error deleting old image:', error);
                }
            });
        }

        // Process new image paths
        const newImagePaths = newImageFiles ? newImageFiles.map(file => `/images/blogs/${file.filename}`) : undefined;

        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            {
                ...updateData,
                ...(newImagePaths && { images: newImagePaths })
            },
            { new: true }
        ).populate([
            {
                path: 'author',
                select: 'email fullName'
            },
            {
                path: 'class',
                select: 'name level',
                populate: {
                    path: 'level',
                    select: 'name'
                }
            }
        ]);

        return toBlogResponse(updatedBlog);
    },

    async delete(id, userId) {
        const blog = await Blog.findById(id);
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }

        // Check if user is the author or admin
        if (blog.author.toString() !== userId) {
            const user = await User.findById(userId);
            if (user.role !== 'ADMIN') {
                throw { status: 403, message: "Không có quyền xóa bài viết này" };
            }
        }

        // Delete image files
        if (blog.images && blog.images.length > 0) {
            blog.images.forEach(imagePath => {
                const fullImagePath = path.join(__dirname, '../../images/blogs', path.basename(imagePath));
                try {
                    if (fs.existsSync(fullImagePath)) {
                        fs.unlinkSync(fullImagePath);
                    }
                } catch (error) {
                    console.log('Error deleting image:', error);
                }
            });
        }

        await Blog.findByIdAndDelete(id);
        
        return { message: "Xóa bài viết thành công" };
    }
};