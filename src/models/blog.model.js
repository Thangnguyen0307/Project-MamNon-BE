import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    images: [{ type: String }], // Array of image paths
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastEditedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
}, { timestamps: true });

export const Blog = mongoose.model('Blog', blogSchema);
