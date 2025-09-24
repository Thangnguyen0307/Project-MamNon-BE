import { Message } from '../../models/message.model.js';
import { Conversation } from '../../models/conversation.model.js';
import { getValidAccessToken } from './zaloToken.service.js';
import { env } from '../../config/environment.js';
import axios from 'axios';
import { conversationService } from "../../services/zalo/conversation.service.js";
import { SENDER } from '../../constants/sender.constant.js';
import { MESSAGE_TYPE } from '../../constants/message-type.constant.js';
import fs from "fs";
import path from "path";
import { emitNewMessage } from '../../sockets/events/message.event.js';

// Lưu tin nhắn chung
export const messageService = {
    // Lưu tin nhắn
    async saveMessage(conversationId, senderType, senderId, messageText, type, metadata = {}) {
        const newMessage = await Message.create({
            conversation_id: conversationId,
            sender_id: senderId,  // ID của người gửi (admin/agent hoặc user)
            message: messageText,
            sender: senderType,  // 'staff' (admin/agent) hoặc 'user'
            type,
            metadata,
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

    async sendMessageToZalo(conversationId, messageText) {
        console.log("Sending message to Zalo:", { conversationId, messageText });
        const accessToken = await getValidAccessToken(env.ZALO_OA_ID);
        console.log("Access Token:", accessToken);

        const url = " https://openapi.zalo.me/v3.0/oa/message/cs";

        const body = {
            recipient: {
                user_id: conversationId,
            },
            message: {
                text: messageText,
            },
        };

        const headers = {
            "Content-Type": "application/json",
            "access_token": accessToken,  // Token cấp quyền
        };

        const response = await axios.post(url, body, { headers })
        return response.data;
    },

    async sendImageToZalo(conversationId, staffId, messageText, imageUrl) {
        const accessToken = await getValidAccessToken(env.ZALO_OA_ID);
        console.log("Access Token:", accessToken);

        const url = " https://openapi.zalo.me/v3.0/oa/message/cs";

        const body = {
            recipient: {
                user_id: conversationId,
            },
            message: {
                text: messageText,
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "media",
                        elements: [{
                            "media_type": "image",
                            "url": imageUrl
                        }]
                    },
                }
            },
        };

        const headers = {
            "Content-Type": "application/json",
            "access_token": accessToken,  // Token cấp quyền
        };

        const response = await axios.post(url, body, { headers });
        console.log('Image sent to Zalo:', response.data);


        if (response.data && response.data.error) {
            console.log("Xoá file đã upload do gửi tin nhắn thất bại:", imageUrl);
            const filePath = path.join(process.cwd(), imageUrl);
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error("❌ Không xóa được file:", err.message);
                } else {
                    console.log(`🗑️ File đã bị xóa: ${filePath}`);
                }
            });
            throw new Error('Failed to send image to Zalo');
        } else {
            console.log('Response from Zalo:', response);
            const conversation = await conversationService.createConversation(conversationId);
            const message = await messageService.saveMessage(conversation.conversation_id, SENDER.STAFF, staffId, messageText, MESSAGE_TYPE.IMAGE, { url: imageUrl });
            emitNewMessage(conversation, message);
            return 'Send image to Zalo successfully';
        }
    }
};
