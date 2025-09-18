import fs from 'fs';
import path from 'path';
import { Video } from '../models/video.model.js';
import { Blog } from '../models/blog.model.js';
import { Class } from '../models/class.model.js';
import { spawn } from 'child_process';
import { registerProcessor } from '../queues/videoqueue.consumer.js';
import { addVideoEnsureJob, addVideoUploadS3Job } from '../queues/videoqueue.producer.js';
import ffmpegStatic from 'ffmpeg-static';
import { emitVideoEvent } from '../realtime/socket.js';

const FFMPEG_BIN = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

function safeSegment(s){
  if (!s) return 'unknown';
  return String(s)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g,'') // strip accents
    .replace(/[^a-zA-Z0-9-_\.\s]/g,'')
    .trim()
    .replace(/\s+/g,'-')
    .toLowerCase();
}

async function resolveStructuredBaseDir(video){
  // Desired: uploaded/video/<schoolYear>/<className>/<YYYY-MM-DD>/<videoId>
  const idStr = String(video._id);
  const created = video.createdAt ? new Date(video.createdAt) : new Date();
  const dateSeg = created.toISOString().slice(0,10); // YYYY-MM-DD
  try {
    if (video.blog){
      const blog = await Blog.findById(video.blog).populate({ path:'class', populate:{ path:'level' } });
      if (blog && blog.class){
        const schoolYear = blog.class.schoolYear || 'unknown-year';
        const className = blog.class.name || 'unknown-class';
  return path.join('uploaded','video', safeSegment(schoolYear), safeSegment(className), dateSeg, idStr);
      }
    }
  } catch {}
  // Fallback for unlinked videos
  return path.join('uploaded','video','unlinked', dateSeg, idStr);
}

async function getCurrentChunkBaseDir(video){
  const structuredBase = await resolveStructuredBaseDir(video);
  const hasChunks = (dir) => fs.existsSync(dir) && fs.readdirSync(dir).some(f=>f.startsWith('chunk_'));
  if (hasChunks(structuredBase)) return structuredBase;
  return structuredBase; // start writing here (no separate unlinked dir)
}

function runFfmpeg(args, label){
  return new Promise((resolve,reject)=>{
    const p = spawn(FFMPEG_BIN, args);
    p.stderr.on('data', d=>{ try { console.error(`📼 [${label}]`, d.toString()); } catch {} });
    p.on('error', reject);
    p.on('close', code => code === 0 ? resolve() : reject(new Error(`${label} exited with code ${code}`)) );
  });
}

async function ensureH264AAC(inputPath, outputPath){
  await runFfmpeg([
    '-y','-i', inputPath,
    '-c:v','libx264','-preset','veryfast','-crf','32',
    '-c:a','aac','-b:a','96k','-movflags','+faststart',
    outputPath
  ], 'transcode');
  const thumbnailPath = outputPath.replace(/\.(mp4|mov|mkv)$/i, '_thumbnail.jpg');
  try { await runFfmpeg(['-i', outputPath,'-ss','00:00:03','-vframes','1', thumbnailPath], 'thumbnail'); } catch {}
  return { outputPath, thumbnailPath: fs.existsSync(thumbnailPath) ? thumbnailPath : null };
}

async function convertMp4ToHLS(inputPath, outputDir, baseName){
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive:true });
  const m3u8 = path.join(outputDir, `${baseName}.m3u8`);
  await runFfmpeg([
    '-i', inputPath,
    '-c','copy',
    '-start_number','0',
    '-hls_time','10',
    '-hls_list_size','0',
    '-hls_segment_filename', path.join(outputDir, `${baseName}_%03d.ts`),
    '-f','hls', m3u8
  ], 'hls');
  try { fs.unlinkSync(inputPath); } catch {}
  return m3u8;
}

