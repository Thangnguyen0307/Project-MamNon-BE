import express from 'express';
import { WebhookController } from '../controllers/webhook-zaloOA.controller.js';
import path from 'path';
const webhookZaloRouter = express.Router();

webhookZaloRouter.get('/webhook', WebhookController.handle);

webhookZaloRouter.get('/zalo_verifierNuAYTAlpU5Giyka8xkLO0oVNw5JBeJyFDJSs.html', (req, res) => {
    res.sendFile(
        path.join(process.cwd(), 'zalo_verifierNuAYTAlpU5Giyka8xkLO0oVNw5JBeJyFDJSs.html')
    );
});


export default webhookZaloRouter;