import express from 'express';
import { conversationController } from '../../controllers/zalo/conversation.controller.js';
import  { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { ROLE } from '../../constants/role.constant.js';

const conversationRouter = express.Router();

conversationRouter.get('/', authenticate, authorize([ROLE.ADMIN, ROLE.STAFF]), conversationController.getAllConversations);


export default conversationRouter;
