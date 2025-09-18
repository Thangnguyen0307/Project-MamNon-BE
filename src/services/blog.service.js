import { Blog } from "../models/blog.model.js";
import { Class } from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { toBlogResponse } from "../mappers/blog.mapper.js";
import { linkVideosToBlog } from './video.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ffmpegStatic from 'ffmpeg-static';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FFMPEG_BIN = process.env.FFMPEG_PATH || ffmpegStatic || 'ffmpeg';

// ============= Video Utilities =============
function runFfmpeg(args, label) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_BIN, args);
    proc.stderr.on('data', d => {/* console.log(`[${label}]`, d.toString());*/});
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(`${label} exited with code ${code}`));
      resolve();
    });
  });
}

async function ensureH264AAC(inputPath, outputPath) {
    await runFfmpeg([
        '-y', // overwrite nếu file output tồn tại
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '32',
        '-c:a', 'aac',
        '-b:a', '96k',
        '-movflags', '+faststart',
        outputPath
    ], 'transcode');
  const thumbnailPath = outputPath.replace(/\.(mp4|mov|mkv)$/i, '_thumbnail.jpg');
  try {
    await runFfmpeg(['-i', outputPath, '-ss', '00:00:03', '-vframes', '1', thumbnailPath], 'thumbnail');
    return { outputPath, thumbnailPath };
  } catch {
    return { outputPath, thumbnailPath: null };
  }
}

async function convertMp4ToHLS(inputPath, outputDir, baseName) {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const m3u8 = path.join(outputDir, `${baseName}.m3u8`);
  await runFfmpeg([
    '-i', inputPath,
    '-c', 'copy',
    '-start_number', '0',
    '-hls_time', '10',
    '-hls_list_size', '0',
    '-hls_segment_filename', path.join(outputDir, `${baseName}_%03d.ts`),
    '-f', 'hls',
    m3u8
  ], 'hls');
  try { fs.unlinkSync(inputPath); } catch {}
  return m3u8;
}

// ============= Single Video Upload =============
export async function processBlogVideo(file) {
  if (!file) throw new Error('Thiếu file video');
  const videoId = Date.now().toString();
  const baseDir = path.join('videos', 'blogs', videoId);
  fs.mkdirSync(baseDir, { recursive: true });
  const rawPath = path.join(baseDir, `raw${path.extname(file.originalname) || '.mp4'}`);
  fs.renameSync(file.path, rawPath);
    // Giữ rawPath là file gốc, chuyển sang file transcoded riêng
    const normalizedPath = path.join(baseDir, `${videoId}.mp4`);
    const transcodedPath = path.join(baseDir, `${videoId}_transcoded.mp4`);
    fs.renameSync(rawPath, normalizedPath); // normalizedPath = bản gốc (chưa chuẩn hoá)
    const { thumbnailPath } = await ensureH264AAC(normalizedPath, transcodedPath);
    // Thay thế bản gốc bằng bản đã chuẩn hoá
    try { fs.unlinkSync(normalizedPath); } catch {}
    fs.renameSync(transcodedPath, normalizedPath);
    const m3u8Path = await convertMp4ToHLS(normalizedPath, baseDir, videoId);
  return {
    m3u8: '/' + m3u8Path.replace(/\\/g, '/'),
    thumbnail: thumbnailPath ? '/' + thumbnailPath.replace(/\\/g, '/') : null
  };
}

// ============= Chunked Upload Logic =============
const CHUNK_ROOT = path.join('uploads', 'chunks', 'blogs');
function chunkDir(videoId) { return path.join(CHUNK_ROOT, videoId); }

export async function saveVideoChunk({ videoId, chunkIndex, totalChunks, buffer }) {
  if (!videoId) throw new Error('Missing videoId');
  if (!fs.existsSync(chunkDir(videoId))) fs.mkdirSync(chunkDir(videoId), { recursive: true });
  const filePath = path.join(chunkDir(videoId), `chunk_${chunkIndex}`);
  fs.writeFileSync(filePath, buffer);
  const received = fs.readdirSync(chunkDir(videoId)).filter(f => f.startsWith('chunk_')).length;
  return { received, done: received === Number(totalChunks) };
}

