import path from 'path';
import fs from 'fs';
import { Blog } from '../models/blog.model.js';

export const uploadImage = (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có file nào được upload.' });
    }
    
    const imageType = req.body.type || 'blog';
    
    // Validate type
    if (!['blog', 'avatar'].includes(imageType)) {
        return res.status(400).json({ success: false, message: 'Loại hình không hợp lệ. Chỉ chấp nhận: blog, avatar' });
    }
    
    const folderPath = imageType === 'avatar' ? 'avatars' : 'blogs';
    const urls = files.map(file => `/images/${folderPath}/${file.filename}`);
    
    return res.status(201).json({ success: true, message: 'Upload hình thành công', data: { urls, type: imageType } });
};

export const deleteImage = async (req, res) => {
    const { filenames } = req.body; // Nhận mảng tên file từ body
    
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json({ success: false, message: 'Phải cung cấp mảng tên file để xóa.' });
    }
    
    const results = [];
    let errorCount = 0;
    const urlsToRemove = []; // Track URLs that need to be removed from blogs
    
    for (const filename of filenames) {
        // Tự động tìm file trong cả 2 thư mục blogs và avatars
        const blogPath = path.join(process.cwd(), 'images', 'blogs', filename);
        const avatarPath = path.join(process.cwd(), 'images', 'avatars', filename);
        
        let deleted = false;
        let imageUrl = '';
        
        // Thử xóa từ thư mục blogs trước
        if (fs.existsSync(blogPath)) {
            try {
                fs.unlinkSync(blogPath);
                imageUrl = `/images/blogs/${filename}`;
                urlsToRemove.push(imageUrl);
                results.push({ filename, status: 'success', location: 'blogs' });
                deleted = true;
            } catch (err) {
                results.push({ filename, status: 'error', message: 'Lỗi khi xóa file từ blogs' });
                errorCount++;
            }
        }
        // Nếu không có trong blogs, thử avatars
        else if (fs.existsSync(avatarPath)) {
            try {
                fs.unlinkSync(avatarPath);
                imageUrl = `/images/avatars/${filename}`;
                urlsToRemove.push(imageUrl);
                results.push({ filename, status: 'success', location: 'avatars' });
                deleted = true;
            } catch (err) {
                results.push({ filename, status: 'error', message: 'Lỗi khi xóa file từ avatars' });
                errorCount++;
            }
        }
        
        if (!deleted) {
            results.push({ filename, status: 'error', message: 'Không tìm thấy file' });
            errorCount++;
        }
    }
    
    // Remove image URLs from all blogs that reference them
    if (urlsToRemove.length > 0) {
        try {
            const updateResult = await Blog.updateMany(
                { images: { $in: urlsToRemove } },
                { $pull: { images: { $in: urlsToRemove } } }
            );
            console.log(`Removed ${urlsToRemove.length} image URLs from ${updateResult.modifiedCount} blogs`);
        } catch (err) {
            console.log('Error removing image URLs from blogs:', err);
        }
    }
    
    const statusCode = errorCount === 0 ? 200 : (errorCount === filenames.length ? 404 : 207);
    const message = errorCount === 0 ? 'Xóa tất cả file thành công' : 
                   errorCount === filenames.length ? 'Không thể xóa file nào' : 
                   'Một số file được xóa thành công';
    
    return res.status(statusCode).json({ 
        success: errorCount === 0, 
        message, 
        data: { 
            total: filenames.length,
            success: filenames.length - errorCount,
            failed: errorCount,
            results 
        }
    });
};
