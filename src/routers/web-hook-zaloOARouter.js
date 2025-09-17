import express from 'express';
import { WebhookController } from '../controllers/webhook-zaloOA.controller.js';
import path from 'path';
import { generatePKCECodes } from '../utils/crypto.util.js';
import { saveOAuthSession } from '../services/zaloOA.service.js';

const webhookZaloRouter = express.Router();

webhookZaloRouter.post('/webhook', WebhookController.handleEnvent);
webhookZaloRouter.get('/oauth/callback', WebhookController.handleCallback);

// webhookZaloRouter.get('/zalo_verifierNuAYTAlpU5Giyka8xkLO0oVNw5JBeJyFDJSs.html', (req, res) => {
//     res.sendFile(
//         path.join(process.cwd(), 'zalo_verifierNuAYTAlpU5Giyka8xkLO0oVNw5JBeJyFDJSs.html')
//     );
// });

// webhookZaloRouter.get('/zalo_verifierCk_bC-lmKouWty1uqlLjKb67vckzyJ4mDZar.html', (req, res) => {
//     res.sendFile(
//         path.join(process.cwd(), 'zalo_verifierCk_bC-lmKouWty1uqlLjKb67vckzyJ4mDZar.html')
//     );
// });

webhookZaloRouter.get("/pkce", async (req, res) => {
    const { code_verifier, code_challenge, state } = generatePKCECodes();
    await saveOAuthSession(state, code_verifier);
    res.json({ code_verifier, code_challenge, state });
})


export default webhookZaloRouter;