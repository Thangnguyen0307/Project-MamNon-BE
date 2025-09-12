import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true }, // ví dụ "Mầm 1"
  level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
  schoolYear: { type: String, required: true }, // ví dụ "2024-2025"

  // Một lớp có nhiều giáo viên
  teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Ràng buộc: unique name + schoolYear
classSchema.index({ name: 1, schoolYear: 1 }, { unique: true });

export const Class = mongoose.model('Class', classSchema);