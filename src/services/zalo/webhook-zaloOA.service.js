import { conversationService } from './conversation.service.js';
import { messageService } from './message.service.js';
import { SENDER } from '../../constants/sender.constant.js';
import axios from 'axios';
import qs from 'qs';
import { env } from '../../config/environment.js';
import { saveZaloToken } from './zaloToken.service.js';
import { getVerifierByState } from './zaloOA.service.js';
import { emitNewMessage } from '../../sockets/events/message.event.js';
import { MESSAGE_TYPE } from '../../constants/message-type.constant.js';
import { zaloUtil } from '../../utils/zalo.util.js';

export const webhookZaloService = {
    async handleEnvent(event) {
        console.log("Inbound webhook:", JSON.stringify(event, null, 2));

        const senderId = event.sender.id;
        const recipientId = event.recipient.id;
        const text = event.message.text;
        const metadata = event.message.attachments ? event.message.attachments[0].payload : null;

        console.log("------------------------------------")
        console.log("Metadata:", metadata);
        console.log("Sender:", zaloUtil.getSenderType(event.event_name));
        console.log("Event listeners:", zaloUtil.getEventListeners(event.event_name));
        console.log("------------------------------------")

        let conversation, newMessage, senderType, messageType;

        const sender = zaloUtil.getSenderType(event.event_name);
        const eventListeners = zaloUtil.getEventListeners(event.event_name);

        switch (sender) {
            case "user":
                console.log("Event from user:", eventListeners);
                senderType = SENDER.USER;
                conversation = await conversationService.createConversation(senderId);
                break;
            case "oa":
                console.log("Event from OA:", eventListeners);
                senderType = SENDER.ADMIN;
                conversation = await conversationService.createConversation(recipientId);
                break;
            default:
                console.log("Unknown sender type");
                return;
        }

        switch (eventListeners) {
            case "send_text":
                messageType = MESSAGE_TYPE.TEXT;
                break;
            case "send_link":
                messageType = MESSAGE_TYPE.LINK;
                break;
            case "send_image":
                messageType = MESSAGE_TYPE.IMAGE;
                break;
            case "send_sticker":
                messageType = MESSAGE_TYPE.STICKER;
                break;
            default:
                console.log("Unknown event listener");
                return;
        }
        newMessage = await messageService.saveMessage(conversation.conversation_id, senderType, senderId, text, messageType, metadata);
        emitNewMessage(conversation, newMessage);
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