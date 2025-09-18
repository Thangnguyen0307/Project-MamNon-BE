import path from 'path';
import fs from 'fs';
import { Blog } from '../models/blog.model.js';
import { Class } from '../models/class.model.js';

export const uploadImage = async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'Không có file nào được upload.' });
    }
    
    const imageType = req.body.type || 'blog';
    
    // Validate type
    if (!['blog', 'avatar'].includes(imageType)) {
        return res.status(400).json({ success: false, message: 'Loại hình không hợp lệ. Chỉ chấp nhận: blog, avatar' });
    }
    
    try {
        let urls = [];
        
        if (imageType === 'avatar') {
            const userId = req.body.userId;
            urls = files.map(file => `/uploadeds/avatar/${userId}/${file.filename}`);
        } else if (imageType === 'blog') {
            const classId = req.body.classId;
            const classInfo = await Class.findById(classId);
            if (!classInfo) {
                return res.status(404).json({ success: false, message: 'Không tìm thấy lớp học' });
            }
            
            const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
            urls = files.map(file => `/uploadeds/${classInfo.schoolYear}/${classInfo.name}/${currentDate}/image/${file.filename}`);
        }
        
        return res.status(201).json({ success: true, message: 'Upload hình thành công', data: { urls, type: imageType } });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Lỗi khi xử lý upload: ' + error.message });
    }
};

// Helper function to recursively search for file in uploadeds directory
const findFileInUploadeds = (filename) => {
    const uploadedsPath = path.join(process.cwd(), 'uploadeds');
    
    const searchRecursively = (dir) => {
        if (!fs.existsSync(dir)) return null;
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                const result = searchRecursively(fullPath);
                if (result) return result;
            } else if (item === filename) {
                // Return relative path from uploadeds for URL construction
                const relativePath = path.relative(uploadedsPath, fullPath);
                return {
                    fullPath,
                    url: `/uploadeds/${relativePath.replace(/\\/g, '/')}`
                };
            }
        }
        return null;
    };
    
    return searchRecursively(uploadedsPath);
};

// Helper function to extract filename from input (can be filename or full URL)
const extractFilename = (input) => {
    // If input looks like a URL (starts with /), extract filename from it
    if (input.startsWith('/')) {
        return path.basename(input);
    }
    // Otherwise, assume it's already a filename
    return input;
};

// Helper function to get full path from input (filename or URL)
const getFullPathFromInput = (input) => {
    // If input is a full URL, convert it to filesystem path
    if (input.startsWith('/uploadeds/')) {
        // Remove leading slash and convert to filesystem path
        const relativePath = input.substring(1); // Remove leading '/'
        const fullPath = path.join(process.cwd(), relativePath);
        return {
            fullPath,
            url: input
        };
    }
    // If it's just a filename, search for it recursively
    else {
        return findFileInUploadeds(input);
    }
};

export const deleteImage = async (req, res) => {
    const { filenames } = req.body; // Nhận mảng tên file hoặc URL từ body
    
    if (!filenames || !Array.isArray(filenames) || filenames.length === 0) {
        return res.status(400).json({ success: false, message: 'Phải cung cấp mảng tên file hoặc URL để xóa.' });
    }
    
    const results = [];
    let errorCount = 0;
    const urlsToRemove = []; // Track URLs that need to be removed from blogs
    
    for (const input of filenames) {
        // Get file info whether input is filename or full URL
        const fileInfo = getFullPathFromInput(input);
        
        if (fileInfo && fs.existsSync(fileInfo.fullPath)) {
            try {
                fs.unlinkSync(fileInfo.fullPath);
                urlsToRemove.push(fileInfo.url);
                
                // Determine location type based on URL
                const locationType = fileInfo.url.includes('/avatar/') ? 'avatar' : 'blog';
                const filename = path.basename(fileInfo.fullPath);
                results.push({ 
                    input: input,
                    filename, 
                    status: 'success', 
                    location: locationType,
                    path: fileInfo.url
                });
            } catch (err) {
                results.push({ input: input, status: 'error', message: 'Lỗi khi xóa file: ' + err.message });
                errorCount++;
            }
        } else {
            results.push({ input: input, status: 'error', message: 'Không tìm thấy file' });
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
