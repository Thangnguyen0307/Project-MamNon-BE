import { blogService } from '../services/blog.service.js';
import { Class } from '../models/class.model.js';
import { slugifySegment } from '../utils/slug.util.js';

export const createBlog = async (req, res) => {
    try {
        // Handle image files if uploaded
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            // Get class info to build URL path
            const classInfo = await Class.findById(req.body.class);
            if (!classInfo) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
            }
            
            const currentDate = new Date().toISOString().split('T')[0];
            const sy = slugifySegment(classInfo.schoolYear);
            const cn = slugifySegment(classInfo.name);
            imageUrls = req.files.map(file => `/uploadeds/${sy}/${cn}/${currentDate}/image/${file.filename}`);
        }
        
        // Add image URLs to blog data
        const blogData = {
            ...req.body,
            images: imageUrls
        };
        
        const blog = await blogService.create(blogData, req.payload.userId, req.payload.role);
        
        res.status(201).json({
            success: true,
            message: "Tạo bài viết thành công",
            data: blog
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            message: error.message || "Lỗi server" 
        });
    }
};

export const getAllBlogs = async (req, res) => {
        // Removed duplicate export
    try {
        const result = await blogService.getAll(req.query);
        
        res.status(200).json({
            success: true,
            message: "Lấy danh sách bài viết thành công",
            data: result
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            message: error.message || "Lỗi server" 
        });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await blogService.getById(req.params.id);
        
        res.status(200).json({
            success: true,
            message: "Lấy thông tin bài viết thành công",
            data: blog
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            message: error.message || "Lỗi server" 
        });
    }
};

export const updateBlog = async (req, res) => {
    try {
        // Handle new image files if uploaded
        let newImageUrls = [];
        if (req.files && req.files.length > 0) {
            // Get class info to build URL path
            const classInfo = await Class.findById(req.body.class);
            if (!classInfo) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
            }
            
            const currentDate = new Date().toISOString().split('T')[0];
            const sy = slugifySegment(classInfo.schoolYear);
            const cn = slugifySegment(classInfo.name);
            newImageUrls = req.files.map(file => `/uploadeds/${sy}/${cn}/${currentDate}/image/${file.filename}`);
        }
        
        // Combine existing images with new uploads
        let existingImages = [];
        if (req.body.existingImages) {
            // Handle both string and array cases
            existingImages = Array.isArray(req.body.existingImages) 
                ? req.body.existingImages 
                : [req.body.existingImages];
        }
        const allImages = [...existingImages, ...newImageUrls];
        
        // Add all images to blog data
        const blogData = {
            ...req.body,
            images: allImages
        };
        
        const blog = await blogService.update(req.params.id, blogData, req.payload.userId, req.payload.role);
        res.status(200).json({
            success: true,
            message: "Cập nhật bài viết thành công",
            data: blog
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            message: error.message || "Lỗi server" 
        });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const result = await blogService.delete(req.params.id, req.payload.userId, req.payload.role);
        
        res.status(200).json({
            success: true,
            message: result.message,
            data: null
        });
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false,
            message: error.message || "Lỗi server" 
        });
    }
};