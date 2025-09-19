import { Server } from 'socket.io';
import { env } from '../config/environment.js';
import { jwtUtils } from '../utils/jwt.util.js';
import { Video } from '../models/video.model.js';
import { Blog } from '../models/blog.model.js';

let ioInstance = null;

export function initSocket(httpServer) {
  const origins = Array.isArray(env.CORS_ORIGIN) ? env.CORS_ORIGIN : ['*'];
  ioInstance = new Server(httpServer, {
    cors: {
      origin: origins.includes('*') ? '*' : origins,
      methods: ['GET','POST','PUT','DELETE','OPTIONS'],
      credentials: true
    }
  });

  ioInstance.on('connection', async (socket) => {
    // Optional JWT auth from client query or headers
    let user = null;
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i,'');
      if (token) user = jwtUtils.verifyAccessToken(token);
    } catch {}
    // Client can join a room per video to receive events
    socket.on('subscribeVideo', async ({ videoId }) => {
      try {
        if (!videoId) return;
        const v = await Video.findById(videoId).select('blog');
        if (!v) return; // silently ignore
        let allowed = false;
        if (user && v.blog) {
          const b = await Blog.findById(v.blog).select('lastEditedBy');
          if (b && b.lastEditedBy && String(b.lastEditedBy) === String(user.userId)) {
            // Strict: only the last editor receives events (on create, lastEditedBy = author)
            allowed = true;
          }
        }
        if (!allowed) return; // not allowed
        socket.join(`video:${String(videoId)}`);
        socket.emit('subscribed', { room: `video:${String(videoId)}` });
      } catch {}
    });

    socket.on('unsubscribeVideo', ({ videoId }) => {
      if (!videoId) return;
      socket.leave(`video:${String(videoId)}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

export function emitVideoEvent(videoId, event, data) {
  if (!ioInstance) return;
  const room = `video:${String(videoId)}`;
  ioInstance.to(room).emit(event, data);
}
