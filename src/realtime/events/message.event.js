import axios from 'axios';
import { env } from '../../config/environment.js';  // Lấy Zalo token từ môi trường
import { getValidAccessToken } from '../../services/zalo/zaloToken.service.js';

export default function messageEvents(socket, io) {
    console.log("Client lắng nghe message events:", socket.id);

    // Sự kiện staff gửi tin nhắn cho khách hàng
    socket.on("staff_send_message", async (data) => {
        const { userId, messageText, staffId } = data;

        // Kiểm tra dữ liệu hợp lệ
        if (!userId || !messageText || !staffId) {
            return socket.emit('message_error', { message: 'Invalid input data' });
        }

        // Gọi Zalo API để gửi tin nhắn từ OA tới user
        try {
            const zaloResponse = await sendMessageToZaloOA(userId, messageText, staffId);

            // Phát sự kiện thông báo gửi thành công
            socket.emit('message_sent', {
                message: 'Message sent successfully',
                response: zaloResponse.data,  // Trả về thông tin từ Zalo API
                userId
            });
        } catch (error) {
            console.error('Error sending message to Zalo:', error);
            socket.emit('message_error', { message: 'Failed to send message' });
        }
    });

    // Gửi tin nhắn tới Zalo OA API
    async function sendMessageToZaloOA(userId, messageText, staffId) {
        const accessToken = getValidAccessToken(env.ZALO_APP_ID);
        try {
            const response = await axios.post(
                'https://openapi.zalo.me/v2.0/oa/message',
                {
                    user_id: userId,
                    message: messageText,
                    staff_id: staffId,  // ID của staff (admin hoặc agent) gửi tin nhắn
                },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            return response;
        } catch (error) {
            throw new Error('Error sending message to Zalo OA API');
        }
    }
}
