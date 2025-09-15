import j2s from 'joi-to-swagger';
import { 
    createBlogSchema, 
    updateBlogSchema, 
    getBlogsQuerySchema 
} from '../validations/blog.validation.js';

const BlogSchema = {
    CreateBlogRequest: j2s(createBlogSchema).swagger,
    UpdateBlogRequest: j2s(updateBlogSchema).swagger,
    GetBlogsQuery: j2s(getBlogsQuerySchema).swagger
};

export default BlogSchema;