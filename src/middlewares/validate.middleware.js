export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const details = error.details.map((err) => ({
                field: err.path.join('.'),
                message: err.message
            }));

            return res.status(400).json({
                message: 'Dữ liệu không hợp lệ',
                errors: details
            });
        }

        req.body = value;
        next();
    };
};
