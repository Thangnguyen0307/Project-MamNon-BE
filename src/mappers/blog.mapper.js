export const toBlogResponse = (blog) => {
    return {
        _id: blog._id,
        title: blog.title,
        content: blog.content,
        images: blog.images || [],
        videos: Array.isArray(blog.videos) ? blog.videos.map(v => (
            v && typeof v === 'object' && v._id ? {
                _id: v._id,
                m3u8: v.m3u8,
                thumbnail: v.thumbnail,
                status: v.status,
                createdAt: v.createdAt
            } : v
        )) : [],
        author: blog.author ? {
            _id: blog.author._id,
            email: blog.author.email,
            fullName: blog.author.fullName
        } : blog.author,
        class: blog.class ? {
            _id: blog.class._id,
            name: blog.class.name,
            level: blog.class.level ? {
                _id: blog.class.level._id,
                name: blog.class.level.name
            } : blog.class.level
        } : blog.class,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
    };
};