import axios from 'axios';
import qs from 'qs';
import { env } from '../config/environment.js';
import { saveZaloToken } from '../services/zalo/zaloToken.service.js';
import { getVerifierByState } from '../services/zalo/zaloOA.service.js';
import { conversationService } from '../services/zalo/conversation.service.js';
import { messageService } from '../services/zalo/message.service.js';
import { SENDER } from '../constants/sender.constant.js';

export const WebhookController = {
    async handleEnvent(req, res) {
        try {
            const event = req.body;
            console.log("Inbound webhook:", JSON.stringify(event, null, 2));

            // TODO: lưu DB
            // ví dụ: nếu là tin nhắn từ user
            switch (event.event_name) {

                case "user_send_text":
                    console.log("Received a text message sent by customer");
                    const userId = event.sender.id;
                    const recipientId = event.recipient.id;
                    const text = event.message.text;

                    console.log(`User ID: ${userId}`);
                    console.log(`Recipient ID: ${recipientId}`);
                    console.log(`Message Text: ${text}`);

                    // Xử lý tin nhắn ở đây (ví dụ: lưu vào DB, gửi phản hồi, v.v.)
                    const coversation = await conversationService.createConversation(userId, recipientId);
                    await messageService.saveMessage(coversation.conversation_id, SENDER.USER, userId, text);
                    // socket emit sự kiện có tin nhắn mới

                    break;

                case "oa_send_text":
                    console.log("Received a text message sent by OA");
                    break;
                default:
                    console.log(`Unhandled event type: ${event.event_name}`);
            }
            res.sendStatus(200);
        } catch (err) {
            console.error("Webhook error:", err);
            res.sendStatus(500);
        }
    },

    async handleCallback(req, res) {
        try {
            const { code, oa_id, state } = req.query;
            console.log("🔑 Authorization code:", code);
            console.log("OA ID:", oa_id, "State:", state);

            const code_verifier = await getVerifierByState(state);
            if (!code_verifier) {
                return res.status(400).send("Không tìm thấy code_verifier, có thể đã hết hạn");
            }

            const response = await axios.post(
                "https://oauth.zaloapp.com/v4/oa/access_token",
                qs.stringify({
                    code,
                    app_id: env.ZALO_APP_ID,
                    grant_type: "authorization_code",
                    code_verifier
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        secret_key: env.ZALO_SECRET_KEY
                    }
                }
            );

            console.log("✅ Token:", response.data);

            await saveZaloToken(
                oa_id,
                response.data.access_token,
                response.data.refresh_token,
                parseInt(response.data.expires_in)
            );

            res.send("OA liên kết thành công, token đã lưu!");
        } catch (err) {
            console.error("❌ Callback error:", err.response?.data || err.message);
            res.status(500).send("Lỗi khi lấy token");
        }
    }
};
