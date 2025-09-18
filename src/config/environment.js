import 'dotenv/config';

export const env = {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    OTP_EXPIRE_MINUTES: process.env.OTP_EXPIRE_MINUTES,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN,
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASS: process.env.MAIL_PASS,
    CORS_ORIGIN: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ['*'],
    // Queue configs
    QUEUE_BACKEND: process.env.QUEUE_BACKEND,
    RABBITMQ_URL: process.env.RABBITMQ_URL,
    START_QUEUE_CONSUMER: process.env.START_QUEUE_CONSUMER
}