import mongoose from 'mongoose';

const levelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Mầm, Chồi, Lá
}, { timestamps: true });

export const Level = mongoose.model('Level', levelSchema);