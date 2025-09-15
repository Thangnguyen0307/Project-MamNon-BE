export const validateBlogRequest = (schema) => {
    return (req, res, next) => {
        // Check if this is a multipart request
        const contentType = req.headers['content-type'];
        const isMultipart = contentType && contentType.includes('multipart/form-data');
        
        // For multipart requests, validation will happen after multer processes the form
        if (isMultipart) {
            return next();
        }
        
        // For JSON requests, validate normally
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