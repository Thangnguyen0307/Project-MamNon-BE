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
    ZALO_APP_ID: process.env.ZALO_APP_ID,
    ZALO_SECRET_KEY: process.env.ZALO_SECRET_KEY,
    ZALO_CALLBACK_URL: process.env.ZALO_CALLBACK_URL,
}