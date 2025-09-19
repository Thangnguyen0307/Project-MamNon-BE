import { getValidAccessToken } from "../../services/zalo/zaloToken.service.js";
import { getIO } from "../socket.js";
import axios from "axios";
import { env } from "../../config/environment.js";

export default function messageEvents(socket, io) {
    console.log("Client đang lắng nghe:", socket.id);
    // Socket ở đây chỉ để subscribe thêm nếu cần

    // Nhận sự kiện gửi tin nhắn từ FE
    socket.on('send_message', async ({ userId, messageText }) => {
        try {
            // Gửi tin nhắn qua Zalo API
            const response = await sendMessageToZalo(userId, messageText);
            console.log('Message sent to Zalo:', response);

            // Phát sự kiện trả lời cho FE (hoặc thông báo lỗi nếu có)
            socket.emit('send_message_response', { success: true, response });
        } catch (error) {
            console.error('Error sending message to Zalo:', error);
            socket.emit('send_message_response', { success: false, message: 'Error sending message' });
        }
    });
}

// Hàm emit new_message ra tất cả agent
export function emitNewMessage(conversation, newMessage) {
    const io = getIO();
    if (!io) return;
    io.emit("new_message", { conversation, newMessage });
}

async function sendMessageToZalo(userId, messageText) {
    const accessToken = await getValidAccessToken(env.ZALO_OA_ID);
    console.log("Access Token:", accessToken);

    const url = "https://openapi.zalo.me/v2.0/oa/message";

    const body = {
        recipient: {
            user_id: userId,
        },
        message: {
            text: messageText,
        },
    };

    const headers = {
        "Content-Type": "application/json",
        "access_token": accessToken,  // Token cấp quyền
    };

    const response = await axios.post(url, body, { headers });
    return response.data;
}