export async function assembleChunksAndProcess(videoId, originalName) {
  const dir = chunkDir(videoId);
  if (!fs.existsSync(dir)) throw new Error('Chunks not found');
  const files = fs.readdirSync(dir).filter(f => f.startsWith('chunk_')).sort((a,b)=>{
    const ai = Number(a.split('_')[1]);
    const bi = Number(b.split('_')[1]);
    return ai - bi;
  });
  const baseDir = path.join('videos', 'blogs', videoId);
  fs.mkdirSync(baseDir, { recursive: true });
  const mergedPath = path.join(baseDir, `${videoId}.mp4`);
  const write = fs.createWriteStream(mergedPath);
  for (const f of files) {
    write.write(fs.readFileSync(path.join(dir, f)));
  }
  write.end();
  await new Promise(r => write.on('close', r));
  fs.rmSync(dir, { recursive: true, force: true });
    const transcodedPath = path.join(baseDir, `${videoId}_transcoded.mp4`);
    const { thumbnailPath } = await ensureH264AAC(mergedPath, transcodedPath);
    try { fs.unlinkSync(mergedPath); } catch {}
    fs.renameSync(transcodedPath, mergedPath);
    const m3u8Path = await convertMp4ToHLS(mergedPath, baseDir, videoId);
  return {
    m3u8: '/' + m3u8Path.replace(/\\/g, '/'),
    thumbnail: thumbnailPath ? '/' + thumbnailPath.replace(/\\/g, '/') : null,
    originalName: originalName || ''
  };
}

