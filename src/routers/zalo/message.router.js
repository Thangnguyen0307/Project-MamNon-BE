import express from 'express';
import { messageController } from '../../controllers/zalo/message.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../constants/role.constant.js';
import { uploadZaloImage } from '../../middlewares/upload-zalo.middleware.js';
const messageRouter = express.Router();

messageRouter.get('/:conversationId', authenticate, authorize([ROLE.ADMIN, ROLE.STAFF]), messageController.getMessages);

messageRouter.post("/send-image", authenticate, authorize([ROLE.ADMIN, ROLE.STAFF]), uploadZaloImage, messageController.sendImage);

export default messageRouter;