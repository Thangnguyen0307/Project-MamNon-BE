import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
    {
        conversation_id: { type: String, required: true, unique: true },  // Mã hash của user_id và admin_id
        user_id: { type: String, required: true },  // ID của khách hàng (user)
        admin_id: { type: String, required: true },  // ID của admin (cố định)
        user_name: { type: String },  // Tên người gửi (user)
        user_avatar: { type: String },  // Avatar người gửi (user)

        last_message: {
            sender_id: { type: String },
            message: { type: String },
            createdAt: { type: Date },
        },
    },
    { timestamps: true }
);
conversationSchema.index({ "last_message.createdAt": -1 });
export const Conversation = mongoose.model('Conversation', conversationSchema);
