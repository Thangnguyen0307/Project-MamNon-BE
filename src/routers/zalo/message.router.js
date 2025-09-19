import express from 'express';
import { messageController } from '../../controllers/zalo/message.controller.js';
import  { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../constants/role.constant.js';
const messageRouter = express.Router();

messageRouter.get('/:conversationId', authenticate, authorize([ROLE.ADMIN, ROLE.STAFF]), messageController.getMessages);

export default messageRouter;