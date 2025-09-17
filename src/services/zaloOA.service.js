import { ZaloOASession } from "../models/zaloOASession.model.js";

export async function saveOAuthSession(state, codeVerifier) {
    return await ZaloOASession.create({ state, codeVerifier });
}

export async function getVerifierByState(state) {
    const session = await ZaloOASession.findOne({ state });
    return session?.codeVerifier;
}