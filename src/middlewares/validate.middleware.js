export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const dataToValidate = req[source];
        const { error, value } = schema.validate(dataToValidate, { abortEarly: false });

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

        // Chỉ gán lại nếu không phải query params
        if (source !== 'query') {
            req[source] = value;
        }
        next();
    };
};

export default validate;
