import crypto from 'crypto';

export function sha256(str) {
    return crypto.createHash('sha256').update(str).digest('hex');
}

export function generatePKCECodes() {

    // code_verifier: random chuỗi base64url
    const code_verifier = crypto.randomBytes(32).toString("base64url");

    // hash SHA256 -> base64url => code_challenge
    const hash = crypto.createHash("sha256").update(code_verifier).digest();
    const code_challenge = hash.toString("base64url");

    // state: random hex string
    const state = crypto.randomBytes(8).toString("hex");

    return { code_verifier, code_challenge, state };
}