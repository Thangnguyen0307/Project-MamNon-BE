import mongoose from 'mongoose';
import { SENDER } from '../constants/sender.constant.js';

const messageSchema = new mongoose.Schema(
    {
        conversation_id: { type: String, required: true },  // Liên kết với conversation_id
        sender_id: { type: String, required: true },  // ID người gửi (staff hoặc user)
        message: { type: String, required: true },
        sender: { type: String, enum: [SENDER.USER, SENDER.STAFF], required: true },  // Phân biệt giữa staff và user
    },
    { timestamps: true }
);

export const Message = mongoose.model('Message', messageSchema);
