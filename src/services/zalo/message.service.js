import { Message } from '../../models/message.model.js';

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
        return newMessage;
    },

    // Lấy tất cả tin nhắn của một cuộc trò chuyện
    async getMessagesByConversation(conversationId) {
        // Truy vấn tất cả tin nhắn theo conversation_id và sắp xếp theo thời gian
        return await Message.find({ conversation_id: conversationId }).sort({ createdAt: 1 });
    },
};
