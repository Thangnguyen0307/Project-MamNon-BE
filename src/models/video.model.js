import mongoose from 'mongoose';

// Video lifecycle separate from Blog to allow asynchronous processing (Level 2 UX)
const videoSchema = new mongoose.Schema({
  originalName: { type: String },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog', default: null },
  status: { type: String, enum: ['uploading', 'uploaded', 'processing', 'ready', 'failed'], default: 'uploading' },// new- dua id ve frontend, sau do uptung chunnk vo id
  totalChunks: { type: Number },
  receivedChunks: { type: Number, default: 0 },
  m3u8: { type: String },
  thumbnail: { type: String },
  error: { type: String },
  processingStartedAt: { type: Date },
  processingEndedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export const Video = mongoose.model('Video', videoSchema);
