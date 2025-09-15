import { blogService } from '../services/blog.service.js';

export const createBlog = async (req, res) => {
    try {
        const blog = await blogService.create(req.body, req.files, req.payload.userId);
        
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
        const blog = await blogService.update(req.params.id, req.body, req.files, req.payload.userId);
        
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
        const result = await blogService.delete(req.params.id, req.payload.userId);
        
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