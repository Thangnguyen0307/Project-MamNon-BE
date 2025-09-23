import { Server } from 'socket.io';
import { env } from '../../config/environment.js';
import { jwtUtils } from '../../utils/jwt.util.js';
import { ROOMS } from './video.event.js';

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

  // Auth middleware
  ioInstance.use((socket, next) => {
    try {
      const raw = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      const token = raw?.replace(/^Bearer\s+/i, '') || '';
      if (!token) return next();
      const payload = jwtUtils.verifyAccessToken(token);
      socket.data.user = { userId: payload.userId, role: payload.role };
      return next();
    } catch (e) {
      return next();
    }
  });

  ioInstance.on('connection', (socket) => {
    const uid = socket.data?.user?.userId;
    if (uid) socket.join(ROOMS.user(uid));
  });

  return ioInstance;
}

export function getIO(){
  return ioInstance;
}
