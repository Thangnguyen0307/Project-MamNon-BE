import { Message } from '../../models/message.model.js';
import { Conversation } from '../../models/conversation.model.js';
// Lưu tin nhắn chung
export const messageService = {
    // Lưu tin nhắn
    async saveMessage(conversationId, senderType, senderId, messageText) {
        const newMessage = await Message.create({
            conversation_id: conversationId,
            sender_id: senderId,  // ID của người gửi (admin/agent hoặc user)
            message: messageText,
            sender: senderType,  // 'staff' (admin/agent) hoặc 'user'
        });

        await Conversation.findOneAndUpdate(
            { conversation_id: conversationId },
            {
                last_message: {
                    sender_id: senderId,
                    message: messageText,
                    createdAt: newMessage.createdAt,
                },
            },
            { new: true }
        );

        return newMessage;
    },

    // Lấy tất cả tin nhắn của một cuộc trò chuyện
    async getMessagesByConversation(conversationId, { page = 1, limit = 20 }) {
        page = parseInt(page);
        limit = parseInt(limit);

        const skip = (page - 1) * limit;

        const [messages, total] = await Promise.all([
            Message.find({ conversation_id: conversationId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Message.countDocuments({ conversation_id: conversationId }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            messages,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
        };
    },
};
