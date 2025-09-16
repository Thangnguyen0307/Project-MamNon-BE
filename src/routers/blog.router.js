import express from 'express';
import * as blogController from '../controllers/blog.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { validateBlogRequest } from '../middlewares/blog-validate.middleware.js';
import { uploadBlogImages, validateAfterUpload, handleMulterError } from '../middlewares/upload.middleware.js';
import { ROLE } from '../constants/role.constant.js';
import { 
    createBlogSchema, 
    updateBlogSchema, 
    getBlogsQuerySchema 
} from '../validations/blog.validation.js';

const blogRouter = express.Router();

blogRouter.get('/', validate(getBlogsQuerySchema, 'query'), blogController.getAllBlogs);
blogRouter.get('/:id', blogController.getBlogById);
blogRouter.post('/', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), validateBlogRequest(createBlogSchema), blogController.createBlog);
blogRouter.put('/:id', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), validateBlogRequest(updateBlogSchema), blogController.updateBlog);
blogRouter.delete('/:id', authenticate, authorize([ROLE.ADMIN, ROLE.TEACHER]), blogController.deleteBlog);

export default blogRouter;