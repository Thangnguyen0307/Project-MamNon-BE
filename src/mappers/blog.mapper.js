export const toBlogResponse = (blog) => {
    return {
        _id: blog._id,
        title: blog.title,
        content: blog.content,
        images: blog.images || [],
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