import { conversationService } from "../../services/zalo/conversation.service.js";

export const conversationController = {
    async getAllConversations(req, res) {
        try {
            // query params: page, limit
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const { conversations, pages, total } = await conversationService.getAllConversations({
                skip,
                limit,
            });

            res.status(200).json({
                conversations,
                pagination: {
                    pages,
                    total,
                    page,
                    limit,
                }
            });
        } catch (error) {
            console.error("Get conversations error:", error);
            res.status(500).json({ error: error.message });
        }
    },
};
