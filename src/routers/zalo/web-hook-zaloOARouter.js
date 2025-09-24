import express from 'express';
import { WebhookController } from '../../controllers/zalo/webhook-zaloOA.controller.js';
import { generatePKCECodes } from '../../utils/crypto.util.js';
import { saveOAuthSession } from '../../services/zalo/zaloOA.service.js';

const webhookZaloRouter = express.Router();

webhookZaloRouter.post('/webhook', WebhookController.handleEnvent);
webhookZaloRouter.get('/oauth/callback', WebhookController.handleCallback);
webhookZaloRouter.get("/pkce", async (req, res) => {
    const { code_verifier, code_challenge, state } = generatePKCECodes();
    await saveOAuthSession(state, code_verifier);
    res.json({ code_verifier, code_challenge, state });
})


export default webhookZaloRouter;