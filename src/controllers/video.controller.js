import { initVideo, saveVideoChunk, finalizeIfDone } from '../services/video.service.js';

export const initVideoUpload = async (req, res) => {
  try {
    const { originalName, totalChunks } = req.body;
    const doc = await initVideo({ originalName, totalChunks });
    return res.status(200).json({ success:true, message:'Init video ok', data: doc });
  } catch (e){
    return res.status(500).json({ success:false, message: e.message });
  }
};

export const uploadVideoChunkGeneric = async (req, res) => {
  try {
    const videoId = req.params.id;
    const { chunkIndex, totalChunks } = req.body;
    if (!videoId || chunkIndex === undefined || !totalChunks) return res.status(400).json({ success:false, message:'Missing chunk params' });
    if (!req.files || !req.files[0]) return res.status(400).json({ success:false, message:'Missing file chunk' });
    const { received, done } = await saveVideoChunk({ videoId, chunkIndex: Number(chunkIndex), totalChunks: Number(totalChunks), buffer: req.files[0].buffer });
    const statusDoc = await finalizeIfDone(videoId);
    if (!done){
      return res.status(200).json({ success:true, message:'Chunk received', data:{ received, done:false, status: statusDoc.status } });
    }
    return res.status(200).json({ success:true, message:'All chunks received - processing scheduled', data:{ received, done:true, status: statusDoc.status } });
  } catch (e){
    return res.status(500).json({ success:false, message: e.message });
  }
};
