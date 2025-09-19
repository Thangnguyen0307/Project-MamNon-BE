import { conversationService } from './conversation.service.js';
import { messageService } from './message.service.js';
import { SENDER } from '../../constants/sender.constant.js';
import axios from 'axios';
import qs from 'qs';
import { env } from '../../config/environment.js';
import { saveZaloToken } from './zaloToken.service.js';
import { getVerifierByState } from './zaloOA.service.js';
import { emitNewMessage } from '../../realtime/events/message.event.js';

export const webhookZaloService = {
    async handleEnvent(event) {
        console.log("Inbound webhook:", JSON.stringify(event, null, 2));

        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const text = event.message.text;
        let conversation, newMessage;

        switch (event.event_name) {

            case "user_send_text":
                console.log("Received a text message sent by customer");

                //Lưu vào DB
                conversation = await conversationService.createConversation(senderId, recipientId);
                newMessage = await messageService.saveMessage(conversation.conversation_id, SENDER.USER, senderId, text);
                // socket emit sự kiện có tin nhắn mới
                emitNewMessage(conversation, newMessage);
                break;

            case "oa_send_text":
                console.log("Received a text message sent by OA");

                conversation = await conversationService.createConversation(recipientId, senderId);
                newMessage = await messageService.saveMessage(conversation.conversation_id, SENDER.STAFF, senderId, text);
                // socket emit sự kiện có tin nhắn mới
                emitNewMessage(conversation, newMessage);
                break;
            default:
                console.log(`Unhandled event type: ${event.event_name}`);
        }
    },

    async handleCallBack(code, oa_id, state) {
        console.log("Callback oa_id:", oa_id);
        console.log("Callback app_id:", env.ZALO_APP_ID);
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
    }
}
export default webhookZaloService;