import j2s from 'joi-to-swagger';
import { initVideoSchema, uploadVideoChunkSchema, chunkParamsSchema } from '../validations/video.validation.js';

const VideoSchema = {
  InitVideoRequest: j2s(initVideoSchema).swagger,
  UploadVideoChunkRequest: j2s(uploadVideoChunkSchema).swagger,
  // For params, Swagger usually uses parameters instead of a body schema; we still export for reuse
  VideoIdParam: j2s(chunkParamsSchema).swagger
};

export default VideoSchema;