// Placeholder: upload generated HLS to S3 (or any storage)
// Implement actual S3 upload here if needed; currently logs for visibility
async function uploadHlsToS3(video){
  try {
    console.log('[Worker] Upload HLS to S3 (stub)', { videoId: String(video._id), m3u8: video.m3u8 });
    // TODO: implement upload of .m3u8 and .ts files to S3 and update DB with URLs
  } catch (e){
    throw new Error('UPLOAD_S3_FAILED: ' + e.message);
  }
}

// chunk files are written into the same base directory alongside final outputs

export async function initVideo({ originalName, totalChunks }){
  // Tạo mới với _id tự sinh (ObjectId)
  const doc = await Video.create({ originalName, totalChunks });
  return doc;
}

export async function saveVideoChunk({ videoId, chunkIndex, totalChunks, buffer }){
  const video = await Video.findById(videoId);
  if (!video) throw new Error('Video not found');
  const baseDir = await getCurrentChunkBaseDir(video);
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive:true });
  fs.writeFileSync(path.join(baseDir, `chunk_${chunkIndex}`), buffer);
  const received = fs.readdirSync(baseDir).filter(f=>f.startsWith('chunk_')).length;
  await Video.findByIdAndUpdate(videoId, { $set: { totalChunks }, $setOnInsert:{ status:'uploading' }, receivedChunks: received });
  try { console.log('[API] saveChunk', { videoId: String(videoId), chunkIndex, totalChunks, received }); } catch {}
  return { received, done: received === Number(totalChunks) };
}

async function assembleAndProcess(video){
  const videoId = video._id;
  const baseDir = await getCurrentChunkBaseDir(video);
  const files = fs.readdirSync(baseDir).filter(f=>f.startsWith('chunk_')).sort((a,b)=>Number(a.split('_')[1]) - Number(b.split('_')[1]));
  fs.mkdirSync(baseDir, { recursive:true });
  const merged = path.join(baseDir, `${videoId}.mp4`);// moi tao path

  //76-85
  const write = fs.createWriteStream(merged);
  for (const f of files) write.write(fs.readFileSync(path.join(baseDir,f)));
  write.end();
  await new Promise(r=>write.on('close', r));
  // remove chunk files in-place to avoid extra directories
  try {
    for (const f of files){
      try { fs.unlinkSync(path.join(baseDir, f)); } catch {}
    }
  } catch {}
  // chuan hoa video ve h264 aac - xoa video chua chuan hoa
  // đưa videoID vào queue name 
  // return ve object video 
  const transcoded = path.join(baseDir, `${videoId}_transcoded.mp4`);
  const { thumbnailPath } = await ensureH264AAC(merged, transcoded);
  try { fs.unlinkSync(merged); } catch {}
  fs.renameSync(transcoded, merged);
  const m3u8Path = await convertMp4ToHLS(merged, baseDir, videoId);
  return { m3u8: '/' + m3u8Path.replace(/\\/g,'/'), thumbnail: thumbnailPath ? '/' + thumbnailPath.replace(/\\/g,'/') : null };
}

