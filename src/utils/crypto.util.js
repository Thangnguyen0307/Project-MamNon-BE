    import crypto from 'crypto';

    export function sha256(str) {
        return crypto.createHash('sha256').update(str).digest('hex');
    }