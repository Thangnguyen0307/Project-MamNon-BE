import { Blog } from "../models/blog.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { toBlogResponse } from "../mappers/blog.mapper.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to find and delete image files in uploadeds directory
const findAndDeleteImage = (imagePath) => {
    const filename = path.basename(imagePath);
    const uploadedsPath = path.join(__dirname, '../../uploadeds');
    
    const searchRecursively = (dir) => {
        if (!fs.existsSync(dir)) return false;
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (searchRecursively(fullPath)) return true;
            } else if (item === filename) {
                try {
                    fs.unlinkSync(fullPath);
                    console.log(`Deleted image: ${filename} from ${fullPath}`);
                    return true;
                } catch (error) {
                    console.log('Error deleting image:', filename, error);
                    return false;
                }
            }
        }
        return false;
    };
    
    return searchRecursively(uploadedsPath);
};

export const blogService = {
    
    async create(blogData, authorId) {
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

        // Only accept image URLs from blogData.images
        const imagePaths = Array.isArray(blogData.images) ? blogData.images : [];

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
        async create(blogData, authorId) {
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

            // Only accept image URLs from blogData.images
            const imagePaths = Array.isArray(blogData.images) ? blogData.images : [];

            const blog = new Blog({
                ...blogData,
                author: authorId,
                images: imagePaths
            });
            await blog.save();
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

    async update(id, updateData, userId) {
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

        // Handle image deletion when updating
        const oldImages = blog.images || [];
        const newImages = Array.isArray(updateData.images) ? updateData.images : oldImages;
        
        // Find images to delete (old images not in new images list)
        const imagesToDelete = oldImages.filter(oldImage => !newImages.includes(oldImage));
        
        // Delete removed images from filesystem
        imagesToDelete.forEach(imagePath => {
            findAndDeleteImage(imagePath);
        });

        // Update blog with new image URLs
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            {
                ...updateData,
                images: newImages
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

        // Delete all image files associated with this blog
        if (blog.images && blog.images.length > 0) {
            blog.images.forEach(imagePath => {
                findAndDeleteImage(imagePath);
            });
        }

        await Blog.findByIdAndDelete(id);
        
        return { message: "Xóa bài viết thành công" };
    }
};