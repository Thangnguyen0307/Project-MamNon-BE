import { Blog } from "../models/blog.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { toBlogResponse } from "../mappers/blog.mapper.js";
import { linkVideosToBlog } from './video.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Removed ffmpeg utilities: video processing is centralized in video.service/worker

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


// ============= Blog Service =============
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

        // Extract and normalize videoIds (can be string, CSV string, or array)
        const hex24 = /^[0-9a-fA-F]{24}$/;
        let videoIds = [];
        if (blogData.videoIds) {
            if (Array.isArray(blogData.videoIds)) {
                videoIds = blogData.videoIds;
            } else if (typeof blogData.videoIds === 'string') {
                // Support CSV like "id1,id2" or with spaces
                videoIds = blogData.videoIds
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);
            } else {
                videoIds = [String(blogData.videoIds)];
            }
        }
        // Filter invalid ids and de-duplicate
        const beforeCount = videoIds.length;
        videoIds = Array.from(new Set(videoIds.filter(id => hex24.test(id))));
        if (beforeCount && videoIds.length === 0) {
            console.log('Link videoIds skipped: all provided IDs invalid format');
        } else if (videoIds.length < beforeCount) {
            console.log(`Link videoIds: filtered ${beforeCount - videoIds.length} invalid IDs`);
        }

        const { videoIds: _omitVideoIds, ...rest } = blogData; // avoid storing raw videoIds field

        const blog = new Blog({
            ...rest,
            author: authorId,
            images: imagePaths
        });
        
        await blog.save();

        // Link videos asynchronously (attach ready ones now, others later when processed)
        if (videoIds.length) {
            try {
                await linkVideosToBlog(videoIds, blog._id);
            } catch (e) {
                // Non-blocking: log and continue
                console.log('Link videoIds failed:', e.message);
            }
        }
        
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
            },
            { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
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
                },
                { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
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
                },
                { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
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
    ,
    async addVideo(blogId, videoData, userId){
        const blog = await Blog.findById(blogId);
        if(!blog) throw { status:404, message:'Không tìm thấy bài viết' };
        // permission: author or admin/teacher (reuse existing pattern)
        if (blog.author.toString() !== userId){
            const user = await User.findById(userId);
            if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')){
                throw { status:403, message:'Không có quyền thêm video' };
            }
        }
        // Cho phép truyền vào videoId hoặc object chứa _id
        const videoId = videoData?._id || videoData?.videoId || videoData;
        if (!videoId) throw { status:400, message:'Thiếu videoId để gắn vào bài viết' };
        blog.videos.addToSet(videoId);
        await blog.save();
        await blog.populate([
            { path:'author', select:'email fullName' },
            { path:'class', select:'name level', populate:{ path:'level', select:'name'} }
            ,{ path:'videos', select:'_id m3u8 thumbnail status createdAt' }
        ]);
        return toBlogResponse(blog);
    }
};