// Register processor with queue consumer (in-memory by default, pluggable to RabbitMQ)
registerProcessor(async (job) => {
  try { console.log('[Worker] Received job', job); } catch {}
  const { videoId, type } = job;
  let doc = await Video.findById(videoId);
  if (!doc) throw new Error('VIDEO_NOT_FOUND');

  const jobType = type || 'video.ensure.h264aac';
  if (jobType === 'video.ensure.h264aac'){
    if (doc.status !== 'uploaded') throw new Error('NOT_READY');
    try {
      try { console.log('[Worker] Start processing video', String(videoId)); } catch {}
      await Video.findByIdAndUpdate(videoId, { status:'processing', processingStartedAt: new Date() });
      const result = await assembleAndProcess(doc);
      doc = await Video.findByIdAndUpdate(videoId, { status:'ready', m3u8: result.m3u8, thumbnail: result.thumbnail, processingEndedAt: new Date() }, { new:true });
    try { console.log('[Worker] Processing done, status ready', { videoId: String(videoId), m3u8: doc.m3u8 }); } catch {}
  try { emitVideoEvent(videoId, 'ready', { videoId: String(videoId), m3u8: doc.m3u8, thumbnail: doc.thumbnail, status: 'ready' }); } catch {}
      if (doc.blog) {
        await Blog.findByIdAndUpdate(doc.blog, { $addToSet: { videos: doc._id } });
      }
      // Chain next step: upload HLS to S3 (optional)
      try { await addVideoUploadS3Job({ videoId: String(videoId) }); } catch {}
    } catch (err){
    try { console.error('[Worker] Processing failed', String(videoId), err.message); } catch {}
    await Video.findByIdAndUpdate(videoId, { status:'failed', error: err.message, processingEndedAt: new Date() });
  try { emitVideoEvent(videoId, 'failed', { videoId: String(videoId), error: err.message, status: 'failed' }); } catch {}
    }
    return;
  }

  if (jobType === 'video.upload.s3.hls'){
    if (doc.status !== 'ready') throw new Error('NOT_READY');
    await uploadHlsToS3(doc);
    return;
  }

  // Unknown job types are acknowledged silently
});

export async function finalizeIfDone(videoId){
  const doc = await Video.findById(videoId);
  if (!doc) throw new Error('Video not found');
  if (doc.status === 'ready' || doc.status === 'processing') return doc;
  if (doc.receivedChunks === doc.totalChunks){
    try { console.log('[API] finalizeIfDone -> scheduling', { videoId: String(videoId), received: doc.receivedChunks, total: doc.totalChunks }); } catch {}
    await Video.findByIdAndUpdate(videoId, { status:'uploaded' });
    await addVideoEnsureJob(videoId);
  }
  return await Video.findById(videoId);
}

export async function linkVideosToBlog(videoIds, blogId){
  if (!videoIds || !videoIds.length) return;
  const videos = await Video.find({ _id: { $in: videoIds } });
  for (const v of videos){
    if (!v.blog) v.blog = blogId;
    if (v.status === 'ready'){
      // Ensure blog has video reference
      await Blog.findByIdAndUpdate(blogId, { $addToSet: { videos: v._id } });
      // If assets exist in an old/unlinked directory, move them into structured path
      if (v.m3u8){
        try {
          const currentM3u8Path = v.m3u8.startsWith('/') ? v.m3u8.slice(1) : v.m3u8; // strip leading slash
          const currentFullPath = path.join(process.cwd(), currentM3u8Path);
          const currentDir = path.dirname(currentFullPath);
          const destBase = await resolveStructuredBaseDir({ _id: v._id, blog: blogId });
          const destDir = path.join(process.cwd(), destBase);
          if (currentDir !== destDir && fs.existsSync(currentDir)){
            fs.mkdirSync(destDir, { recursive:true });
            // Move all files
            const files = fs.readdirSync(currentDir);
            for (const f of files){
              const src = path.join(currentDir, f);
              const dst = path.join(destDir, f);
              try { fs.renameSync(src, dst); } catch (e) {
                // if rename fails (cross-device), fallback copy
                try { fs.copyFileSync(src, dst); fs.unlinkSync(src); } catch {}
              }
            }
            // remove old directory if empty
            try { fs.rmdirSync(currentDir); } catch {}
            // Update stored paths
            const newM3u8 = '/' + path.join(destBase, path.basename(currentFullPath)).replace(/\\/g,'/');
            let newThumb = v.thumbnail;
            if (v.thumbnail){
              const thumbName = path.basename(v.thumbnail);
              newThumb = '/' + path.join(destBase, thumbName).replace(/\\/g,'/');
            }
            v.m3u8 = newM3u8;
            v.thumbnail = newThumb;
          }
        } catch (err){
          console.log('Relocate video assets failed:', err.message);
        }
      }
    }
    await v.save();
  }
}

export async function getVideoStatus(videoId){
  const v = await Video.findById(videoId).lean();
  if (!v) throw new Error('Video not found');
  return v;
}
