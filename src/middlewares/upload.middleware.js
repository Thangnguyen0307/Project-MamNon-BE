import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { Class } from '../models/class.model.js';
import { User } from '../models/user.model.js';
import { slugifySegment } from '../utils/slug.util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== Image Upload ========== //

// Helper function to create directory structure
const createDirectoryPath = async (req, imageType) => {
    const baseUploadPath = path.join(__dirname, '../../uploadeds');
    
    if (imageType === 'avatar') {
        
        // Get userId from JWT token (req.payload.userId)
        const userId = req.payload?.userId || req.body.userId;
        if (!userId) {
            throw new Error('userId is required for avatar upload');
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        const avatarPath = path.join(baseUploadPath, 'avatar', userId);
        return avatarPath;
    } else {
        // For blog uploads (from blog API or image API with type=blog)
        const classId = req.body.classId || req.body.class;
        console.log('Debug blog upload - req.body:', req.body);
        console.log('Debug blog upload - classId:', classId);
        if (!classId) {
            throw new Error('classId or class is required for blog upload');
        }
        
        // Get class information
        const classInfo = await Class.findById(classId);
        if (!classInfo) {
            throw new Error('Class not found');
        }
        
        const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const blogPath = path.join(
            baseUploadPath,
            slugifySegment(classInfo.schoolYear),
            slugifySegment(classInfo.name),
            currentDate,
            'image'
        );
        return blogPath;
    }
};

// ========== AVATAR STORAGE - Riêng biệt ========== //
const avatarStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const userId = req.payload?.userId;
            if (!userId) {
                throw new Error('userId is required for avatar upload');
            }
            
            const baseUploadPath = path.join(__dirname, '../../uploadeds');
            const avatarPath = path.join(baseUploadPath, 'avatar', userId);
            
            // Xóa avatar cũ trước khi lưu avatar mới
            if (fs.existsSync(avatarPath)) {
                try {
                    const existingFiles = fs.readdirSync(avatarPath);
                    existingFiles.forEach(existingFile => {
                        const filePath = path.join(avatarPath, existingFile);
                        fs.unlinkSync(filePath);
                        console.log(`Đã xóa avatar cũ: ${existingFile}`);
                    });
                } catch (error) {
                    console.error('Lỗi khi xóa avatar cũ:', error);
                }
            }
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(avatarPath)) {
                fs.mkdirSync(avatarPath, { recursive: true });
            }
            
            cb(null, avatarPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ========== BLOG STORAGE - Riêng biệt ========== //
const blogStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const classId = req.body.classId || req.body.class;
            console.log('Blog storage - classId:', classId);
            if (!classId) {
                throw new Error('classId or class is required for blog upload');
            }
            
            // Get class information
            const classInfo = await Class.findById(classId);
            if (!classInfo) {
                throw new Error('Class not found');
            }
            
            const baseUploadPath = path.join(__dirname, '../../uploadeds');
            const currentDate = new Date().toISOString().split('T')[0];
            const blogPath = path.join(
                baseUploadPath,
                slugifySegment(classInfo.schoolYear),
                slugifySegment(classInfo.name),
                currentDate,
                'image'
            );
            
            console.log('Blog storage - blogPath:', blogPath);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(blogPath)) {
                fs.mkdirSync(blogPath, { recursive: true });
            }
            
            cb(null, blogPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// ========== OLD STORAGE - Comment out ========== //
/*
// Dynamic storage configuration
const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        try {
            const imageType = req.body.type || 'avatar';
            console.log('Storage debug - req.body.type:', req.body.type);
            console.log('Storage debug - imageType:', imageType);
            console.log('Storage debug - req.body:', req.body);
            const destinationPath = await createDirectoryPath(req, imageType);
            
            // Create directory if it doesn't exist
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            
            cb(null, destinationPath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const imageType = req.body.type || 'blog';
        const prefix = imageType === 'avatar' ? 'avatar-' : 'blog-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});
*/

// File filter chung
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
};

// Create separate multer instances
const uploadAvatar = multer({
    storage: avatarStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadBlog = multer({
    storage: blogStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ========== OLD UPLOAD - Comment out ========== //
/*
// Multer configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
*/

export const uploadBlogImages = (req, res, next) => {
    // Skip upload if content-type is not multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return next();
    }
    
    // Only support 'images' field for multiple files (max 10)
    const fields = [
        { name: 'images', maxCount: 10 }
    ];
    
    uploadBlog.fields(fields)(req, res, (error) => {
        if (error) {
            return handleMulterError(error, req, res, next);
        }
        
        // Normalize files to req.files array for consistent processing
        let files = [];
        if (req.files && req.files.images) {
            files = req.files.images;
        }
        
        // Set normalized files array
        req.files = files;
        
        next();
    });
};

// Middleware for avatar upload - sử dụng uploadAvatar riêng biệt
export const uploadAvatarImage = (req, res, next) => {
    // Skip upload if content-type is not multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return next();
    }
    
    // Only support 'images' field for single file
    const fields = [
        { name: 'images', maxCount: 1 }  // Avatar chỉ 1 file
    ];
    
    uploadAvatar.fields(fields)(req, res, (error) => {
        if (error) {
            return handleMulterError(error, req, res, next);
        }
        
        // Normalize files to req.files array for consistent processing
        let files = [];
        if (req.files && req.files.images) {
            files = req.files.images;
        }
        
        // Set normalized files array
        req.files = files;
        
        next();
    });
};

// Middleware to validate form data after multer processing
export const validateAfterUpload = (schema) => {
    return (req, res, next) => {
        const contentType = req.headers['content-type'];
        const isMultipart = contentType && contentType.includes('multipart/form-data');
        
        // Only validate multipart requests here (JSON already validated)
        if (!isMultipart) {
            return next();
        }
        
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const details = error.details.map((err) => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: details
            });
        }

        req.body = value;
        next();
    };
};

// Keep single image upload for backward compatibility
export const uploadBlogImage = (req, res, next) => {
    // Skip upload if content-type is not multipart/form-data
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return next();
    }
    
    upload.single('image')(req, res, (error) => {
        if (error) {
            return handleMulterError(error, req, res, next);
        }
        next();
    });
};

export const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File quá lớn! Kích thước tối đa là 5MB'
            });
        }
    }
    
    if (error.message === 'Chỉ chấp nhận file ảnh!') {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    next(error);
};
