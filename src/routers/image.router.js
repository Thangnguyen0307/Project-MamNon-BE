import express from 'express';
import { uploadImage, deleteImage } from '../controllers/image.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { uploadBlogImages, handleMulterError } from '../middlewares/upload.middleware.js';
import { uploadImagesSchema } from '../validations/image.validation.js';
import { validateAfterUpload } from '../middlewares/upload.middleware.js';
import { ROLE } from '../constants/role.constant.js';

const imageRouter = express.Router();

// Upload multiple images
imageRouter.post('/upload', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), uploadBlogImages, handleMulterError, uploadImage);

// Delete multiple images by filenames (auto-detect from both folders)
imageRouter.delete('/delete', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), deleteImage);

export default imageRouter;
