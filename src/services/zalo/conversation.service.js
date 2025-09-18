import axios from "axios";
import { Conversation } from "../../models/conversation.model.js";
import { env } from "../../config/environment.js";

export const conversationService = {

    async createConversation(userId, adminId) {

        const ids = [userId, adminId].sort(); // Sort theo thứ tự tăng dần
        const conversation_id = ids.join('-'); // Nối với dấu '-'

        // Kiểm tra nếu Conversation đã tồn tại
        let conversation = await Conversation.findOne({ conversation_id });


        // Nếu chưa có, tạo mới conversation
        if (!conversation) {
            conversation = await Conversation.create({
                user_id: userId,
                admin_id: adminId,
                conversation_id,
            });

            // Lấy thông tin người dùng từ Zalo API (user_name, user_avatar)
            try {
                const userInfo = await axios.get(`https://openapi.zalo.me/v3.0/oa/getprofile?user_id=${userId}`, {
                    headers: { 'access_token': env.ZALO_ACCESS_TOKEN }
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


};