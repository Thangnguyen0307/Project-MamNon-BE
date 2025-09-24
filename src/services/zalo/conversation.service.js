import axios from "axios";
import { Conversation } from "../../models/conversation.model.js";
import { env } from "../../config/environment.js";
import { getValidAccessToken } from "./zaloToken.service.js";

export const conversationService = {

    async createConversation(conversationId) {
        
        // Kiểm tra nếu Conversation đã tồn tại
        let conversation = await Conversation.findOne({ conversation_id: conversationId });
        // Nếu chưa có, tạo mới conversation
        if (!conversation) {
            conversation = await Conversation.create({
                conversation_id: conversationId, 
            });

            // Lấy thông tin người dùng từ Zalo API (user_name, user_avatar)
            try {
                const access_token = await getValidAccessToken(env.ZALO_OA_ID);
                const userInfo = await axios.get(`https://openapi.zalo.me/v2.0/oa/getprofile?user_id=${conversationId}`, {
                    headers: { 'access_token': access_token }
                });

                console.log('User info from Zalo:', userInfo);

                conversation.user_name = userInfo.data.data.fullname;
                conversation.user_avatar = userInfo.data.data.avatar;
                await conversation.save(); // Lưu thông tin người dùng
            } catch (error) {
                console.error('Error fetching user profile from Zalo:', error);
            }
        }
        return conversation;
    },

    async getAllConversations({ skip = 0, limit = 20 }) {
        const conversations = await Conversation.find()
            .sort({ "last_message.createdAt": -1 }) // sắp xếp theo tin nhắn mới nhất
            .skip(skip)
            .limit(limit)
            .lean(); // trả về object thuần JS

        const total = await Conversation.countDocuments();
        const pages = Math.ceil(total / limit);

        return { conversations, total, pages };
    }


};