// ============= Blog Service =============
export const blogService = {
    
    async create(blogData, imageFiles, authorId) {
        // Validate class exists
        const classInstance = await Class.findById(blogData.class);
        if (!classInstance) {
            throw { status: 404, message: "Không tìm thấy lớp học" };
        }

        // Validate author exists
        const author = await User.findById(authorId);
        if (!author) {
            throw { status: 404, message: "Không tìm thấy tác giả" };
        }

        // Process image paths
        const imagePaths = imageFiles ? imageFiles.map(file => `/images/blogs/${file.filename}`) : [];

        // Extract and normalize videoIds (can be string, CSV string, or array)
        const hex24 = /^[0-9a-fA-F]{24}$/;
        let videoIds = [];
        if (blogData.videoIds) {
            if (Array.isArray(blogData.videoIds)) {
                videoIds = blogData.videoIds;
            } else if (typeof blogData.videoIds === 'string') {
                // Support CSV like "id1,id2" or with spaces
                videoIds = blogData.videoIds
                  .split(',')
                  .map(s => s.trim())
                  .filter(Boolean);
            } else {
                videoIds = [String(blogData.videoIds)];
            }
        }
        // Filter invalid ids and de-duplicate
        const beforeCount = videoIds.length;
        videoIds = Array.from(new Set(videoIds.filter(id => hex24.test(id))));
        if (beforeCount && videoIds.length === 0) {
            console.log('Link videoIds skipped: all provided IDs invalid format');
        } else if (videoIds.length < beforeCount) {
            console.log(`Link videoIds: filtered ${beforeCount - videoIds.length} invalid IDs`);
        }

        const { videoIds: _omitVideoIds, ...rest } = blogData; // avoid storing raw videoIds field

        const blog = new Blog({
            ...rest,
            author: authorId,
            images: imagePaths
        });
        
        await blog.save();

        // Link videos asynchronously (attach ready ones now, others later when processed)
        if (videoIds.length) {
            try {
                await linkVideosToBlog(videoIds, blog._id);
            } catch (e) {
                // Non-blocking: log and continue
                console.log('Link videoIds failed:', e.message);
            }
        }
        
        // Populate for response
        await blog.populate([
            {
                path: 'author',
                select: 'email fullName'
            },
            {
                path: 'class',
                select: 'name level',
                populate: {
                    path: 'level',
                    select: 'name'
                }
            },
            { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
        ]);
        
        return toBlogResponse(blog);
    },

    async getAll(query = {}) {
        const { page = 1, limit = 10, search, class: classId, author } = query;
        const filter = {};
        
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (classId) {
            filter.class = classId;
        }
        
        if (author) {
            filter.author = author;
        }

        const blogs = await Blog.find(filter)
            .populate([
                {
                    path: 'author',
                    select: 'email fullName'
                },
                {
                    path: 'class',
                    select: 'name level',
                    populate: {
                        path: 'level',
                        select: 'name'
                    }
                },
                { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
            ])
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Blog.countDocuments(filter);

        return {
            blogs: blogs.map(toBlogResponse),
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    },

    async getById(id) {
        const blog = await Blog.findById(id)
            .populate([
                {
                    path: 'author',
                    select: 'email fullName'
                },
                {
                    path: 'class',
                    select: 'name level',
                    populate: {
                        path: 'level',
                        select: 'name'
                    }
                },
                { path: 'videos', select: '_id m3u8 thumbnail status createdAt' }
            ]);
            
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }
        
        return toBlogResponse(blog);
    },

    async update(id, updateData, newImageFiles, userId) {
        const blog = await Blog.findById(id);
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }

        // Check if user is the author or admin
        if (blog.author.toString() !== userId) {
            const user = await User.findById(userId);
            if (user.role !== 'ADMIN') {
                throw { status: 403, message: "Không có quyền chỉnh sửa bài viết này" };
            }
        }

        // Validate class exists (if provided)
        if (updateData.class) {
            const classInstance = await Class.findById(updateData.class);
            if (!classInstance) {
                throw { status: 404, message: "Không tìm thấy lớp học" };
            }
        }

        // Delete old images if new images are uploaded
        if (newImageFiles && newImageFiles.length > 0 && blog.images && blog.images.length > 0) {
            blog.images.forEach(imagePath => {
                const oldImagePath = path.join(__dirname, '../../images/blogs', path.basename(imagePath));
                try {
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                } catch (error) {
                    console.log('Error deleting old image:', error);
                }
            });
        }

        // Process new image paths
        const newImagePaths = newImageFiles ? newImageFiles.map(file => `/images/blogs/${file.filename}`) : undefined;

        // Update blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            id,
            {
                ...updateData,
                ...(newImagePaths && { images: newImagePaths })
            },
            { new: true }
        ).populate([
            {
                path: 'author',
                select: 'email fullName'
            },
            {
                path: 'class',
                select: 'name level',
                populate: {
                    path: 'level',
                    select: 'name'
                }
            }
        ]);

        return toBlogResponse(updatedBlog);
    },

    async delete(id, userId) {
        const blog = await Blog.findById(id);
        if (!blog) {
            throw { status: 404, message: "Không tìm thấy bài viết" };
        }

        // Check if user is the author or admin
        if (blog.author.toString() !== userId) {
            const user = await User.findById(userId);
            if (user.role !== 'ADMIN') {
                throw { status: 403, message: "Không có quyền xóa bài viết này" };
            }
        }

        // Delete image files
        if (blog.images && blog.images.length > 0) {
            blog.images.forEach(imagePath => {
                const fullImagePath = path.join(__dirname, '../../images/blogs', path.basename(imagePath));
                try {
                    if (fs.existsSync(fullImagePath)) {
                        fs.unlinkSync(fullImagePath);
                    }
                } catch (error) {
                    console.log('Error deleting image:', error);
                }
            });
        }

        await Blog.findByIdAndDelete(id);
        
        return { message: "Xóa bài viết thành công" };
    }
    ,
    async addVideo(blogId, videoData, userId){
        const blog = await Blog.findById(blogId);
        if(!blog) throw { status:404, message:'Không tìm thấy bài viết' };
        // permission: author or admin/teacher (reuse existing pattern)
        if (blog.author.toString() !== userId){
            const user = await User.findById(userId);
            if (!user || (user.role !== 'ADMIN' && user.role !== 'TEACHER')){
                throw { status:403, message:'Không có quyền thêm video' };
            }
        }
        // Cho phép truyền vào videoId hoặc object chứa _id
        const videoId = videoData?._id || videoData?.videoId || videoData;
        if (!videoId) throw { status:400, message:'Thiếu videoId để gắn vào bài viết' };
        blog.videos.addToSet(videoId);
        await blog.save();
        await blog.populate([
            { path:'author', select:'email fullName' },
            { path:'class', select:'name level', populate:{ path:'level', select:'name'} }
            ,{ path:'videos', select:'_id m3u8 thumbnail status createdAt' }
        ]);
        return toBlogResponse(blog);
    }
};