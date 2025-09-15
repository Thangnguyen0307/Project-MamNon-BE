import express from 'express';
import { WebhookController } from '../controllers/webhook-zaloOA.controller.js';
const webhookZaloRouter = express.Router();

webhookZaloRouter.get('/webhook', WebhookController.handle);


export default webhookZaloRouter;