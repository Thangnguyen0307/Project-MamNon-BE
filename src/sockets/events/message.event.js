import { getIO } from "../index.js";
import { messageService } from "../../services/zalo/message.service.js";
import { conversationService } from "../../services/zalo/conversation.service.js";
import { SENDER } from "../../constants/sender.constant.js";
import { MESSAGE_TYPE } from "../../constants/message-type.constant.js";

export default function messageEvents(socket, io) {
    console.log("Client đang lắng nghe:", socket.id);
    // Socket ở đây chỉ để subscribe thêm nếu cần

    // Nhận sự kiện gửi tin nhắn từ FE
    socket.on('send_message', async ({ conversationId, messageText, staffId }) => {
        // Gửi tin nhắn qua Zalo API
        console.log("Received send_message event:", { conversationId, messageText, staffId });


        const response = await messageService.sendMessageToZalo(conversationId, messageText);

        if (response && response.error) {
            console.error("❌ Lỗi khi gửi tin nhắn đến Zalo:", response);
        } else {
            console.log('Response from Zalo:', response);
            const conversation = await conversationService.createConversation(userId);
            const message = await messageService.saveMessage(conversation.conversation_id, SENDER.STAFF, staffId, messageText, MESSAGE_TYPE.TEXT);
            emitNewMessage(conversation, message);
        }
    });
}

// Hàm emit new_message ra tất cả agent
export function emitNewMessage(conversation, newMessage) {
    const io = getIO();
    if (!io) return;
    io.emit("new_message", { conversation, newMessage });
}