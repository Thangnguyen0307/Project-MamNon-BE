import { messageService } from "../../services/zalo/message.service.js";
import path from "path";

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

    async sendImage(req, res) {
        try {
            const staffId = req.payload.userId;
            const { conversationId, description } = req.body;

            const relativeDir = path.relative(process.cwd(), req.file.destination);
            const imageUrl = path.join(relativeDir, req.file.filename).replace(/\\/g, "/");

            const response = await messageService.sendImageToZalo(conversationId, staffId, description, imageUrl);
            res.status(200).json({ message: response });
        } catch (error) {
            console.log("Send message error:", error);
            res.status(500).json({ message: error.message });
        }
    }
};
