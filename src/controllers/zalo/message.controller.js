import { messageService } from "../../services/zalo/message.service.js";

export const messageController = {
    async getMessages(req, res) {
        try {
            const conversationId = req.params.conversationId;
            const page = req.query.page || 1;
            const limit = req.query.limit || 20;

            const result = await messageService.getMessagesByConversation(conversationId, {
                page,
                limit,
            });

            res.status(200).json(result);
        } catch (error) {
            console.error("Get messages error:", error);
            res.status(500).json({ error: error.message });
        }
    },
};
