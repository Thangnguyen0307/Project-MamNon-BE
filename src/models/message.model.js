import mongoose from 'mongoose';
import { SENDER } from '../constants/sender.constant.js';
import { MESSAGE_TYPE } from '../constants/message-type.constant.js';

const messageSchema = new mongoose.Schema(
    {
        conversation_id: { type: String, required: true },  // Liên kết với conversation_id
        sender_id: { type: String, required: true },  // ID người gửi (staff hoặc user)
        message: { type: String, required: true },
        sender: { type: String, enum: [SENDER.USER, SENDER.STAFF, SENDER.ADMIN], required: true },  // Phân biệt giữa staff và user
        type: { type: String, enum: [MESSAGE_TYPE.IMAGE, MESSAGE_TYPE.LINK, MESSAGE_TYPE.TEXT, MESSAGE_TYPE.STICKER], require: true },  // Loại tin nhắn
        metadata: { type: mongoose.Schema.Types.Mixed }, // Lưu metadata như URL, fileName, thumbnail...
    },
    { timestamps: true }
);
messageSchema.index({ conversation_id: 1, createdAt: -1 });
export const Message = mongoose.model('Message', messageSchema);
